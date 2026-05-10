import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TripCard from '../components/dashboard/TripCard';

export default function MyTrips() {
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: trips = [], isLoading } = useQuery({
        queryKey: ['trips'],
        queryFn: () => base44.entities.Trip.list('-created_date', 100),
    });

    const filtered = statusFilter === 'all'
        ? trips
        : trips.filter(t => t.status === statusFilter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-poppins font-bold text-3xl">My Trips</h1>
                    <p className="text-muted-foreground text-sm mt-1">{trips.length} trips planned</p>
                </motion.div>
                <div className="flex items-center gap-3">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                        <TabsList className="bg-muted/50">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="planning">Planning</TabsTrigger>
                            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Link to="/create-trip">
                        <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                            <PlusCircle className="w-4 h-4 mr-2" /> New Trip
                        </Button>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    className="glass rounded-2xl p-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-muted-foreground mb-4">No trips found. Create your first adventure!</p>
                    <Link to="/create-trip">
                        <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                            <PlusCircle className="w-4 h-4 mr-2" /> Create Trip
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((trip, i) => (
                        <TripCard key={trip.id} trip={trip} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}