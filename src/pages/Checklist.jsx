import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = ['clothing', 'electronics', 'documents', 'essentials', 'medical', 'toiletries', 'other'];
const CAT_ICONS = { clothing: '👕', electronics: '💻', documents: '📄', essentials: '🎒', medical: '💊', toiletries: '🧴', other: '📦' };

export default function Checklist() {
    const queryClient = useQueryClient();
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('essentials');
    const [selectedTrip, setSelectedTrip] = useState('all');
    const [filterCat, setFilterCat] = useState('all');

    const { data: trips = [] } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list('-created_date'),
    });

    const { data: items = [] } = useQuery({
        queryKey: ['checklist'],
        queryFn: () => base44.entities.ChecklistItem.list(),
    });

    const addMutation = useMutation({
        mutationFn: (data) => base44.entities.ChecklistItem.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checklist'] });
            setNewItem('');
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (item) => base44.entities.ChecklistItem.update(item.id, { checked: !item.checked }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.ChecklistItem.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklist'] }),
    });

    const filtered = items.filter(i => {
        if (selectedTrip !== 'all' && i.trip_id !== selectedTrip) return false;
        if (filterCat !== 'all' && i.category !== filterCat) return false;
        return true;
    });

    const checkedCount = filtered.filter(i => i.checked).length;
    const progress = filtered.length > 0 ? (checkedCount / filtered.length) * 100 : 0;

    const handleAdd = () => {
        if (!newItem.trim()) return;
        addMutation.mutate({ item: newItem, category: newCategory, trip_id: selectedTrip === 'all' ? (trips[0]?.id || '') : selectedTrip });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-poppins font-bold text-3xl">Packing Checklist</h1>
                <p className="text-muted-foreground text-sm mt-1">Never forget the essentials</p>
            </motion.div>

            {/* Progress */}
            <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{checkedCount} of {filtered.length} packed</span>
                    <span className="text-sm text-primary font-semibold">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                    <SelectTrigger className="w-48 bg-muted/50 border-border/50 rounded-xl">
                        <SelectValue placeholder="Filter by trip" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Trips</SelectItem>
                        {trips.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Tabs value={filterCat} onValueChange={setFilterCat}>
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {CATEGORIES.slice(0, 4).map(c => (
                            <TabsTrigger key={c} value={c}>{CAT_ICONS[c]}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Add item */}
            <motion.div className="glass rounded-2xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex gap-3">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add a packing item..."
                        className="bg-muted/50 border-border/50 rounded-xl flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="w-36 bg-muted/50 border-border/50 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => (
                                <SelectItem key={c} value={c}>{CAT_ICONS[c]} {c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 rounded-xl">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>

            {/* Items list */}
            <div className="space-y-2">
                {filtered.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <p className="text-muted-foreground">No items yet. Start adding things to pack!</p>
                    </div>
                ) : (
                    filtered.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className={`glass rounded-xl p-4 flex items-center gap-3 group ${item.checked ? 'opacity-60' : ''}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => toggleMutation.mutate(item)}
                            />
                            <span className="text-sm">{CAT_ICONS[item.category] || '📦'}</span>
                            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                {item.item}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteMutation.mutate(item.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}