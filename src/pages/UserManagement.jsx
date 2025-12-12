import { useState, useEffect } from "react";
import { getAllUsers, deleteUser, getUserCustomers } from "../services/supabaseDb";
import { signUpWithEmail, updateUserRole, createUserDocument } from "../services/supabaseAuth";
import { useAuth } from "../context/AuthContext";
import { Users, UserPlus, Edit2, Trash2, Shield, Eye, Wrench, FolderGit2 } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import AssignCustomersModal from "../components/AssignCustomersModal";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedUserForAssignment, setSelectedUserForAssignment] = useState(null);
    const [userCustomersMap, setUserCustomersMap] = useState({});
    const { userRole } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        displayName: "",
        role: "viewer"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersData = await getAllUsers();
            setUsers(usersData);

            // Fetch assigned customers for each user
            const customersMap = {};
            await Promise.all(
                usersData.map(async (user) => {
                    const userCustomers = await getUserCustomers(user.id);
                    customersMap[user.id] = userCustomers;
                })
            );
            setUserCustomersMap(customersMap);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create user in Supabase Auth
            const user = await signUpWithEmail(formData.email, formData.password, { displayName: formData.displayName });

            if (user) {
                // 2. Create user document in 'users' table (if not handled by trigger/auth service)
                // Note: signUpWithEmail in our service might already handle this, but let's be safe
                // or ensure we update the role correctly.
                await createUserDocument(user.id, formData.email, formData.displayName, formData.role);

                // Reset form and refresh users
                setFormData({ email: "", password: "", displayName: "", role: "viewer" });
                setShowAddUser(false);
                await fetchUsers();
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole); // This needs to be imported or available in supabaseDb/Auth
            // Note: updateUserRole was in supabaseAuth.js, let's ensure we use the right one.
            // Actually, we should use updateUser from supabaseDb if available, or the specific role updater.
            // Let's check imports. We imported updateUserRole from supabaseDb (which might be wrong, it was in Auth).
            // Let's fix the import above if needed.
            await fetchUsers();
        } catch (error) {
            console.error("Error updating user role:", error);
            alert(`Failed to update role: ${error.message || error.error_description || 'Unknown error'}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This will only delete the database record, not the Auth account.")) return;

        try {
            await deleteUser(userId);
            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case "operator":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    if (userRole !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You need administrator privileges to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient">User Management</h2>
                <Button onClick={() => setShowAddUser(!showAddUser)}>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
                <Card title="Create New User" icon={UserPlus}>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="operator">Operator</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                Create User
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setShowAddUser(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Users List */}
            <Card title="Users" icon={Users}>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        User
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        Role
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        Assigned Workspaces
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        Created
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                    {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {user.display_name || "No name"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )} border-0 cursor-pointer`}
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="operator">Operator</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {userCustomersMap[user.id]?.length > 0 ? (
                                                    userCustomersMap[user.id].map((uc) => (
                                                        <span
                                                            key={uc.customer_id}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs"
                                                        >
                                                            {uc.customers?.name || uc.customer_id}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No assignments</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setSelectedUserForAssignment(user)}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Assign Workspaces"
                                                >
                                                    <FolderGit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Assign Customers Modal */}
            <AssignCustomersModal
                user={selectedUserForAssignment}
                isOpen={!!selectedUserForAssignment}
                onClose={() => setSelectedUserForAssignment(null)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
