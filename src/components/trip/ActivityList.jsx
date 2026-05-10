import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const categoryIcons = {
    adventure: '🏔️',
    food: '🍜',
    nature: '🌿',
    shopping: '🛍️',
    nightlife: '🌃',
    historical: '🏛️',
    culture: '🎭',
    relaxation: '🧘',
};

export default function ActivityList({ activities, stop, onAdd, onDelete, onToggle }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', category: 'culture', cost: '', duration_hours: '', time: '', day: 1 });

    const handleAdd = () => {
        if (!form.name.trim()) return;
        onAdd({
            ...form,
            cost: Number(form.cost) || 0,
            duration_hours: Number(form.duration_hours) || 0,
            day: Number(form.day) || 1,
            stop_id: stop.id,
        });
        setForm({ name: '', category: 'culture', cost: '', duration_hours: '', time: '', day: form.day });
        setShowForm(false);
    };

    const stopActivities = activities.filter(a => a.stop_id === stop.id);
    
    // Group activities by day
    const groupedActivities = stopActivities.reduce((acc, act) => {
        const day = act.day || 1;
        if (!acc[day]) acc[day] = [];
        acc[day].push(act);
        return acc;
    }, {});
    
    const days = Object.keys(groupedActivities).map(Number).sort((a, b) => a - b);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-poppins font-semibold text-lg">{stop.city}</h3>
                    <p className="text-sm text-muted-foreground">{stop.country} · {stopActivities.length} activities</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary hover:bg-primary/90 rounded-xl text-xs"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Activity
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass rounded-xl p-4 mb-4 space-y-3"
                    >
                        <Input
                            placeholder="Activity name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="bg-muted/50 border-border/50 rounded-lg"
                        />
                        <div className="grid grid-cols-4 gap-2">
                            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                <SelectTrigger className="bg-muted/50 border-border/50 rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryIcons).map(([key, icon]) => (
                                        <SelectItem key={key} value={key}>{icon} {key}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Cost ($)"
                                value={form.cost}
                                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-lg"
                            />
                            <Input
                                type="number"
                                placeholder="Hours"
                                value={form.duration_hours}
                                onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-lg"
                            />
                            <Input
                                type="number"
                                placeholder="Day"
                                value={form.day}
                                onChange={(e) => setForm({ ...form, day: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-lg"
                                min="1"
                            />
                        </div>
                        <Input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            className="bg-muted/50 border-border/50 rounded-lg"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-primary/90 rounded-lg">
                                Add
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="rounded-lg">
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {stopActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No activities yet. Add your first one!
                    </p>
                ) : (
                    days.map(day => (
                        <div key={day} className="space-y-3">
                            <h4 className="font-poppins font-semibold text-primary">Day {day}</h4>
                            {groupedActivities[day].sort((a, b) => (a.time || '24:00').localeCompare(b.time || '24:00')).map((activity, i) => (
                                <motion.div
                                    key={activity.id}
                                    className={`glass rounded-xl p-4 flex items-start gap-3 group ${activity.completed ? 'opacity-60' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Checkbox
                                        checked={activity.completed}
                                        onCheckedChange={() => onToggle(activity)}
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{categoryIcons[activity.category] || '📍'}</span>
                                            <p className={`font-medium text-sm ${activity.completed ? 'line-through' : ''}`}>
                                                {activity.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 mt-1.5 flex-wrap">
                                            {activity.time && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {activity.time}
                                                </span>
                                            )}
                                            {activity.duration_hours > 0 && (
                                                <span className="text-xs text-muted-foreground">{activity.duration_hours}h</span>
                                            )}
                                            {activity.cost > 0 && (
                                                <span className="text-xs text-accent flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" /> {activity.cost}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                        onClick={() => onDelete(activity.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}