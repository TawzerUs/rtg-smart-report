import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Button from './Button';
import { getCustomers, getUserCustomers, assignUserToCustomer, removeUserFromCustomer } from '../services/supabaseDb';

export default function AssignCustomersModal({ user, isOpen, onClose, onSuccess }) {
    const [customers, setCustomers] = useState([]);
    const [assignedCustomers, setAssignedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allCustomers, userCustomers] = await Promise.all([
                getCustomers(),
                getUserCustomers(user.id)
            ]);
            setCustomers(allCustomers);
            setAssignedCustomers(userCustomers.map(uc => uc.customer_id));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomer = async (customerId) => {
        setSaving(true);
        try {
            if (assignedCustomers.includes(customerId)) {
                // Remove assignment
                await removeUserFromCustomer(user.id, customerId);
                setAssignedCustomers(prev => prev.filter(id => id !== customerId));
            } else {
                // Add assignment
                await assignUserToCustomer(user.id, customerId);
                setAssignedCustomers(prev => [...prev, customerId]);
            }
        } catch (error) {
            console.error('Error toggling customer:', error);
            alert(`Failed to update assignment: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        onSuccess?.();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Assign Workspaces
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {user?.display_name || user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {customers.map((customer) => {
                                const isAssigned = assignedCustomers.includes(customer.id);
                                return (
                                    <button
                                        key={customer.id}
                                        onClick={() => toggleCustomer(customer.id)}
                                        disabled={saving}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${isAssigned
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: customer.color || '#0055aa' }}
                                            />
                                            <div className="text-left">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {customer.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {customer.type} • {customer.locations?.join(', ') || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        {isAssigned && (
                                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
