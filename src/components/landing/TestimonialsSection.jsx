import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
    { name: 'Sarah Chen', role: 'Travel Blogger', text: 'Jaitra completely changed how I plan my trips. The itinerary builder is incredibly intuitive and the budget tracking saved me hundreds.', initials: 'SC' },
    { name: 'Marcus Rivera', role: 'Digital Nomad', text: 'As someone who travels full-time, this is the only planning tool I need. The shared plans feature is a game-changer for group trips.', initials: 'MR' },
    { name: 'Aiko Tanaka', role: 'Photographer', text: 'The city discovery feature helped me find hidden gems I would have never discovered on my own. Beautiful design too!', initials: 'AT' },
];

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-4">
                        Loved by <span className="gradient-text-warm">Travelers</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">Join thousands of happy adventurers worldwide.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="glass rounded-2xl p-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                        >
                            <div className="flex gap-1 mb-4">
                                {Array(5).fill(0).map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{t.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}