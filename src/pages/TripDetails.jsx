import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Wallet, Users, Trash2, CheckSquare, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import StopTimeline from '../components/trip/StopTimeline';
import ActivityList from '../components/trip/ActivityList';

export default function TripDetail() {
    const tripId = new URLSearchParams(window.location.search).get('id') ||
        window.location.pathname.split('/trips/')[1];
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedStop, setSelectedStop] = useState(null);

    // Completion flow state
    const [showMissingComment, setShowMissingComment] = useState(false);
    const [missingComment, setMissingComment] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 5, review: '' });
    const [isCompleted, setIsCompleted] = useState(false);

    const { data: trips = [] } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list(),
    });
    const trip = trips.find(t => t.id === tripId);

    const { data: stops = [] } = useQuery({
        queryKey: ['stops', tripId],
        queryFn: () => base44.entities.Stop.filter({ trip_id: tripId }, 'order_index'),
        enabled: !!tripId,
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities', tripId],
        queryFn: () => base44.entities.Activity.filter({ trip_id: tripId }),
        enabled: !!tripId,
    });

    const { data: checklistItems = [] } = useQuery({
        queryKey: ['checklist', tripId],
        queryFn: () => base44.entities.ChecklistItem.filter({ trip_id: tripId }),
        enabled: !!tripId,
    });

    const addStopMutation = useMutation({
        mutationFn: (data) => base44.entities.Stop.create({ ...data, trip_id: tripId, order_index: stops.length }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stops', tripId] }),
    });

    const deleteStopMutation = useMutation({
        mutationFn: (id) => base44.entities.Stop.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stops', tripId] });
            if (selectedStop?.id === arguments?.[0]) setSelectedStop(null);
        },
    });

    const addActivityMutation = useMutation({
        mutationFn: (data) => base44.entities.Activity.create({ ...data, trip_id: tripId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', tripId] }),
    });

    const deleteActivityMutation = useMutation({
        mutationFn: (id) => base44.entities.Activity.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', tripId] }),
    });

    const toggleActivityMutation = useMutation({
        mutationFn: (activity) => base44.entities.Activity.update(activity.id, { completed: !activity.completed }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities', tripId] }),
    });

    const toggleChecklistMutation = useMutation({
        mutationFn: (item) => base44.entities.ChecklistItem.update(item.id, { checked: !item.checked }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist', tripId] }),
    });

    const deleteTripMutation = useMutation({
        mutationFn: () => base44.entities.Trip.delete(tripId),
        onSuccess: () => navigate('/trips'),
    });

    if (!trip) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const totalActivityCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

    // Auto-select first stop
    if (stops.length > 0 && !selectedStop) {
        setSelectedStop(stops[0]);
    }

    const handleInitiateCompletion = () => {
        const hasMissingActivities = activities.some(a => !a.completed);
        if (hasMissingActivities) {
            setShowMissingComment(true);
        } else {
            setShowFeedbackForm(true);
        }
    };

    const handleMissingCommentSubmit = () => {
        if (!missingComment.trim()) return;
        setShowMissingComment(false);
        setShowFeedbackForm(true);
    };

    const handleFeedbackSubmit = () => {
        if (!feedback.review.trim()) return;
        base44.entities.Trip.update(tripId, { 
            status: 'completed',
            feedback_rating: feedback.rating,
            feedback_review: feedback.review,
            missing_activities_comment: missingComment
        }).then(() => {
            setShowFeedbackForm(false);
            setIsCompleted(true);
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        });
    };

    return (
        <div>
            {/* Completion Modals */}
            <AnimatePresence>
                {showMissingComment && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card p-6 rounded-2xl w-full max-w-md border border-border">
                            <h2 className="text-xl font-bold font-poppins mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-accent"/> Missed Activities</h2>
                            <p className="text-muted-foreground text-sm mb-4">It looks like you didn't complete all your planned activities. Could you tell us why?</p>
                            <Textarea 
                                value={missingComment}
                                onChange={(e) => setMissingComment(e.target.value)}
                                placeholder="E.g., It rained, or we didn't have enough time..."
                                className="mb-4 bg-muted/50 border-border/50 min-h-24"
                            />
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowMissingComment(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleMissingCommentSubmit} disabled={!missingComment.trim()}>Continue</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showFeedbackForm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card p-6 rounded-2xl w-full max-w-md border border-border">
                            <h2 className="text-2xl font-bold font-poppins mb-2 text-center">Trip Feedback</h2>
                            <p className="text-muted-foreground text-sm mb-6 text-center">How was your experience in {trip.title}?</p>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setFeedback({...feedback, rating: star})}>
                                        <Star className={`w-8 h-8 ${feedback.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                                    </button>
                                ))}
                            </div>

                            <Textarea 
                                value={feedback.review}
                                onChange={(e) => setFeedback({...feedback, review: e.target.value})}
                                placeholder="Write your review here..."
                                className="mb-4 bg-muted/50 border-border/50 min-h-24"
                            />
                            
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setShowFeedbackForm(false)}>Cancel</Button>
                                <Button className="flex-1 bg-gradient-to-r from-primary to-accent text-white" onClick={handleFeedbackSubmit} disabled={!feedback.review.trim()}>Submit Review</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {isCompleted && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-card p-8 rounded-3xl text-center max-w-sm border border-border shadow-2xl">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                🎉
                            </div>
                            <h2 className="text-2xl font-bold font-poppins mb-2">Trip Completed!</h2>
                            <p className="text-muted-foreground mb-6">Thanks for your feedback. We hope you had a fantastic journey.</p>
                            <Button onClick={() => setIsCompleted(false)} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12">View Details</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                className="relative rounded-3xl overflow-hidden mb-8 h-48 md:h-64"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <img
                    src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    {trip.status !== 'completed' && (
                        <Button 
                            size="sm" 
                            className="bg-green-500/90 hover:bg-green-600 text-white rounded-xl shadow-lg border-0"
                            onClick={handleInitiateCompletion}
                        >
                            <CheckSquare className="w-4 h-4 mr-2" /> Complete Trip
                        </Button>
                    )}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <Badge className="bg-primary/30 text-primary-foreground border-0 mb-2">{trip.status}</Badge>
                            <h1 className="font-poppins font-bold text-2xl md:text-4xl text-white">{trip.title}</h1>
                            <div className="flex gap-4 mt-2 text-sm text-white/70">
                                {trip.start_date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(trip.start_date), 'MMM d')}
                                        {trip.end_date && ` — ${format(new Date(trip.end_date), 'MMM d, yyyy')}`}
                                    </span>
                                )}
                                {trip.budget > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Wallet className="w-4 h-4" /> ${trip.budget?.toLocaleString()}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" /> {trip.travel_type}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                                onClick={() => deleteTripMutation.mutate()}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-poppins font-bold">{stops.length}</p>
                    <p className="text-xs text-muted-foreground">Stops</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-poppins font-bold">{activities.length}</p>
                    <p className="text-xs text-muted-foreground">Activities</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-poppins font-bold text-accent">${totalActivityCost}</p>
                    <p className="text-xs text-muted-foreground">Est. Cost</p>
                </div>
            </div>

            {/* Itinerary Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
                {/* Left: Stop timeline */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="glass rounded-2xl p-4 sticky top-24">
                        <StopTimeline
                            stops={stops}
                            activities={activities}
                            selectedStop={selectedStop}
                            onSelectStop={setSelectedStop}
                            onAddStop={(data) => addStopMutation.mutate(data)}
                            onDeleteStop={(id) => {
                                deleteStopMutation.mutate(id);
                                if (selectedStop?.id === id) setSelectedStop(null);
                            }}
                        />
                    </div>
                </div>

                {/* Right: Activities & Package History */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="glass rounded-2xl p-6">
                        {selectedStop ? (
                            <ActivityList
                                activities={activities}
                                stop={selectedStop}
                                onAdd={(data) => addActivityMutation.mutate(data)}
                                onDelete={(id) => deleteActivityMutation.mutate(id)}
                                onToggle={(activity) => toggleActivityMutation.mutate(activity)}
                            />
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground">Select a stop to view and manage activities.</p>
                            </div>
                        )}
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-poppins font-semibold text-xl mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-primary" /> Package & Checklist History
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Check off items as you pack them to ensure nothing is left behind.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {checklistItems.map(item => (
                                <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${item.checked ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/50 hover:bg-muted/50'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={item.checked} 
                                        onChange={() => toggleChecklistMutation.mutate(item)}
                                        className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                        {item.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {checklistItems.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl text-muted-foreground text-sm">
                                No checklist items found for this trip.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}