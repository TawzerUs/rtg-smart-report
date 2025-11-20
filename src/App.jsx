import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TutorialProvider } from './context/TutorialContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import RTGDetails from './pages/RTGDetails';
import OTManagement from './pages/OTManagement';
import DailyLog from './pages/DailyLog';
import Photos from './pages/Photos';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import TutorialOverlay from './components/TutorialOverlay';

function App() {
    return (
        <AppProvider>
            <TutorialProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/rtg/:id" element={<RTGDetails />} />
                            <Route path="/rtg/:id/log/new" element={<DailyLog />} />
                            <Route path="/tasks" element={<OTManagement />} />
                            <Route path="/photos" element={<Photos />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </Layout>
                    <TutorialOverlay />
                </Router>
            </TutorialProvider>
        </AppProvider>
    );
}

export default App;
