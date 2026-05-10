import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const cities = [
    // Tropical
    { name: 'Maldives', country: 'Maldives', region: 'tropical', cost: '$$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&h=350&fit=crop', attractions: ['Bioluminescent Beach', 'Male', 'Coral Reefs'] },
    { name: 'Maui', country: 'USA', region: 'tropical', cost: '$$$', rating: 4.8, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop', attractions: ['Haleakala', 'Road to Hana', 'Kaanapali Beach'] },
    { name: 'Phuket', country: 'Thailand', region: 'tropical', cost: '$$', rating: 4.7, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=350&fit=crop', attractions: ['Patong Beach', 'Big Buddha', 'Phi Phi Islands'] },
    { name: 'Lakshadweep', country: 'India', region: 'tropical', cost: '$$', rating: 4.6, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=350&fit=crop', attractions: ['Agatti Island', 'Minicoy Island', 'Bangaram Atoll'] },
    { name: 'Sri Lanka', country: 'Sri Lanka', region: 'tropical', cost: '$', rating: 4.7, image: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=500&h=350&fit=crop', attractions: ['Sigiriya', 'Ella', 'Yala National Park'] },

    // Spring
    { name: 'Rome', country: 'Italy', region: 'spring', cost: '$$', rating: 4.8, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&h=350&fit=crop', attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain'] },
    { name: 'Kyoto', country: 'Japan', region: 'spring', cost: '$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&h=350&fit=crop', attractions: ['Fushimi Inari', 'Bamboo Grove', 'Kinkaku-ji'] },
    { name: 'Sydney', country: 'Australia', region: 'spring', cost: '$$', rating: 4.7, image: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?w=800&q=80&fit=crop', attractions: ['Opera House', 'Bondi Beach', 'Harbour Bridge'] },

    // Winter
    { name: 'Banff', country: 'Canada', region: 'winter', cost: '$$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&h=350&fit=crop', attractions: ['Lake Louise', 'Moraine Lake', 'Banff National Park'] },
    { name: 'Iceland', country: 'Iceland', region: 'winter', cost: '$$$', rating: 4.8, image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&h=350&fit=crop', attractions: ['Blue Lagoon', 'Golden Circle', 'Northern Lights'] },
    { name: 'Swiss Alps', country: 'Switzerland', region: 'winter', cost: '$$$', rating: 4.9, image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&h=350&fit=crop', attractions: ['Matterhorn', 'Jungfraujoch', 'Lucerne'] },
    { name: 'London', country: 'UK', region: 'winter', cost: '$$$', rating: 4.7, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&h=350&fit=crop', attractions: ['Big Ben', 'London Eye', 'Tower of London'] },
];

export default function Explore() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('all');

    const filtered = cities.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase());
        const matchRegion = region === 'all' || c.region === region;
        return matchSearch && matchRegion;
    });

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-poppins font-bold text-3xl">Explore Destinations</h1>
                <p className="text-muted-foreground text-sm mt-1">Discover your next adventure</p>
            </motion.div>

            {/* Search */}
            <motion.div
                className="glass rounded-2xl p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3 px-4 py-2">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search cities, countries..."
                        className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full text-sm"
                    />
                </div>
            </motion.div>

            {/* Region filter */}
            <Tabs value={region} onValueChange={setRegion}>
                <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="all">All Seasons</TabsTrigger>
                    <TabsTrigger value="tropical">Warm & Tropical</TabsTrigger>
                    <TabsTrigger value="spring">Spring</TabsTrigger>
                    <TabsTrigger value="winter">Cold & Winter</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Trending badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Trending: Maldives, Kyoto, Iceland</span>
            </div>

            {/* City grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((city, i) => (
                    <motion.div
                        key={city.name}
                        onClick={() => navigate(`/create-trip?destination=${encodeURIComponent(city.name)}&image=${encodeURIComponent(city.image)}`)}
                        className="glass rounded-2xl overflow-hidden group cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4 }}
                    >
                        <div className="relative h-44 overflow-hidden">
                            <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge className="absolute top-3 right-3 bg-black/40 text-white border-0 backdrop-blur-sm">
                                {city.cost}
                            </Badge>
                            <div className="absolute bottom-3 left-4">
                                <p className="font-poppins font-bold text-lg text-white">{city.name}</p>
                                <p className="text-xs text-white/70 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {city.country}
                                </p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">{city.rating}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {city.attractions.map(a => (
                                    <Badge key={a} variant="secondary" className="text-xs bg-muted/50 border-border/50">
                                        {a}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}