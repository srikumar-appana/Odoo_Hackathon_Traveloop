import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Globe, Wallet, Calendar, PlusCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '../components/dashboard/StatCard';
import TripCard from '../components/dashboard/TripCard';

const destinations = [
    { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
    { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop' },
    { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => { });
    }, []);

    const { data: trips = [] } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list('-created_date', 50),
    });

    const { data: expenses = [] } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => base44.entities.Expense.list(),
    });

    const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
    const uniqueCountries = new Set(trips.map(t => t.title)).size;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="space-y-8">
            {/* Welcome banner */}
            <motion.div
                className="relative overflow-hidden rounded-3xl p-[2px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Spinning border effect */}
                <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,hsl(var(--primary))_100%)]" />
                
                <div className="relative overflow-hidden rounded-[22px] bg-card p-8 md:p-10 w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h1 className="font-poppins font-bold text-2xl md:text-4xl mb-2">
                            {greeting()}, {user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Traveler'} ✈️
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base mb-6">
                            Ready to plan your next adventure? Your travel command center awaits.
                        </p>
                        <Link to="/create-trip">
                            <Button className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create New Trip
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Map} label="Total Trips" value={trips.length} gradient="from-primary to-purple-400" delay={0.1} />
                <StatCard icon={Globe} label="Destinations" value={uniqueCountries} gradient="from-accent to-cyan-300" delay={0.2} />
                <StatCard icon={Wallet} label="Budget Planned" value={`$${totalBudget.toLocaleString()}`} gradient="from-orange-500 to-amber-400" delay={0.3} />
                <StatCard icon={Calendar} label="Upcoming" value={trips.filter(t => t.status === 'planning').length} gradient="from-emerald-500 to-green-400" delay={0.4} />
            </div>

            {/* Recent Trips */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-poppins font-semibold text-xl">Recent Trips</h2>
                    <Link to="/trips" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                {trips.length === 0 ? (
                    <motion.div
                        className="glass rounded-2xl p-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No trips yet. Start planning your first adventure!</p>
                        <Link to="/create-trip">
                            <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                                <PlusCircle className="w-4 h-4 mr-2" /> Create First Trip
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.slice(0, 6).map((trip, i) => (
                            <TripCard key={trip.id} trip={trip} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Popular Destinations */}
            <div>
                <h2 className="font-poppins font-semibold text-xl mb-5">Popular Destinations</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {destinations.map((dest, i) => (
                        <motion.div
                            key={dest.name}
                            onClick={() => navigate(`/create-trip?destination=${encodeURIComponent(dest.name)}&image=${encodeURIComponent(dest.image)}`)}
                            className="relative rounded-2xl overflow-hidden h-36 group cursor-pointer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-3 left-4">
                                <p className="font-poppins font-semibold text-sm text-white">{dest.name}</p>
                                <p className="text-xs text-white/70">{dest.country}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}