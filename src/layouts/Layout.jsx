import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <Header toggleSidebar={toggleSidebar} />

            <div className="p-4 sm:ml-64 pt-20">
                <div className="animate-fade-in">
                    {children}
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
