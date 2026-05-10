import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import StatCard from '../components/dashboard/StatCard';

const COLORS = ['#6D28D9', '#06B6D4', '#FB923C', '#10B981', '#EC4899', '#94A3B8'];
const CATEGORIES = ['stay', 'transport', 'food', 'activities', 'shopping', 'miscellaneous'];

export default function Budget() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ trip_id: '', category: 'food', amount: '', description: '', date: '' });

    const { data: trips = [] } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list('-created_date'),
    });

    const { data: expenses = [] } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => base44.entities.Expense.list('-created_date'),
    });

    const addExpenseMutation = useMutation({
        mutationFn: (data) => base44.entities.Expense.create({ ...data, amount: Number(data.amount) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setDialogOpen(false);
            setForm({ trip_id: '', category: 'food', amount: '', description: '', date: '' });
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: (id) => base44.entities.Expense.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    });

    const totalBudget = trips.reduce((s, t) => s + (t.budget || 0), 0);
    const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const remaining = totalBudget - totalSpent;
    const dailyAvg = expenses.length > 0 ? (totalSpent / Math.max(1, new Set(expenses.map(e => e.date)).size)) : 0;

    // Pie chart data
    const pieData = CATEGORIES.map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: expenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
    })).filter(d => d.value > 0);

    // Bar chart data per trip
    const barData = trips.slice(0, 6).map(t => ({
        name: t.title?.substring(0, 12) || 'Trip',
        budget: t.budget || 0,
        spent: expenses.filter(e => e.trip_id === t.id).reduce((s, e) => s + (e.amount || 0), 0),
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-poppins font-bold text-3xl">Budget Tracker</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track every penny of your travels</p>
                </motion.div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                            <Plus className="w-4 h-4 mr-2" /> Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-border/50">
                        <DialogHeader>
                            <DialogTitle className="font-poppins">Add Expense</DialogTitle>
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
                            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                <SelectTrigger className="bg-muted/50 border-border/50 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Amount ($)"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-xl"
                            />
                            <Input
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-xl"
                            />
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="bg-muted/50 border-border/50 rounded-xl"
                            />
                            <Button
                                onClick={() => addExpenseMutation.mutate(form)}
                                disabled={!form.amount || !form.trip_id}
                                className="w-full bg-primary hover:bg-primary/90 rounded-xl"
                            >
                                Add Expense
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Wallet} label="Total Budget" value={`$${totalBudget.toLocaleString()}`} gradient="from-primary to-purple-400" delay={0.1} />
                <StatCard icon={TrendingDown} label="Total Spent" value={`$${totalSpent.toLocaleString()}`} gradient="from-accent to-cyan-300" delay={0.2} />
                <StatCard icon={TrendingUp} label="Remaining" value={`$${Math.max(0, remaining).toLocaleString()}`} gradient="from-emerald-500 to-green-400" delay={0.3} />
                <StatCard icon={Wallet} label="Daily Average" value={`$${dailyAvg.toFixed(0)}`} gradient="from-orange-500 to-amber-400" delay={0.4} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="font-poppins font-semibold mb-4">Spending by Category</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4}>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'hsl(222 47% 14%)', border: '1px solid hsl(217 33% 22%)', borderRadius: '12px' }}
                                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                                    itemStyle={{ color: 'hsl(215 20% 65%)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-muted-foreground py-16">No expenses to display</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                        {pieData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-muted-foreground">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="font-poppins font-semibold mb-4">Budget vs Spent</h3>
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'hsl(222 47% 14%)', border: '1px solid hsl(217 33% 22%)', borderRadius: '12px' }}
                                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                                    itemStyle={{ color: 'hsl(215 20% 65%)' }}
                                />
                                <Bar dataKey="budget" fill="#6D28D9" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="spent" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-muted-foreground py-16">No trip data to display</p>
                    )}
                </motion.div>
            </div>

            {/* Recent expenses */}
            <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="font-poppins font-semibold mb-4">Recent Expenses</h3>
                {expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No expenses recorded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {expenses.slice(0, 15).map((exp) => {
                            const trip = trips.find(t => t.id === exp.trip_id);
                            return (
                                <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${COLORS[CATEGORIES.indexOf(exp.category) % COLORS.length]}20` }}>
                                            <span className="text-sm">
                                                {exp.category === 'food' ? '🍜' : exp.category === 'transport' ? '🚗' : exp.category === 'stay' ? '🏨' : exp.category === 'activities' ? '🎭' : exp.category === 'shopping' ? '🛍️' : '📦'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{exp.description || exp.category}</p>
                                            <p className="text-xs text-muted-foreground">{trip?.title || 'Unknown trip'} · {exp.date || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm">${exp.amount?.toFixed(2)}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteExpenseMutation.mutate(exp.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
}