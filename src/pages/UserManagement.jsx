import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Users, UserPlus, Edit2, Trash2, Shield, Eye, Wrench } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
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
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
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
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Create user document in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: formData.email,
                displayName: formData.displayName,
                role: formData.role,
                createdAt: new Date(),
                createdBy: auth.currentUser.uid
            });

            // Reset form and refresh users
            setFormData({ email: "", password: "", displayName: "", role: "viewer" });
            setShowAddUser(false);
            await fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            await fetchUsers();
        } catch (error) {
            console.error("Error updating user role:", error);
            alert(error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin":
                return <Shield className="w-4 h-4 text-red-500" />;
            case "operator":
                return <Wrench className="w-4 h-4 text-blue-500" />;
            default:
                return <Eye className="w-4 h-4 text-gray-500" />;
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
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gradient">User Management</h1>
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
                                                    {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {user.displayName || "No name"}
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
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {user.createdAt?.toDate?.().toLocaleDateString() || "N/A"}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
