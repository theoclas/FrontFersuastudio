import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, MapPin, Eye, EyeOff, Save, Settings } from 'lucide-react';
import { getArtistBySlug, getEventsByArtist, createEvent, deleteEvent, updateEvent, updateArtistProfile, addSpec, deleteSpec } from '../services/api';

export default function ArtistDashboard() {
  const { slug } = useParams<{ slug: string }>();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const artistSummary = user?.artists?.find((a: any) => a.slug === slug);
  const isAuthorized = !!artistSummary;

  const [activeTab, setActiveTab] = useState<'events' | 'profile'>('events');

  // Data Loading States
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Forms
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
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

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    } else {
      setLoading(false);
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
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- EVENTS HANDLERS ---
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
      alert('Hubo un error al crear la fecha.');
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
      alert('Error cambiando el estado de la fecha.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('¿Estás seguro de ELIMINAR definitivamente esta fecha de la base de datos? Esta acción no se puede deshacer.')) return;
    try {
      await deleteEvent(id);
      await loadData();
    } catch (err) {
      alert('Error eliminando la fecha.');
    }
  };

  // --- PROFILE HANDLERS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    try {
      await updateArtistProfile(slug || '', { bio, tagline });
      alert('Perfil actualizado correctamente');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el perfil');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // --- SPECS HANDLERS ---
  const handleAddSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specLabel) return;
    setIsSubmittingSpec(true);
    try {
      await addSpec(slug || '', { label: specLabel, category: specCategory });
      setSpecLabel('');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al agregar el spec al rider.');
    } finally {
      setIsSubmittingSpec(false);
    }
  };

  const handleDeleteSpec = async (specId: number) => {
    if (!window.confirm('¿Eliminar este equipo del rider?')) return;
    try {
      await deleteSpec(slug || '', specId);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar spec');
    }
  };

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
        <h2>No autorizado</h2>
        <p>No tienes asignado este artista o no existe.</p>
        <Link to="/dashboard" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Volver al Panel</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'white', padding: '40px 20px' }}>
      <div className="shell" style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <Link to="/dashboard" style={{ color: 'white', opacity: 0.7, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Gestionar {artistSummary.name}</h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
          <button 
            onClick={() => setActiveTab('events')}
            style={{ 
              background: 'transparent', border: 'none', color: activeTab === 'events' ? 'var(--accent-orange)' : 'white', 
              opacity: activeTab === 'events' ? 1 : 0.6, fontSize: 16, fontWeight: activeTab === 'events' ? 'bold' : 'normal', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8 
            }}>
            <CalIcon size={18} /> Fechas y Eventos
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{ 
              background: 'transparent', border: 'none', color: activeTab === 'profile' ? 'var(--accent-blue)' : 'white', 
              opacity: activeTab === 'profile' ? 1 : 0.6, fontSize: 16, fontWeight: activeTab === 'profile' ? 'bold' : 'normal', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8 
            }}>
            <Settings size={18} /> Perfil y Rider
          </button>
        </div>

        {/* ================= EVENTS TAB ================= */}
        {activeTab === 'events' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30, alignItems: 'start' }}>
            {/* Formulario Crear Evento */}
            <div style={{ background: 'var(--bg-soft)', border: '1px solid rgba(255,255,255,0.05)', padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Plus size={20} color="var(--accent-orange)" /> Nueva Fecha
              </h3>
              <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Título del Show</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Feriado Closing Party" 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Fecha</label>
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} 
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Hora</label>
                    <input required type="time" value={time} onChange={e => setTime(e.target.value)} 
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Lugar (Venue)</label>
                  <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Ej: Club Vertigo" 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Ciudad, País</label>
                  <input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Ej: Bogotá, CO" 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>URL Tickets (Opcional)</label>
                  <input type="url" value={ticketUrl} onChange={e => setTicketUrl(e.target.value)} placeholder="https://..." 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <button disabled={isSubmittingEvent} style={{ background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', marginTop: 10 }}>
                  {isSubmittingEvent ? 'Guardando...' : 'Añadir Fecha'}
                </button>
              </form>
            </div>

            {/* Event List */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>Fechas e Historial</h3>
              </div>
              <div style={{ padding: 24 }}>
                {loading ? <p>Cargando fechas...</p> : events.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No hay fechas registradas.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {events.map((ev) => (
                      <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 15, color: ev.status === 'CANCELLED' ? '#ffaa00' : 'white', opacity: ev.status === 'CANCELLED' ? 0.7 : 1 }}>{ev.title}</span>
                            {ev.status === 'CANCELLED' && <span style={{ fontSize: 10, background: 'rgba(255,170,0,0.2)', color: '#ffaa00', padding: '2px 6px', borderRadius: 4 }}>OCULTO</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 12, alignItems: 'center', opacity: ev.status === 'CANCELLED' ? 0.7 : 1 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalIcon size={12} /> {new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {ev.venue}, {ev.city}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleToggleEventStatus(ev.id, ev.status)} style={{ background: 'transparent', border: 'none', color: ev.status === 'CANCELLED' ? 'var(--accent-blue)' : '#ffaa00', cursor: 'pointer', opacity: 0.8 }} title={ev.status === 'CANCELLED' ? 'Republicar' : 'Ocultar'}>
                            {ev.status === 'CANCELLED' ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.8 }} title="Eliminar definitivamente">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= PROFILE & RIDER TAB ================= */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignItems: 'start' }}>
            
            {/* Editar Perfil */}
            <div style={{ background: 'var(--bg-soft)', border: '1px solid rgba(255,255,255,0.05)', padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Settings size={20} color="var(--accent-blue)" /> Información Pública
              </h3>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Tagline / Subtítulo</label>
                  <input required type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Ej: DJs · Productores · Electrónica" 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Biografía (Perfil y Presskit)</label>
                  <textarea required value={bio} onChange={e => setBio(e.target.value)} rows={6}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8, resize: 'vertical' }} />
                </div>
                <button disabled={isSubmittingProfile} style={{ background: 'var(--accent-blue)', color: 'black', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <Save size={18} /> {isSubmittingProfile ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </form>
            </div>

            {/* Rider Técnico */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>Rider Técnico (Specs)</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Equipos que requiere el artista para su presentación.</p>
              </div>
              
              <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <form onSubmit={handleAddSpec} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <input required type="text" value={specLabel} onChange={e => setSpecLabel(e.target.value)} placeholder="Ej: CDJ 3000..." 
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                  </div>
                  <button disabled={isSubmittingSpec} style={{ background: 'white', color: 'black', fontWeight: 'bold', padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    Añadir
                  </button>
                </form>
              </div>

              <div style={{ padding: 24 }}>
                {loading || !profile ? <p>Cargando specs...</p> : profile.specs?.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Rider técnico vacío.</p> : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {profile.specs.map((sp: any) => (
                      <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 20 }}>
                        <span style={{ fontSize: 14 }}>{sp.label}</span>
                        <button onClick={() => handleDeleteSpec(sp.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: 0, display: 'flex' }} title="Quitar equipo">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
