import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            {/* Sticky nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Plane className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-poppins font-bold text-xl">Jaitra</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/dashboard"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <Footer />
        </div>
    );
}