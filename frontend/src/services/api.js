import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000'; // Change this to your backend URL

// Function to register a new user
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Function to login a user
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Function to upload study materials
export const uploadStudyMaterial = async (file, wordsLimit = 100) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('words_limit', wordsLimit);

        const response = await axios.post(`${API_BASE_URL}/api/process-document`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error.response?.data || { error: 'Failed to upload file' };
    }
};

// Function to fetch notes
export const fetchNotes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/notes`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Function to summarize notes
export const summarizeNote = async (noteId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/notes/${noteId}/summarize`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Function to get user profile
export const fetchUserProfile = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};