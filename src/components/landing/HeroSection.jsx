import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BlurText from './BlurText';

const floatingCards = [
    { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop', top: '15%', left: '5%', delay: 0 },
    { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop', top: '25%', right: '8%', delay: 0.2 },
    { city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=200&fit=crop', bottom: '20%', left: '10%', delay: 0.4 },
    { city: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=300&h=200&fit=crop', bottom: '15%', right: '5%', delay: 0.6 },
];

export default function HeroSection() {
    const navigate = useNavigate();
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

            {/* Floating destination cards */}
            {floatingCards.map((card) => (
                <motion.div
                    key={card.city}
                    onClick={() => navigate(`/create-trip?destination=${encodeURIComponent(card.city)}&image=${encodeURIComponent(card.image)}`)}
                    className="absolute hidden lg:block glass rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                    style={{ top: card.top, left: card.left, right: card.right, bottom: card.bottom }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ delay: card.delay + 0.5, duration: 0.8 }}
                    whileHover={{ scale: 1.05, opacity: 1 }}
                >
                    <img src={card.image} alt={card.city} className="w-40 h-24 object-cover" />
                    <div className="p-3">
                        <p className="font-poppins font-semibold text-sm text-foreground">{card.city}</p>
                        <p className="text-xs text-muted-foreground">{card.country}</p>
                    </div>
                </motion.div>
            ))}

            {/* Hero content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 mt-4">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">AI-Powered Travel Planning</span>
                    </div>

                    <div className="relative mb-6">
                        <BlurText 
                            text="JAITRA" 
                            delay={100} 
                            animateBy="letters" 
                            direction="top"
                            className="font-poppins font-black text-7xl md:text-[9rem] tracking-tight text-primary leading-none drop-shadow-2xl"
                        />
                    </div>

                    <h1 className="font-poppins font-bold text-3xl md:text-5xl leading-tight mb-6 text-foreground/90">
                        Plan Your Dream Journey Effortlessly
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Create stunning itineraries, track budgets, discover cities, and share your adventures — all in one beautiful travel command center.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard">
                            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold px-8 py-6 rounded-2xl text-base">
                                Start Planning
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link to="/explore">
                            <Button size="lg" variant="outline" className="border-border/50 hover:bg-muted/50 px-8 py-6 rounded-2xl text-base">
                                Explore Destinations
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}