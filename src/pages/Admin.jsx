import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Users, Truck, Map, Wrench, ClipboardList, Plus, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import DataTable from '../components/admin/DataTable';
import EntityModal from '../components/admin/EntityModal';

const Admin = () => {
    const {
        rtgs, zones, users, resources, tasks, hseItems, operationsFollowup,
        addRTG, updateRTG, deleteRTG,
        addZone, updateZone, deleteZone,
        addUser, updateUser, deleteUser,
        addResource, updateResource, deleteResource,
        addTask, updateTask, deleteTask,
        addHSEItem, updateHSEItem, deleteHSEItem,
        addOperationsFollowup, updateOperationsFollowup, deleteOperationsFollowup
    } = useApp();

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'fleet');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    // Update activeTab when navigated from SmartSelect
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const tabs = [
        { id: 'fleet', label: 'Fleet (RTGs)', icon: Truck },
        { id: 'zones', label: 'Zones', icon: Map },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'resources', label: 'Resources', icon: Wrench },
        { id: 'workflow', label: 'Workflow', icon: ClipboardList },
        { id: 'hse', label: 'HSE Process', icon: Shield },
        { id: 'operations', label: 'Operations Follow-up', icon: Settings },
    ];

    const handleAdd = () => {
        setEditingItem(null);
        setModalType(activeTab);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalType(activeTab);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                if (activeTab === 'fleet') deleteRTG(id);
                if (activeTab === 'zones') deleteZone(id);
                if (activeTab === 'users') deleteUser(id);
                if (activeTab === 'resources') deleteResource(id);
                if (activeTab === 'workflow') deleteTask(id);
                if (activeTab === 'hse') deleteHSEItem(id);
                if (activeTab === 'operations') deleteOperationsFollowup(id);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const handleSave = (data) => {
        if (editingItem) {
            // Update existing item
            if (activeTab === 'fleet') updateRTG(editingItem.id, data);
            else if (activeTab === 'zones') updateZone(editingItem.id, data);
            else if (activeTab === 'users') updateUser(editingItem.id, data);
            else if (activeTab === 'resources') updateResource(editingItem.id, data);
            else if (activeTab === 'workflow') updateTask(editingItem.id, data);
            else if (activeTab === 'hse') updateHSEItem(editingItem.id, data);
            else if (activeTab === 'operations') updateOperationsFollowup(editingItem.id, data);
        } else {
            // Add new item
            if (activeTab === 'fleet') addRTG(data);
            else if (activeTab === 'zones') addZone(data);
            else if (activeTab === 'users') addUser(data);
            else if (activeTab === 'resources') addResource(data);
            else if (activeTab === 'workflow') addTask(data);
            else if (activeTab === 'hse') addHSEItem(data);
            else if (activeTab === 'operations') addOperationsFollowup(data);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const getColumns = () => {
        switch (activeTab) {
            case 'fleet': return [{ key: 'name', label: 'RTG Name' }, { key: 'status', label: 'Status' }, { key: 'location', label: 'Location' }];
            case 'zones': return [{ key: 'name', label: 'Zone Name' }, { key: 'description', label: 'Description' }];
            case 'users': return [{ key: 'idRef', label: 'ID Reference' }, { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }];
            case 'resources': return [{ key: 'name', label: 'Item Name' }, { key: 'type', label: 'Type' }, { key: 'stock', label: 'Stock Level' }];
            case 'workflow': return [{ key: 'wbs', label: 'WBS Code' }, { key: 'name', label: 'Task Name' }, { key: 'category', label: 'Category' }];
            case 'hse': return [{ key: 'name', label: 'Process/Checklist' }, { key: 'type', label: 'Type' }, { key: 'frequency', label: 'Frequency/Severity' }];
            case 'operations': return [{ key: 'name', label: 'Process Name' }, { key: 'category', label: 'Category' }, { key: 'resources', label: 'Resources' }, { key: 'status', label: 'Status' }];
            default: return [];
        }
    };

    const getFields = () => {
        switch (activeTab) {
            case 'fleet': return [
                { key: 'name', label: 'RTG Name', required: true },
                { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Maintenance', 'Inactive'] },
                { key: 'location', label: 'Location' }
            ];
            case 'zones': return [
                { key: 'name', label: 'Zone Name', required: true },
                { key: 'description', label: 'Description', type: 'textarea' }
            ];
            case 'users': return [
                { key: 'name', label: 'Full Name', required: true },
                { key: 'role', label: 'Role', type: 'select', options: ['Manager', 'Technician', 'Viewer'] }
            ];
            case 'resources': return [
                { key: 'name', label: 'Item Name', required: true },
                { key: 'type', label: 'Type', type: 'select', options: ['Tool', 'Material', 'Consumable'] },
                { key: 'stock', label: 'Stock Level', type: 'number' }
            ];
            case 'workflow': return [
                { key: 'wbs', label: 'WBS Code (e.g. 1.1)', required: true },
                { key: 'name', label: 'Task Name', required: true },
                { key: 'category', label: 'Category', type: 'select', options: ['Prep', 'Painting', 'Inspection', 'Safety'] },
                { key: 'startTime', label: 'Start Time', type: 'time' },
                { key: 'endTime', label: 'End Time', type: 'time' },
                { key: 'estimatedDuration', label: 'Estimated Duration (hours)', type: 'number', step: '0.5' },
                { key: 'description', label: 'Detailed Description', type: 'textarea', required: true }
            ];
            case 'hse': return [
                { key: 'name', label: 'Process Name', required: true },
                { key: 'type', label: 'Type', type: 'select', options: ['Checklist', 'Risk Category', 'Procedure'] },
                { key: 'frequency', label: 'Frequency / Severity' }
            ];
            case 'operations': return [
                { key: 'name', label: 'Process Name', required: true },
                { key: 'category', label: 'Category', type: 'select', options: ['Corrosion Mapping', 'Surface Prep', 'Painting', 'QHSSE', 'Waste Management'] },
                { key: 'resources', label: 'Required Resources', type: 'multiselect' },
                { key: 'checkpoints', label: 'Process Checkpoints', type: 'checkpoints' },
                { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
                { key: 'description', label: 'Description', type: 'textarea' }
            ];
            default: return [];
        }
    };

    const getData = () => {
        switch (activeTab) {
            case 'fleet': return rtgs;
            case 'zones': return zones;
            case 'users': return users;
            case 'resources': return resources;
            case 'workflow': return tasks;
            case 'hse': return hseItems;
            case 'operations': return operationsFollowup;
            default: return [];
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Admin Configuration</h1>
                    <p className="text-[var(--text-muted)]">Manage system entities and settings</p>
                </div>
                <Button icon={Plus} variant="primary" onClick={handleAdd}>
                    Add New {tabs.find(t => t.id === activeTab)?.label.split(' ')[0]}
                </Button>
            </div>

            {/* Tabs */}
            <div className="glass-panel rounded-xl p-2 mb-6">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 text-[var(--primary)] border border-[var(--primary)]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[var(--primary)]' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                <DataTable
                    columns={getColumns()}
                    data={getData()}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal */}
            <EntityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${editingItem ? 'Edit' : 'Add'} ${tabs.find(t => t.id === activeTab)?.label.split(' ')[0]}`}
                fields={getFields()}
                initialData={editingItem}
                onSubmit={handleSave}
            />
        </div>
    );
};

export default Admin;
