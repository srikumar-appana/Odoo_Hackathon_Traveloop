import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function Journal() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ trip_id: '', title: '', content: '', date: '' });

    const { data: trips = [] } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list('-created_date'),
    });

    const { data: notes = [] } = useQuery({
        queryKey: ['notes'],
        queryFn: () => base44.entities.TripNote.list('-created_date'),
    });

    const addMutation = useMutation({
        mutationFn: (data) => base44.entities.TripNote.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setDialogOpen(false);
            setForm({ trip_id: '', title: '', content: '', date: '' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.TripNote.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-poppins font-bold text-3xl">Travel Journal</h1>
                    <p className="text-muted-foreground text-sm mt-1">Capture your memories and moments</p>
                </motion.div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> New Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-border/50 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="font-poppins">New Journal Entry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <Select value={form.trip_id} onValueChange={(v) => setForm({ ...form, trip_id: v })}>
                                <SelectTrigger className="bg-muted/50 border-border/50 rounded-xl">
                                    <SelectValue placeholder="Select trip" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Entry title"
                                className="bg-muted/50 border-border/50 rounded-xl"
                            />
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-xl"
                            />
                            <Textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="Write about your experience..."
                                className="bg-muted/50 border-border/50 rounded-xl min-h-40"
                            />
                            <Button
                                onClick={() => addMutation.mutate(form)}
                                disabled={!form.title || !form.trip_id}
                                className="w-full bg-primary hover:bg-primary/90 rounded-xl"
                            >
                                Save Entry
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Timeline */}
            {notes.length === 0 ? (
                <motion.div className="glass rounded-2xl p-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No journal entries yet. Start documenting your adventures!</p>
                </motion.div>
            ) : (
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30 hidden md:block" />

                    <div className="space-y-6">
                        {notes.map((note, i) => {
                            const trip = trips.find(t => t.id === note.trip_id);
                            return (
                                <motion.div
                                    key={note.id}
                                    className="md:pl-16 relative group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-primary border-2 border-background hidden md:block" />
                                    <div className="glass rounded-2xl p-6 hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-poppins font-semibold text-lg">{note.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {trip && <span className="text-xs text-primary">{trip.title}</span>}
                                                    {note.date && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(note.date), 'MMM d, yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteMutation.mutate(note.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}