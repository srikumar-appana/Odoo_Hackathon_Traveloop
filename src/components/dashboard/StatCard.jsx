import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
    return (
        <motion.div
            className="glass rounded-2xl p-6 group hover:border-primary/20 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -2 }}
        >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-poppins font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </motion.div>
    );
}