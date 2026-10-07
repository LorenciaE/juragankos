import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Service untuk Kamar
export const getRooms = async () => {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
};

// TAMBAHKAN FUNGSI INI
export const getRoomById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/rooms/${id}`);
    return response.data;
};

export const createRoom = async (roomData) => {
    const response = await axios.post(`${API_BASE_URL}/rooms`, roomData);
    return response.data;
};

export const updateRoom = async (id, roomData) => {
    const response = await axios.put(`${API_BASE_URL}/rooms/${id}`, roomData);
    return response.data;
};

export const deleteRoom = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/rooms/${id}`);
    return response.data;
};

// ==========================================
// Service untuk Pengeluaran
// ==========================================
export const getExpenses = async () => {
    const response = await axios.get(`${API_BASE_URL}/expenses`);
    return response.data;
};

export const getExpenseById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/${id}`);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await axios.put(`${API_BASE_URL}/expenses/${id}`, expenseData);
    return response.data;
};

export const createExpense = async (expenseData) => {
    const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/expenses/${id}`);
    return response.data;
};

// ==========================================
// Service untuk Penyewa
// ==========================================
export const getTenants = async () => {
    const response = await axios.get(`${API_BASE_URL}/tenants`);
    return response.data;
};

export const getTenantById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/tenants/${id}`);
    return response.data;
};

export const createTenant = async (tenantData) => {
    const response = await axios.post(`${API_BASE_URL}/tenants`, tenantData);
    return response.data;
};

export const updateTenant = async (id, tenantData) => {
    const response = await axios.put(`${API_BASE_URL}/tenants/${id}`, tenantData);
    return response.data;
};

export const deleteTenant = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/tenants/${id}`);
    return response.data;
};

// ==========================================
// Service untuk Pembayaran
// ==========================================
export const getPayments = async () => {
    const response = await axios.get(`${API_BASE_URL}/payments`);
    return response.data;
};

export const createPayment = async (paymentData) => {
    const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
    return response.data;
};

export const deletePayment = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/payments/${id}`);
    return response.data;
};

export const getPaymentById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/payments/${id}`);
    return response.data;
};

export const updatePayment = async (id, paymentData) => {
    const response = await axios.put(`${API_BASE_URL}/payments/${id}`, paymentData);
    return response.data;
};