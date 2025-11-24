import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import RTGView from './pages/RTGView';

function App() {
    return (
        <ProjectProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/rtg/:id" element={<RTGView />} />
                        {/* Add other routes as we build modules */}
                    </Routes>
                </Layout>
            </Router>
        </ProjectProvider>
    );
}

export default App;
