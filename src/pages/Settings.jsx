import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Mail, Globe, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => { });
    }, []);

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    const handleLogout = () => {
        base44.auth.logout('/');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-poppins font-bold text-3xl">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
            </motion.div>

            {/* Profile */}
            <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-poppins font-semibold text-lg mb-6">Profile</h3>
                <div className="flex items-center gap-6 mb-6">
                    <Avatar className="w-20 h-20 border-2 border-primary/30">
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-lg">{user?.full_name || 'Traveler'}</p>
                        <p className="text-sm text-muted-foreground">{user?.email || '...'}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" /> Full Name
                        </Label>
                        <Input value={user?.full_name || ''} disabled className="bg-muted/50 border-border/50 rounded-xl" />
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4" /> Email
                        </Label>
                        <Input value={user?.email || ''} disabled className="bg-muted/50 border-border/50 rounded-xl" />
                    </div>
                </div>
            </motion.div>

            {/* Preferences */}
            <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-poppins font-semibold text-lg mb-6">Preferences</h3>
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive trip reminders</p>
                            </div>
                        </div>
                        <Switch />
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Public Profile</p>
                                <p className="text-xs text-muted-foreground">Allow others to view your trips</p>
                            </div>
                        </div>
                        <Switch />
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Two-Factor Auth</p>
                                <p className="text-xs text-muted-foreground">Enhanced account security</p>
                            </div>
                        </div>
                        <Switch />
                    </div>
                </div>
            </motion.div>

            {/* Danger zone */}
            <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
            </motion.div>
        </div>
    );
}