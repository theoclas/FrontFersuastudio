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

export const updateEvent = async (id: string, eventData: any): Promise<any> => {
  const { data } = await api.patch(`/events/${id}`, eventData);
  return data;
};

export const deleteEvent = async (id: string): Promise<any> => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

// Profile & Rider
export const updateArtistProfile = async (slug: string, profileData: any): Promise<any> => {
  const { data } = await api.patch(`/artists/${slug}`, profileData);
  return data;
};

export const addSpec = async (slug: string, specData: any): Promise<any> => {
  const { data } = await api.post(`/artists/${slug}/specs`, specData);
  return data;
};

export const deleteSpec = async (slug: string, specId: number): Promise<any> => {
  const { data } = await api.delete(`/artists/${slug}/specs/${specId}`);
  return data;
};

export const addSocial = async (slug: string, socialData: any): Promise<any> => {
  const { data } = await api.post(`/artists/${slug}/socials`, socialData);
  return data;
};

export const deleteSocial = async (slug: string, socialId: number): Promise<any> => {
  const { data } = await api.delete(`/artists/${slug}/socials/${socialId}`);
  return data;
};

export const uploadPhoto = async (slug: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/artists/${slug}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deletePhoto = async (slug: string, photoId: number): Promise<any> => {
  const { data } = await api.delete(`/artists/${slug}/photos/${photoId}`);
  return data;
};

export const uploadCover = async (slug: string, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/artists/${slug}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export default api;
