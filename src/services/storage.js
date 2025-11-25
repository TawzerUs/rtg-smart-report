import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Compress image before upload
 */
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, { type: "image/jpeg" }));
                    },
                    "image/jpeg",
                    quality
                );
            };
        };
    });
};

/**
 * Upload photo to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'rtg-photos/RTG001/inspection123')
 * @returns {Promise<string>} Download URL
 */
export const uploadPhoto = async (file, path) => {
    try {
        // Compress image before upload
        const compressedFile = await compressImage(file);

        // Create storage reference
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, compressedFile);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading photo:", error);
        throw error;
    }
};

/**
 * Upload multiple photos
 * @param {File[]} files - Array of image files
 * @param {string} path - Storage path
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadPhotos = async (files, path) => {
    try {
        const uploadPromises = files.map((file) => uploadPhoto(file, path));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading photos:", error);
        throw error;
    }
};

/**
 * Delete photo from Firebase Storage
 * @param {string} url - Download URL of the photo
 */
export const deletePhoto = async (url) => {
    try {
        const photoRef = ref(storage, url);
        await deleteObject(photoRef);
    } catch (error) {
        console.error("Error deleting photo:", error);
        throw error;
    }
};

/**
 * Convert base64 to File object
 * @param {string} base64 - Base64 string
 * @param {string} filename - File name
 * @returns {File}
 */
export const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

/**
 * Upload base64 image (for migration from localStorage)
 * @param {string} base64 - Base64 image string
 * @param {string} path - Storage path
 * @param {string} filename - File name
 * @returns {Promise<string>} Download URL
 */
export const uploadBase64Photo = async (base64, path, filename = "photo.jpg") => {
    try {
        const file = base64ToFile(base64, filename);
        return await uploadPhoto(file, path);
    } catch (error) {
        console.error("Error uploading base64 photo:", error);
        throw error;
    }
};
