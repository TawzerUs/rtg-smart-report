import { supabase } from '../lib/supabase';

/**
 * Supabase Storage Service
 * Provides file upload, download, and management functions
 */

const BUCKET_NAME = 'photos';

// Upload a file to Supabase Storage
export const uploadFile = async (file, path) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Get public URL for a file
export const getPublicUrl = (path) => {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);
    
    return data?.publicUrl;
};

// Download a file
export const downloadFile = async (path) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(path);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

// Delete a file
export const deleteFile = async (path) => {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path]);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// List files in a folder
export const listFiles = async (folder = '') => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
};

// Upload image with compression
export const uploadImage = async (file, folder = 'images') => {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
        const path = `${folder}/${filename}`;
        
        // Upload the file
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // Return the public URL
        const publicUrl = getPublicUrl(path);
        return {
            path: data.path,
            url: publicUrl
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

// Delete image by URL
export const deleteImageByUrl = async (url) => {
    try {
        // Extract path from URL
        const urlParts = url.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid storage URL');
        }
        
        const path = urlParts[1];
        return await deleteFile(path);
    } catch (error) {
        console.error('Error deleting image by URL:', error);
        throw error;
    }
};
