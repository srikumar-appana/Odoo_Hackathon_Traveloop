import React from 'react';
import { Plane } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border/50 py-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Plane className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-poppins font-bold text-lg">Jaitra</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    © 2026 Jaitra. Built for Anti Gravity Hackathon.
                </p>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
                    <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
                </div>
            </div>
        </footer>
    );
}