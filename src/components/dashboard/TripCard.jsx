import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Wallet, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function TripCard({ trip, index = 0 }) {
    const queryClient = useQueryClient();

    const cancelMutation = useMutation({
        mutationFn: async () => {
            return base44.entities.Trip.update(trip.id, { status: 'cancelled' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        }
    });

    const handleCancel = (e) => {
        e.preventDefault(); // Prevent Link navigation
        if (confirm('Are you sure you want to cancel this trip?')) {
            cancelMutation.mutate();
        }
    };

    return (
        <Link to={`/trips/${trip.id}`} className="block">
            <motion.div
                className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
            >
                <div className="h-40 overflow-hidden relative">
                    <img
                        src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop'}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {trip.status === 'planning' && (
                        <div className="absolute top-3 right-3 z-10">
                            <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-7 text-xs bg-red-500/90 hover:bg-red-600 shadow-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={handleCancel}
                                disabled={cancelMutation.isPending}
                            >
                                <XCircle className="w-3 h-3 mr-1" /> 
                                {cancelMutation.isPending ? '...' : 'Cancel'}
                            </Button>
                        </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <div>
                            <h3 className="text-white font-poppins font-bold text-lg">{trip.title}</h3>
                            <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {trip.travel_type || 'Adventure'}
                            </p>
                        </div>
                        <Badge className={`${trip.status === 'cancelled' ? 'bg-red-500/80 hover:bg-red-500' : 'bg-primary/80 hover:bg-primary'} border-0`}>
                            {trip.status || 'planning'}
                        </Badge>
                    </div>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/20">
                    {trip.start_date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary/70" />
                            <span className="truncate">
                                {format(new Date(trip.start_date), 'MMM d, yy')}
                            </span>
                        </div>
                    )}
                    {trip.budget > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-accent/70" />
                            <span className="truncate">${trip.budget?.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}