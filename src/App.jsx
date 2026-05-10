import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrip';
import TripDetail from './pages/TripDetails';
import Budget from './pages/Buget';
import Checklist from './pages/Checklist';
import Journal from './pages/Journal';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

const AuthenticatedApp = () => {
    const { isLoadingAuth, isAuthenticated, navigateToLogin } = useAuth();

    // Show loading spinner while checking app public settings or auth
    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Render login route if not authenticated, or let them see Landing.
        // But we want to handle routes.
        // Actually, let's just let the router handle it and we can redirect if needed.
    }

    // Render the main app
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route element={isAuthenticated ? <AppLayout /> : <Auth />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                <Route path="/trips" element={<MyTrips />} />
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/checklist" element={<Checklist />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};


function App() {

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router>
                    <AuthenticatedApp />
                </Router>
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App