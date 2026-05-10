import React from 'react';
import { motion } from 'framer-motion';
import { Route, Wallet, Compass, CheckSquare, Share2, Brain } from 'lucide-react';

const features = [
    { icon: Brain, title: 'Smart Itinerary Builder', desc: 'AI-powered suggestions for the perfect day-by-day travel plan.', color: 'from-primary to-purple-400' },
    { icon: Wallet, title: 'Budget Estimator', desc: 'Track every penny with beautiful charts and smart insights.', color: 'from-accent to-cyan-300' },
    { icon: Compass, title: 'City Discovery', desc: 'Explore destinations with curated guides and local tips.', color: 'from-orange-500 to-amber-400' },
    { icon: CheckSquare, title: 'Packing Assistant', desc: 'Never forget essentials with smart categorized checklists.', color: 'from-emerald-500 to-green-400' },
    { icon: Share2, title: 'Shared Travel Plans', desc: 'Collaborate with friends and share your itineraries.', color: 'from-pink-500 to-rose-400' },
    { icon: Route, title: 'Route Visualization', desc: 'See your journey unfold on interactive maps and timelines.', color: 'from-blue-500 to-indigo-400' },
];

export default function FeaturesSection() {
    return (
        <section className="py-24 px-4 relative">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-4">
                        Everything You Need to{' '}
                        <span className="gradient-text">Travel Smart</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        From planning to packing, we've got every step covered.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="glass rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-poppins font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}