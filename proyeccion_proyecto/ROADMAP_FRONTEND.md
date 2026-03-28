# Roadmap Frontend - Proyección del Proyecto

Este documento detalla los siguientes pasos necesarios en el Frontend (React) para lograr que la plataforma sea dinámica, permitiendo a los artistas (y/o administradores) autenticarse y gestionar su propia información y fechas (agenda).

## 1. Sistema de Autenticación (Auth)
- [x] **Conexión Login/Register:** Conectar `src/pages/Login.tsx` con el endpoint de autenticación del backend (NestJS).
- [x] **Manejo de Tokens (JWT):** Implementar lógica para guardar el token temporal (localStorage o cookies) y configurar Axios Interceptors (`src/services/api.ts`) para enviar el Token en cada petición segura.
- [x] **Rutas Protegidas (Protected Routes):** Crear un componente envoltorio (ej. `<ProtectedRoute>`) en react-router para asegurar que solo usuarios autenticados entren al panel de control.

## 2. Panel de Administración (Dashboard)
Crear un módulo interno (`/dashboard`) donde los artistas puedan gestionar su perfil post-login.

### Módulo de "Mis Fechas" (Eventos)
- [x] **Vista de Agenda:** Tabla o grid donde el artista vea sus fechas actuales obtenidas desde el backend.
- [x] **Formulario Crear/Editar Fecha:** Inputs para ingresar ciudad, lugar (venue), fecha exacta y link de compra de tickets. Al guardar, debe llamar al endpoint `POST /events` o `PUT /events/:id`.
- [x] **Sincronización:** Una vez añadida la fecha, esta debe reflejarse instantáneamente en la página pública del artista (`/artist-slug`).

### Módulo de Perfil y Rider (Specs)
- [x] **Editor de Biografía:** Formulario para que el artista actualice su descripción.
- [ ] **Redes y Spotify:** Campos para actualizar links de Instagram, SoundCloud, Spotify Embeds.
- [x] **Tecnología y Rider:** Editor simple donde añaden qué equipos necesitan (Mixer, CDJs).

### Módulo de Galería (Imágenes)
Actualmente, las imágenes son levantadas del disco local (`assets/artists/...`). En el futuro, idealmente, los artistas subirán fotos:
- [ ] **Uploader de Fotos:** Formulario `multipart/form-data` para enviar imágenes al backend, que las procesará y guardará en BD o S3.

## 3. Integración Dinámica del Perfil Público
- [ ] **Mejorar ArtistBooking.tsx:** La interfaz clonada ya está lista y espectacular, ahora solo falta asegurar que _toda_ la data (miembros del dúo, strings del rider, links sociales, galería subida) venga del fetch `getArtistBySlug(slug)` en lugar de caer al fallback estático interno del código.
