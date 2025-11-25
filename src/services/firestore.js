import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ============================================
// RTG Operations
// ============================================

export const createRTG = async (rtgData, userId) => {
    try {
        const rtgRef = doc(collection(db, "rtgs"));
        await setDoc(rtgRef, {
            ...rtgData,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return rtgRef.id;
    } catch (error) {
        console.error("Error creating RTG:", error);
        throw error;
    }
};

export const updateRTG = async (rtgId, rtgData) => {
    try {
        const rtgRef = doc(db, "rtgs", rtgId);
        await updateDoc(rtgRef, {
            ...rtgData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating RTG:", error);
        throw error;
    }
};

export const deleteRTG = async (rtgId) => {
    try {
        await deleteDoc(doc(db, "rtgs", rtgId));
    } catch (error) {
        console.error("Error deleting RTG:", error);
        throw error;
    }
};

export const getRTG = async (rtgId) => {
    try {
        const rtgDoc = await getDoc(doc(db, "rtgs", rtgId));
        if (rtgDoc.exists()) {
            return { id: rtgDoc.id, ...rtgDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting RTG:", error);
        throw error;
    }
};

export const getAllRTGs = async () => {
    try {
        const rtgsSnapshot = await getDocs(collection(db, "rtgs"));
        return rtgsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting RTGs:", error);
        throw error;
    }
};

export const subscribeToRTGs = (callback) => {
    return onSnapshot(collection(db, "rtgs"), (snapshot) => {
        const rtgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(rtgs);
    });
};

// ============================================
// Work Order Operations
// ============================================

export const createWorkOrder = async (workOrderData, userId) => {
    try {
        const orderRef = doc(collection(db, "workOrders"));
        await setDoc(orderRef, {
            ...workOrderData,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return orderRef.id;
    } catch (error) {
        console.error("Error creating work order:", error);
        throw error;
    }
};

export const updateWorkOrder = async (orderId, workOrderData) => {
    try {
        const orderRef = doc(db, "workOrders", orderId);
        await updateDoc(orderRef, {
            ...workOrderData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating work order:", error);
        throw error;
    }
};

export const deleteWorkOrder = async (orderId) => {
    try {
        await deleteDoc(doc(db, "workOrders", orderId));
    } catch (error) {
        console.error("Error deleting work order:", error);
        throw error;
    }
};

export const getWorkOrdersByRTG = async (rtgId) => {
    try {
        const q = query(collection(db, "workOrders"), where("rtgId", "==", rtgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting work orders:", error);
        throw error;
    }
};

export const subscribeToWorkOrders = (rtgId, callback) => {
    if (rtgId) {
        // Subscribe to work orders for specific RTG
        const q = query(collection(db, "workOrders"), where("rtgId", "==", rtgId));
        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callback(orders);
        });
    } else {
        // Subscribe to all work orders
        return onSnapshot(collection(db, "workOrders"), (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callback(orders);
        });
    }
};

// ============================================
// Inspection Operations
// ============================================

export const createInspection = async (inspectionData, userId) => {
    try {
        const inspectionRef = doc(collection(db, "inspections"));
        await setDoc(inspectionRef, {
            ...inspectionData,
            inspectedBy: userId,
            timestamp: serverTimestamp(),
        });
        return inspectionRef.id;
    } catch (error) {
        console.error("Error creating inspection:", error);
        throw error;
    }
};

export const updateInspection = async (inspectionId, inspectionData) => {
    try {
        const inspectionRef = doc(db, "inspections", inspectionId);
        await updateDoc(inspectionRef, inspectionData);
    } catch (error) {
        console.error("Error updating inspection:", error);
        throw error;
    }
};

export const getInspectionsByWorkOrder = async (workOrderId) => {
    try {
        const q = query(
            collection(db, "inspections"),
            where("workOrderId", "==", workOrderId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting inspections:", error);
        throw error;
    }
};

// ============================================
// Report Operations
// ============================================

export const createReport = async (reportData, userId) => {
    try {
        const reportRef = doc(collection(db, "reports"));
        await setDoc(reportRef, {
            ...reportData,
            generatedBy: userId,
            generatedAt: serverTimestamp(),
        });
        return reportRef.id;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
};

export const getReportsByRTG = async (rtgId) => {
    try {
        const q = query(collection(db, "reports"), where("rtgId", "==", rtgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting reports:", error);
        throw error;
    }
};

// ============================================
// Zone Operations
// ============================================

export const createZone = async (zoneData) => {
    try {
        const zoneRef = doc(collection(db, "zones"));
        await setDoc(zoneRef, zoneData);
        return zoneRef.id;
    } catch (error) {
        console.error("Error creating zone:", error);
        throw error;
    }
};

export const getZonesByRTG = async (rtgId) => {
    try {
        const q = query(collection(db, "zones"), where("rtgId", "==", rtgId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting zones:", error);
        throw error;
    }
};
