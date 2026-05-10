import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StopTimeline({ stops, activities, onAddStop, onDeleteStop, selectedStop, onSelectStop }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCity, setNewCity] = useState('');
    const [newCountry, setNewCountry] = useState('');

    const handleAdd = () => {
        if (!newCity.trim()) return;
        onAddStop({ city: newCity, country: newCountry });
        setNewCity('');
        setNewCountry('');
        setShowAddForm(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Stops
                </h3>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-primary text-xs"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass rounded-xl p-3 mb-3 space-y-2"
                    >
                        <Input
                            placeholder="City name"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            className="bg-muted/50 border-border/50 rounded-lg h-9 text-sm"
                        />
                        <Input
                            placeholder="Country"
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                            className="bg-muted/50 border-border/50 rounded-lg h-9 text-sm"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAdd} className="flex-1 bg-primary hover:bg-primary/90 rounded-lg h-8 text-xs">
                                Add Stop
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-lg h-8 text-xs">
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeline */}
            <div className="relative">
                {stops.length > 1 && (
                    <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30" />
                )}

                {stops.map((stop, i) => {
                    const stopActivities = activities.filter(a => a.stop_id === stop.id);
                    const isSelected = selectedStop?.id === stop.id;

                    return (
                        <motion.div
                            key={stop.id}
                            className={`relative pl-10 py-3 cursor-pointer rounded-xl transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/30'
                                }`}
                            onClick={() => onSelectStop(stop)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {/* Dot */}
                            <div className={`absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 ${isSelected ? 'bg-primary border-primary' : 'bg-background border-primary/50'
                                }`} />

                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-sm">{stop.city}</p>
                                    <p className="text-xs text-muted-foreground">{stop.country}</p>
                                    {stopActivities.length > 0 && (
                                        <p className="text-xs text-primary mt-1">{stopActivities.length} activities</p>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => { e.stopPropagation(); onDeleteStop(stop.id); }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {stops.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                    Add your first stop to start building your itinerary.
                </p>
            )}
        </div>
    );
}