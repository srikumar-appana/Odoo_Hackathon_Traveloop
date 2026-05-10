import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TopNav({ onMenuToggle, user }) {
    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <header className="sticky top-0 z-30 h-16 glass border-b border-border/50 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2 w-80">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search destinations, trips..."
                        className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                </button>

                <Avatar className="w-9 h-9 border-2 border-primary/30 cursor-pointer">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}