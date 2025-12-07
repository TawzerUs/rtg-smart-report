import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit2, Globe, Shield } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, subscribeToCustomers } from '../services/supabaseDb';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        type: 'Client',
        location: '',
        color: '#0055aa',
        logo_url: ''
    });

    useEffect(() => {
        loadCustomers();
        const unsubscribe = subscribeToCustomers(setCustomers);
        return () => unsubscribe();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setLoading(false);
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await createCustomer({
                name: newCustomer.name,
                type: newCustomer.type,
                color: newCustomer.color,
                logo_url: newCustomer.logo_url,
                locations: [newCustomer.location]
            });
            setShowAddModal(false);
            setNewCustomer({ name: '', type: 'Client', location: '', color: '#0055aa', logo_url: '' });
        } catch (error) {
            alert('Error creating customer: ' + error.message);
        }
    };

    const handleEditCustomer = async (e) => {
        e.preventDefault();
        try {
            await updateCustomer(editingCustomer.id, {
                name: editingCustomer.name,
                type: editingCustomer.type,
                color: editingCustomer.color,
                logo_url: editingCustomer.logo_url,
                locations: editingCustomer.locations
            });
            setShowEditModal(false);
            setEditingCustomer(null);
        } catch (error) {
            alert('Error updating customer: ' + error.message);
        }
    };

    const handleDeleteCustomer = async (customer) => {
        if (!confirm(`Are you sure you want to delete ${customer.name}? This will also delete all associated projects.`)) {
            return;
        }
        try {
            await deleteCustomer(customer.id);
        } catch (error) {
            alert('Error deleting customer: ' + error.message);
        }
    };

    const openEditModal = (customer) => {
        setEditingCustomer({ ...customer });
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-blue-400" />
                        Customer Management
                    </h2>
                    <p className="text-gray-400">Manage enterprise client accounts and workspaces</p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Customer
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <div
                        key={customer.id}
                        className="group relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center border transition-colors overflow-hidden"
                                style={{
                                    backgroundColor: `${customer.color}10`,
                                    borderColor: `${customer.color}20`
                                }}
                            >
                                {customer.logo_url ? (
                                    <img src={customer.logo_url} alt={customer.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Building2 className="w-6 h-6" style={{ color: customer.color }} />
                                )}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(customer)}
                                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {customer.id !== 'spidercord' && (
                                    <button
                                        onClick={() => handleDeleteCustomer(customer)}
                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{customer.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{customer.type}</p>

                        <div className="space-y-2 pt-4 border-t border-slate-700/50">
                            <div className="flex items-center text-sm text-gray-400">
                                <Globe className="w-4 h-4 mr-2" />
                                {customer.locations?.join(', ') || 'No locations'}
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                                <Shield className="w-4 h-4 mr-2" />
                                {customer.status === 'active' ? 'Active Workspace' : 'Inactive'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Customer Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Customer"
            >
                <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                        <input
                            type="text"
                            required
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g., GLOBAL PORTS"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                        <select
                            value={newCustomer.type}
                            onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Client">Client</option>
                            <option value="Terminal Operator">Terminal Operator</option>
                            <option value="Port Authority">Port Authority</option>
                            <option value="Energy">Energy</option>
                            <option value="Hospitality">Hospitality</option>
                            <option value="Construction">Construction</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Primary Location</label>
                        <input
                            type="text"
                            required
                            value={newCustomer.location}
                            onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Rotterdam"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (Optional)</label>
                        <input
                            type="text"
                            value={newCustomer.logo_url || ''}
                            onChange={(e) => setNewCustomer({ ...newCustomer, logo_url: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Brand Color</label>
                        <input
                            type="color"
                            value={newCustomer.color}
                            onChange={(e) => setNewCustomer({ ...newCustomer, color: e.target.value })}
                            className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg"
                        >
                            Create Customer
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Customer Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Customer"
            >
                {editingCustomer && (
                    <form onSubmit={handleEditCustomer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                            <input
                                type="text"
                                required
                                value={editingCustomer.name}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <select
                                value={editingCustomer.type}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, type: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="Client">Client</option>
                                <option value="Terminal Operator">Terminal Operator</option>
                                <option value="Port Authority">Port Authority</option>
                                <option value="Energy">Energy</option>
                                <option value="Hospitality">Hospitality</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (Optional)</label>
                            <input
                                type="text"
                                value={editingCustomer.logo_url || ''}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, logo_url: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Brand Color</label>
                            <input
                                type="color"
                                value={editingCustomer.color}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, color: e.target.value })}
                                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default CustomerManagement;
