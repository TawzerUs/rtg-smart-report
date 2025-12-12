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
import SimpleLogin from './pages/SimpleLogin';
import CleanLogin from './pages/CleanLogin';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import UserManagement from './pages/UserManagement';
import AdminSetup from './pages/AdminSetup';
import SeedData from './pages/SeedData';
import DirectLogin from './pages/DirectLogin';
import ClientSelection from './pages/ClientSelection';
import ProjectSelection from './pages/ProjectSelection';
import AdminDashboard from './pages/AdminDashboard';
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
                                <Route path="/" element={<ClientSelection />} />
                                <Route path="/clients" element={<ClientSelection />} />
                                <Route path="/login" element={<CleanLogin />} />
                                <Route path="/clean-login" element={<CleanLogin />} />
                                <Route path="/simple-login" element={<SimpleLogin />} />
                                <Route path="/old-login" element={<Login />} />
                                {/* <Route path="/direct-login" element={<DirectLogin />} /> */}
                                <Route path="/register" element={<Register />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                                <Route path="/admin-setup" element={<AdminSetup />} />
                                <Route path="/seed-data" element={<SeedData />} />

                                {/* Protected routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </ProtectedRoute>
                                } />
                                <Route path="/projects" element={
                                    <ProtectedRoute>
                                        <ProjectSelection />
                                    </ProtectedRoute>
                                } />
                                <Route path="/admin" element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <AdminDashboard />
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
