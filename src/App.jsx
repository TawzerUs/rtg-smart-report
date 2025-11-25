import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { TutorialProvider } from './context/TutorialContext';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import RTGView from './pages/RTGView';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <ProjectProvider>
                <AppProvider>
                    <TutorialProvider>
                        <Router>
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Protected routes */}
                                <Route path="/" element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </ProtectedRoute>
                                } />
                                <Route path="/rtg/:id" element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <RTGView />
                                        </Layout>
                                    </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <ErrorBoundary>
                                                <Settings />
                                            </ErrorBoundary>
                                        </Layout>
                                    </ProtectedRoute>
                                } />
                                <Route path="/users" element={
                                    <ProtectedRoute requireAdmin>
                                        <Layout>
                                            <UserManagement />
                                        </Layout>
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </Router>
                    </TutorialProvider>
                </AppProvider>
            </ProjectProvider>
        </AuthProvider>
    );
}

export default App;
