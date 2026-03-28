import axios from 'axios';
import type { Artist } from '../types';

// En desarrollo usamos el backend de NestJS en 3000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginAdmin = async (credentials: { email: string; password: string }) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getArtists = async (): Promise<Artist[]> => {
  const { data } = await api.get('/artists');
  return data;
};

export const getArtistBySlug = async (slug: string): Promise<Artist> => {
  const { data } = await api.get(`/artists/${slug}`);
  return data;
};

export const submitBooking = async (bookingData: any): Promise<any> => {
  const { data } = await api.post('/booking', bookingData);
  return data;
};

// Events Management
export const getEventsByArtist = async (slug: string): Promise<any[]> => {
  const { data } = await api.get(`/events?artist=${slug}`);
  return data;
};

export const createEvent = async (eventData: any): Promise<any> => {
  const { data } = await api.post('/events', eventData);
  return data;
};

export const deleteEvent = async (id: string): Promise<any> => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

export default api;
