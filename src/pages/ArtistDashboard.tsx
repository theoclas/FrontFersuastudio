import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, Eye, EyeOff, Save, Settings, Share2, Image as ImageIcon, Upload } from 'lucide-react';
import { getArtistBySlug, getEventsByArtist, createEvent, deleteEvent, updateEvent, updateArtistProfile, addSpec, deleteSpec, addSocial, deleteSocial, uploadPhoto, deletePhoto, uploadCover, addGenre, deleteGenre } from '../services/api';

export default function ArtistDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const artistSummary = user?.artists?.find((a: any) => a.slug === slug);
  const isAuthorized = user?.role === 'ADMIN' || !!artistSummary;

  const [activeTab, setActiveTab] = useState<'events' | 'profile' | 'gallery'>('events');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'gallery' || tab === 'profile' || tab === 'events') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Data Loading States
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  // Profile Forms
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Event Forms
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Spec Forms
  const [specLabel, setSpecLabel] = useState('');
  const [specCategory] = useState('Equipamiento');
  const [isSubmittingSpec, setIsSubmittingSpec] = useState(false);

  // Social Forms
  const [socialPlatform, setSocialPlatform] = useState('instagram');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialLabel, setSocialLabel] = useState('');
  const [isSubmittingSocial, setIsSubmittingSocial] = useState(false);

  // Genre Forms
  const [genreName, setGenreName] = useState('');
  const [isSubmittingGenre, setIsSubmittingGenre] = useState(false);

  // Gallery
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [slug, isAuthorized]);

  const loadData = async () => {
    try {
      const [evts, art] = await Promise.all([
        getEventsByArtist(slug || ''),
        getArtistBySlug(slug || '')
      ]);
      setEvents(evts);
      setProfile(art);
      setBio(art.bio || '');
      setTagline(art.tagline || '');
      setWhatsapp(art.whatsapp || '');
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // --- EVENTS ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !venue || !city) return;
    setIsSubmittingEvent(true);
    try {
      const isoDate = new Date(`${date}T${time}:00`).toISOString();
      await createEvent({ artistId: artistSummary.id, title, venue, city, date: isoDate, ticketUrl: ticketUrl || undefined });
      setTitle(''); setDate(''); setTime(''); setVenue(''); setCity(''); setTicketUrl('');
      await loadData();
    } catch (err) {
      alert('Error al crear fecha.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleToggleEventStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'CANCELLED' ? 'UPCOMING' : 'CANCELLED';
    if (!window.confirm(`¿Estás seguro de ${newStatus === 'CANCELLED' ? 'ocultar' : 'publicar'} esta fecha en la página web?`)) return;
    try {
      await updateEvent(id, { status: newStatus });
      await loadData();
    } catch (err) {
      alert('Error cambiando el estado.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('¿ELIMINAR definitivamente de la base de datos?')) return;
    try {
      await deleteEvent(id);
      await loadData();
    } catch (err) {
      alert('Error eliminando la fecha.');
    }
  };

  // --- PROFILE ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    try {
      await updateArtistProfile(slug || '', { bio, tagline, whatsapp });
      alert('Perfil actualizado');
      await loadData();
    } catch (err) {
      alert('Error actualizando perfil');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // --- SPECS ---
  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specLabel) return;
    setIsSubmittingSpec(true);
    try {
      await addSpec(slug || '', { label: specLabel, category: specCategory });
      setSpecLabel('');
      await loadData();
    } catch (err) {
      alert('Error agregando equipo.');
    } finally {
      setIsSubmittingSpec(false);
    }
  };

  const handleDeleteSpec = async (specId: number) => {
    if (!window.confirm('¿Quitar equipo del rider?')) return;
    try {
      await deleteSpec(slug || '', specId);
      await loadData();
    } catch (err) {
      alert('Error eliminando equipo.');
    }
  };

  // --- SOCIALS ---
  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialUrl) return;
    setIsSubmittingSocial(true);
    try {
      await addSocial(slug || '', { platform: socialPlatform, url: socialUrl, label: socialLabel || undefined });
      setSocialUrl('');
      setSocialLabel('');
      await loadData();
    } catch (err) {
      alert('Error agregando red social.');
    } finally {
      setIsSubmittingSocial(false);
    }
  };

  const handleDeleteSocial = async (socialId: number) => {
    if (!window.confirm('¿Eliminar red social?')) return;
    try {
      await deleteSocial(slug || '', socialId);
      await loadData();
    } catch (err) {
      alert('Error eliminando red social.');
    }
  };

  // --- GENRES ---
  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName) return;
    setIsSubmittingGenre(true);
    try {
      await addGenre(slug || '', { name: genreName });
      setGenreName('');
      await loadData();
    } catch (err) {
      alert('Error agregando género musical.');
    } finally {
      setIsSubmittingGenre(false);
    }
  };

  const handleDeleteGenre = async (genreId: number) => {
    if (!window.confirm('¿Eliminar género musical?')) return;
    try {
      await deleteGenre(slug || '', genreId);
      await loadData();
    } catch (err) {
      alert('Error eliminando género.');
    }
  };

  // --- GALLERY ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(slug || '', file);
      await loadData();
    } catch (err) {
      alert('Error subiendo foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm('¿Eliminar esta foto de la galería?')) return;
    try {
      await deletePhoto(slug || '', photoId);
      await loadData();
    } catch (err) {
      alert('Error eliminando foto.');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      await uploadCover(slug || '', file);
      alert('Foto de portada actualizada exitosamente.');
      await loadData();
    } catch (err) {
      alert('Error subiendo foto de portada.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
        <h2>No autorizado</h2>
        <Link to="/dashboard" style={{ color: 'var(--accent-blue)' }}>Volver</Link>
      </div>
    );
  }

  // Define API Root for images
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'white', padding: '40px 20px' }}>
      <div className="shell" style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <Link to="/dashboard" style={{ color: 'white', opacity: 0.7 }}><ArrowLeft size={24} /></Link>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Gestionar {artistSummary.name}</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
          <button onClick={() => setActiveTab('events')} style={{ background: 'transparent', border: 'none', color: activeTab === 'events' ? 'var(--accent-orange)' : 'white', opacity: activeTab === 'events' ? 1 : 0.6, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalIcon size={18} /> Fechas
          </button>
          <button onClick={() => setActiveTab('profile')} style={{ background: 'transparent', border: 'none', color: activeTab === 'profile' ? 'var(--accent-blue)' : 'white', opacity: activeTab === 'profile' ? 1 : 0.6, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} /> Perfil y Rider
          </button>
          <button onClick={() => setActiveTab('gallery')} style={{ background: 'transparent', border: 'none', color: activeTab === 'gallery' ? '#a855f7' : 'white', opacity: activeTab === 'gallery' ? 1 : 0.6, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ImageIcon size={18} /> Galería
          </button>
        </div>

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30 }}>
            <div style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16 }}>
              <h3 style={{ marginBottom: 20, display: 'flex', gap: 8 }}><Plus size={20} color="var(--accent-orange)" /> Nueva Fecha</h3>
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título Show" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                  <input required type="time" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Lugar (Venue)" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                <input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad, País" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                <input type="url" value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} placeholder="URL Tickets" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                <button disabled={isSubmittingEvent} style={{ background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer' }}>{isSubmittingEvent ? 'Añadiendo...' : 'Añadir Fecha'}</button>
              </form>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Listado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map((ev) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12 }}>
                    <div>
                       <div style={{ fontWeight: 600 }}>{ev.title} {ev.status === 'CANCELLED' && <span style={{ color: '#ffaa00', fontSize: 10 }}>(OCULTO)</span>}</div>
                       <div style={{ fontSize: 12, opacity: 0.6 }}>{ev.venue}, {ev.city} • {new Date(ev.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <button onClick={() => handleToggleEventStatus(ev.id, ev.status)} style={{ background: 'transparent', border: 'none', color: ev.status === 'CANCELLED' ? '#3b82f6' : '#ffaa00', cursor: 'pointer' }}>{ev.status === 'CANCELLED' ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                       <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
               {/* Cover Image */}
               <div style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16 }}>
                  <h3 style={{ marginBottom: 20, display: 'flex', gap: 8 }}><ImageIcon size={20} color="var(--accent-blue)" /> Foto de Portada</h3>
                  {profile?.coverImage ? (
                    <img src={`${API_BASE}${profile.coverImage}`} alt="Cover" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
                  ) : (
                    <div style={{ width: '100%', height: 160, background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, fontSize: 13 }}>Mostrando default de disco</div>
                  )}
                  <label style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', padding: 12, borderRadius: 8, cursor: 'pointer' }}>
                    {isUploadingCover ? 'Subiendo...' : 'Cambiar Foto Principal'}
                    <input type="file" hidden accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                  </label>
               </div>

               <div style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16 }}>
                  <h3 style={{ marginBottom: 20, display: 'flex', gap: 8 }}><Settings size={20} color="var(--accent-blue)" /> Información Pública</h3>
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input required value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Tagline" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (57...)" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                    <textarea required value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder="Biografía" style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                    <button disabled={isSubmittingProfile} style={{ background: 'var(--accent-blue)', color: 'black', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer' }}><Save size={18} /> {isSubmittingProfile ? 'Guardando...' : 'Guardar Perfil'}</button>
                  </form>
               </div>
               <div style={{ background: 'var(--bg-soft)', padding: 24, borderRadius: 16 }}>
                  <h3 style={{ marginBottom: 20, display: 'flex', gap: 8 }}><Share2 size={20} color="var(--accent-orange)" /> Redes Sociales</h3>
                  <form onSubmit={handleAddSocial} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <select value={socialPlatform} onChange={e => setSocialPlatform(e.target.value)} style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                      <option value="instagram">IG</option><option value="soundcloud">SC</option><option value="spotify">Spotify</option><option value="youtube">YT</option>
                    </select>
                    <input required value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="https://..." style={{ flex: 2, padding: 10, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    <button disabled={isSubmittingSocial} style={{ background: 'white', color: 'black', padding: '0 12px', borderRadius: 8, border: 'none' }}>+</button>
                  </form>
                  {profile?.socials?.map((soc: any) => (
                    <div key={soc.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{soc.platform}: {soc.url}</span>
                      <button onClick={() => handleDeleteSocial(soc.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
               </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: 24, borderRadius: 16 }}>
               <h3 style={{ marginBottom: 20 }}>Rider Técnico</h3>
               <form onSubmit={handleAddSpec} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <input required value={specLabel} onChange={e => setSpecLabel(e.target.value)} placeholder="Ej: Mixer DJM V10" style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <button disabled={isSubmittingSpec} style={{ background: 'white', color: 'black', padding: '0 12px', borderRadius: 8, border: 'none' }}>
                    {isSubmittingSpec ? '...' : '+'}
                  </button>
               </form>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile?.specs?.map((s: any) => (
                    <div key={s.id} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 20, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                      {s.label} <Trash2 size={12} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteSpec(s.id)} />
                    </div>
                  ))}
               </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: 24, borderRadius: 16 }}>
               <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#ec4899' }}>♫</span> Etiquetas / Géneros Musicales</h3>
               <form onSubmit={handleAddGenre} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <input required value={genreName} onChange={e => setGenreName(e.target.value)} placeholder="Ej: Tech House" style={{ flex: 1, padding: 10, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <button disabled={isSubmittingGenre} style={{ background: '#ec4899', color: 'white', fontWeight: 'bold', padding: '0 12px', borderRadius: 8, border: 'none' }}>
                    {isSubmittingGenre ? '...' : '+ Añadir'}
                  </button>
               </form>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {profile?.genres?.map((g: any) => (
                    <div key={g.id} style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#fbcfe8', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '6px 14px', borderRadius: 20, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                      {g.name} <Trash2 size={12} style={{ cursor: 'pointer', color: '#f472b6' }} onClick={() => handleDeleteGenre(g.id)} />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, padding: 24 }}>
             <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
               Formatos permitidos: JPEG, PNG, WebP o GIF. Tamaño máximo por archivo: 8&nbsp;MB. Las imágenes se sirven desde el API; en producción configura <code style={{ fontSize: 12 }}>VITE_API_URL</code> al dominio del backend.
             </p>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h3 style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ImageIcon size={20} color="#a855f7" /> Galería de Fotos</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#a855f7', color: 'white', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
                  <Upload size={18} /> {isUploadingPhoto ? 'Subiendo...' : 'Subir Imagen'}
                  <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                </label>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
                {profile?.photos?.map((ph: any) => (
                  <div key={ph.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/3', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={`${API_BASE}${ph.url}`} alt="Artist" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => handleDeletePhoto(ph.id)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', padding: 8, borderRadius: '50%', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(!profile?.photos || profile.photos.length === 0) && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>No hay fotos dinámicas. (Se muestran fallbacks del disco en la landing pública)</div>
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
