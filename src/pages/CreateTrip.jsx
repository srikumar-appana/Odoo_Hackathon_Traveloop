import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Calendar, Wallet, Image, MapPin, Users, CheckSquare, Weight, ArrowRight, CreditCard, Lock } from 'lucide-react';

const coverImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=400&fit=crop',
];

export default function CreateTrip() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    
    const initialTitle = searchParams.get('destination') || '';
    const initialImage = searchParams.get('image') || coverImages[0];
    
    if (initialImage && !coverImages.includes(initialImage)) {
        coverImages.unshift(initialImage);
    }

    const [form, setForm] = useState({
        title: initialTitle,
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        travel_type: 'solo',
        cover_image: initialImage,
        status: 'planning',
        name: '',
        gender: '',
        phone: '',
        weight: '',
        group_size: 2,
        group_members: [
            { name: '', gender: '', weight: '' },
            { name: '', gender: '', weight: '' }
        ]
    });
    
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [schedule, setSchedule] = useState([]);
    const [checklist, setChecklist] = useState([]);

    const handleGenerateSchedule = (e) => {
        e.preventDefault();
        setError('');

        if (!form.title.trim()) {
            setError('Please enter a trip name before continuing.');
            return;
        }

        let days = 1;
        if (form.start_date && form.end_date) {
            const startDate = new Date(form.start_date);
            const endDate = new Date(form.end_date);
            if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
                days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            } else {
                setError('Invalid date range. End date must be after start date.');
                return;
            }
        }
        
        days = Math.min(Math.max(days, 1), 30); 

        const attractions = ['City Center Highlights', 'Historical Landmarks', 'Nature & Outdoors', 'Local Cuisine Tasting', 'Shopping & Free Time'];
        
        const newSchedule = Array.from({ length: days }).map((_, i) => ({
            day: i + 1,
            name: `Day ${i + 1}: ${attractions[i % attractions.length]} in ${form.title || 'the city'}`,
            category: ['culture', 'culture', 'nature', 'food', 'shopping'][i % 5],
        }));

        setSchedule(newSchedule);
        setStep(2);
    };

    const handleGenerateChecklist = () => {
        let items = ['Passport & ID', 'Travel Insurance', 'Medications', 'Phone Charger', 'Universal Adapter', 'Comfortable Walking Shoes', 'Toiletries'];
        if (form.travel_type === 'family') {
            items = [...items, 'First-Aid Kit', 'Snacks', 'Entertainment for kids'];
        }
        if (form.travel_type === 'business') {
            items = [...items, 'Business Attire', 'Laptop & Charger', 'Business Cards'];
        }
        setChecklist(items.map(name => ({ id: crypto.randomUUID(), name, checked: false })));
        setStep(3);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                budget: Number(form.budget) || 0,
            };
            
            if (!payload.start_date) delete payload.start_date;
            if (!payload.end_date) delete payload.end_date;

            // 1. Create the Trip
            const trip = await base44.entities.Trip.create(payload);

            // 2. Create the primary Stop
            const stop = await base44.entities.Stop.create({
                trip_id: trip.id,
                city: form.title,
                country: 'TBD'
            });

            // 3. Create Activities
            if (schedule.length > 0) {
                await Promise.all(schedule.map(act => 
                    base44.entities.Activity.create({
                        stop_id: stop.id,
                        trip_id: trip.id,
                        name: act.name,
                        category: act.category,
                        day: act.day,
                        cost: 0,
                        duration_hours: 4
                    })
                ));
            }

            // 4. Create Checklist Items
            if (checklist.length > 0) {
                await Promise.all(checklist.map(item => 
                    base44.entities.ChecklistItem.create({
                        trip_id: trip.id,
                        name: item.name,
                        checked: false
                    })
                ));
            }

            await queryClient.invalidateQueries({ queryKey: ['trips'] });
            // Direct to trip details as requested
            navigate(`/trips/${trip.id}`);
        } catch (error) {
            console.error("Failed to create trip:", error);
            setError(error.message || 'Failed to create trip. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleGroupSizeChange = (val) => {
        const size = parseInt(val) || 2;
        const newMembers = [...form.group_members];
        while (newMembers.length < size) {
            newMembers.push({ name: '', gender: '', weight: '' });
        }
        setForm(prev => ({ ...prev, group_size: size, group_members: newMembers }));
    };

    const updateMember = (index, field, value) => {
        const newMembers = [...form.group_members];
        newMembers[index][field] = value;
        setForm(prev => ({ ...prev, group_members: newMembers }));
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-poppins font-bold text-3xl mb-2">Create New Trip</h1>
                <p className="text-muted-foreground mb-8">Plan your next adventure in minutes.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form or Schedule or Checklist */}
                {step === 1 && (
                    <motion.form
                        className="lg:col-span-3 glass rounded-2xl p-6 space-y-6"
                        onSubmit={handleGenerateSchedule}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div>
                            <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Trip Name
                            </Label>
                            <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Summer in Europe" className="bg-muted/50 border-border/50 rounded-xl h-12" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Start Date
                                </Label>
                                <Input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} className="bg-muted/50 border-border/50 rounded-xl h-12" />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> End Date
                                </Label>
                                <Input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} className="bg-muted/50 border-border/50 rounded-xl h-12" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Budget ($)
                                </Label>
                                <Input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="5000" className="bg-muted/50 border-border/50 rounded-xl h-12" />
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Travel Type
                                </Label>
                                <Select value={form.travel_type} onValueChange={(v) => update('travel_type', v)}>
                                    <SelectTrigger className="bg-muted/50 border-border/50 rounded-xl h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solo">Solo</SelectItem>
                                        <SelectItem value="couple">Couple</SelectItem>
                                        <SelectItem value="family">Family</SelectItem>
                                        <SelectItem value="friends">Friends</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Solo Form */}
                        {form.travel_type === 'solo' && (
                            <div className="bg-muted/20 border border-border/50 rounded-xl p-4 space-y-4">
                                <h3 className="font-semibold text-primary">Traveler Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm mb-2 block">Full Name</Label>
                                        <Input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your Name" className="bg-background/50 h-10" required />
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-2 block">Gender</Label>
                                        <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                                            <SelectTrigger className="bg-background/50 h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-2 block">Emergency Phone</Label>
                                        <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 234 567 8900" className="bg-background/50 h-10" required />
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-2 block">Package Weight (kg)</Label>
                                        <Input type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder="20" className="bg-background/50 h-10" required />
                                    </div>
                                </div>
                                {form.gender === 'female' && (
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-400">
                                        <strong className="block mb-1">🛡️ Solo Female Traveler Security Notice</strong>
                                        Your safety is our priority. We recommend sharing your itinerary with a trusted contact.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Group Form */}
                        {form.travel_type !== 'solo' && (
                            <div className="bg-muted/20 border border-border/50 rounded-xl p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-primary">Group Details</h3>
                                    <div className="w-32">
                                        <Label className="text-xs mb-1 block">Population</Label>
                                        <Input type="number" min="2" max="20" value={form.group_size} onChange={(e) => handleGroupSizeChange(e.target.value)} className="bg-background/50 h-8" />
                                    </div>
                                </div>
                                
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {form.group_members.slice(0, form.group_size).map((member, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-background/30 rounded-lg border border-border/30">
                                            <div className="col-span-5">
                                                <Label className="text-xs mb-1 block">Name</Label>
                                                <Input value={member.name} onChange={(e) => updateMember(i, 'name', e.target.value)} placeholder={`Person ${i+1}`} className="h-8 text-sm" required />
                                            </div>
                                            <div className="col-span-4">
                                                <Label className="text-xs mb-1 block">Gender</Label>
                                                <Select value={member.gender} onValueChange={(v) => updateMember(i, 'gender', v)}>
                                                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-3">
                                                <Label className="text-xs mb-1 block">Wt. (kg)</Label>
                                                <Input type="number" value={member.weight} onChange={(e) => updateMember(i, 'weight', e.target.value)} placeholder="0" className="h-8 text-sm" required />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div className="bg-red-500/10 text-red-500 text-sm rounded-xl p-3">{error}</div>}

                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl h-12 font-semibold">
                            Next: Generate Schedule <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.div className="lg:col-span-3 glass rounded-2xl p-6 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div>
                            <h2 className="text-2xl font-bold font-poppins mb-2">Review Your Schedule</h2>
                            <p className="text-muted-foreground text-sm">We've generated a day-by-day plan. Adjust as needed.</p>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {schedule.map((act) => (
                                <div key={act.day} className="p-4 bg-muted/30 rounded-xl border border-border/50 flex gap-4 items-start">
                                    <div className="bg-primary/20 text-primary rounded-lg px-3 py-1 font-semibold text-sm whitespace-nowrap mt-1">Day {act.day}</div>
                                    <Input value={act.name} onChange={(e) => {
                                        const newS = [...schedule];
                                        newS[act.day - 1].name = e.target.value;
                                        setSchedule(newS);
                                    }} className="bg-background/50 h-10 font-medium" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-border/50">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-12">Back</Button>
                            <Button onClick={handleGenerateChecklist} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl h-12 font-semibold">
                                Next: Package & Checklist
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div className="lg:col-span-3 glass rounded-2xl p-6 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div>
                            <h2 className="text-2xl font-bold font-poppins mb-2">Checklist & Package Info</h2>
                            <p className="text-muted-foreground text-sm">Review luggage weights and essential packing checklist before confirming your trip.</p>
                        </div>
                        
                        <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Weight className="w-5 h-5" /> Passenger Luggage Weights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {form.travel_type === 'solo' ? (
                                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                                        <span className="font-medium text-sm">{form.name || 'You'} ({form.gender || 'N/A'})</span>
                                        <span className="text-primary font-bold">{form.weight || '0'} kg</span>
                                    </div>
                                ) : (
                                    form.group_members.slice(0, form.group_size).map((m, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                                            <span className="font-medium text-sm">{m.name || `Member ${i+1}`} ({m.gender || 'N/A'})</span>
                                            <span className="text-primary font-bold">{m.weight || '0'} kg</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><CheckSquare className="w-5 h-5" /> Recommended Packing List</h3>
                            <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {checklist.map((item, i) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        <Input value={item.name} onChange={(e) => {
                                            const newC = [...checklist];
                                            newC[i].name = e.target.value;
                                            setChecklist(newC);
                                        }} className="bg-background/50 h-9 text-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border/50">
                            <Button variant="outline" onClick={() => setStep(2)} disabled={loading} className="flex-1 rounded-xl h-12">Back</Button>
                            <Button onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl h-12 font-semibold text-white">
                                Next: Secure Payment <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div className="lg:col-span-3 glass rounded-2xl p-6 space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div>
                            <h2 className="text-2xl font-bold font-poppins mb-2">Secure Checkout</h2>
                            <p className="text-muted-foreground text-sm">Please complete your payment to finalize the booking.</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-5 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10" />
                            <div className="relative z-10 flex justify-between items-center mb-6">
                                <span className="font-semibold text-lg">Total Amount Due</span>
                                <span className="text-2xl font-bold font-poppins">${Number(form.budget || 5000).toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-4 bg-background/50 p-5 rounded-xl border border-border/50 backdrop-blur-md">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Cardholder Name</Label>
                                    <Input placeholder="JOHN DOE" className="bg-background h-10 uppercase tracking-widest font-mono text-sm" />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Card Number</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="•••• •••• •••• ••••" maxLength={19} className="bg-background pl-9 h-10 tracking-[0.2em] font-mono" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-1 block">Expiry Date</Label>
                                        <Input placeholder="MM/YY" maxLength={5} className="bg-background h-10 font-mono text-center" />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-1 block">CVC</Label>
                                        <Input type="password" placeholder="•••" maxLength={4} className="bg-background h-10 font-mono text-center tracking-widest" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                            <Lock className="w-3 h-3" />
                            <span>Payments are secure and encrypted.</span>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl p-3">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-border/50">
                            <Button variant="outline" onClick={() => setStep(3)} disabled={loading} className="flex-1 rounded-xl h-12">Back</Button>
                            <Button onClick={handleConfirm} disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl h-12 font-semibold text-white shadow-lg shadow-primary/20">
                                {loading ? 'Processing Payment...' : <><Plane className="w-5 h-5 mr-2" /> Pay & Confirm Trip</>}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Live preview */}
                <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <div className="glass rounded-2xl overflow-hidden sticky top-24">
                        <div className="h-44 overflow-hidden">
                            <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-6">
                            <h3 className="font-poppins font-bold text-xl mb-1">{form.title || 'Your Trip Name'}</h3>
                            <div className="space-y-2 text-sm mt-4">
                                {form.start_date && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" />{form.start_date} {form.end_date && `→ ${form.end_date}`}</div>}
                                {form.budget && <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="w-4 h-4" />${Number(form.budget).toLocaleString()} budget</div>}
                                <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" />{form.travel_type} trip</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}