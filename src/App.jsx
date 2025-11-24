import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { TutorialProvider } from './context/TutorialContext';
import { AppProvider } from './context/AppContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import RTGView from './pages/RTGView';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ProjectProvider>
            <AppProvider>
                <TutorialProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/rtg/:id" element={<RTGView />} />
                                <Route path="/settings" element={
                                    <ErrorBoundary>
                                        <Settings />
                                    </ErrorBoundary>
                                } />
                                {/* Add other routes as we build modules */}
                            </Routes>
                        </Layout>
                    </Router>
                </TutorialProvider>
            </AppProvider>
        </ProjectProvider>
    );
}

export default App;
