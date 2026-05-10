import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { checkUserAuth } = useAuth();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await base44.auth.login(form.email, form.password);
            } else {
                if (!form.name) throw new Error("Name is required");
                await base44.auth.signup(form.name, form.email, form.password);
            }
            await checkUserAuth();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
            
            <motion.div 
                className="w-full max-w-md glass rounded-3xl p-8 relative z-10 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <Plane className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-poppins font-bold">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isLogin ? 'Enter your details to access your trips' : 'Start planning your next adventure'}
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative"
                            >
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input 
                                    type="text"
                                    placeholder="Full Name"
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl"
                                    required={!isLogin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input 
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl"
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-white shadow-lg shadow-primary/20 mt-4 transition-all"
                    >
                        {loading ? '...' : (
                            <span className="flex items-center">
                                {isLogin ? 'Sign In' : 'Sign Up'} 
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
