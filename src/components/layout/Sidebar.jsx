import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Map,
    PlusCircle,
    Wallet,
    CheckSquare,
    BookOpen,
    Settings,
    Compass,
    Plane,
    X
} from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Map, label: 'My Trips', path: '/trips' },
    { icon: Compass, label: 'Explore Cities', path: '/explore' },
    { icon: Wallet, label: 'Budget', path: '/budget' },
    { icon: CheckSquare, label: 'Checklist', path: '/checklist' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Plane className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-poppins font-bold text-xl text-sidebar-foreground">
                            Jaitra
                        </span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

            </aside>
        </>
    );
}