import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar as CalIcon, MapPin } from 'lucide-react';
import { getEventsByArtist, createEvent, deleteEvent } from '../services/api';

export default function ArtistDashboard() {
  const { slug } = useParams<{ slug: string }>();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const artist = user?.artists?.find((a: any) => a.slug === slug);
  const isAuthorized = !!artist;

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [slug, isAuthorized]);

  const fetchEvents = async () => {
    try {
      const data = await getEventsByArtist(slug || '');
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !venue || !city) return;
    
    setIsSubmitting(true);
    try {
      // Unir fecha y hora para el string ISO
      const isoDate = new Date(`${date}T${time}:00`).toISOString();
      
      await createEvent({
        artistId: artist.id, // Enviar ID real para la BD
        title,
        venue,
        city,
        date: isoDate,
        ticketUrl: ticketUrl || undefined,
      });

      // Limpiar formulario
      setTitle(''); setDate(''); setTime(''); setVenue(''); setCity(''); setTicketUrl('');
      // Refrescar tabla
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Hubo un error al crear la fecha. Verifica tus permisos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta fecha? Se marcará como CANCELLED o se borrará.')) return;
    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Error eliminando la fecha.');
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
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 40 }}>
          <Link to="/dashboard" style={{ color: 'white', opacity: 0.7, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Gestionar {artist.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Módulo de Fechas / Eventos</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30, alignItems: 'start' }}>
          
          {/* Formulario Crear */}
          <div style={{ background: 'var(--bg-soft)', border: '1px solid rgba(255,255,255,0.05)', padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Plus size={20} color="var(--accent-orange)" /> Nueva Fecha
            </h3>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Título del Show / Festival</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Feriado Closing Party" 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Fecha</label>
                  <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Hora</label>
                  <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} 
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Lugar (Venue)</label>
                <input required type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Ej: Club Vertigo" 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>Ciudad, País</label>
                <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ej: Bogotá, CO" 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 6, opacity: 0.7 }}>URL Tickets (Opcional)</label>
                <input type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." 
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 8 }} />
              </div>

              <button disabled={isSubmitting} style={{ background: 'var(--accent-orange)', color: 'black', fontWeight: 'bold', padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', marginTop: 10 }}>
                {isSubmitting ? 'Guardando...' : 'Añadir Fecha'}
              </button>
            </form>
          </div>

          {/* Tabla de Fechas */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>Fechas Actuales</h3>
            </div>
            
            <div style={{ padding: 24 }}>
              {loading ? (
                <p>Cargando fechas...</p>
              ) : events.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hay fechas registradas para este artista.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 15, color: ev.status === 'CANCELLED' ? 'red' : 'white' }}>{ev.title}</span>
                          {ev.status === 'CANCELLED' && <span style={{ fontSize: 10, background: 'rgba(255,0,0,0.2)', color: 'red', padding: '2px 6px', borderRadius: 4 }}>CANCELADO</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 12, alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalIcon size={12} /> {new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {ev.venue}, {ev.city}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(ev.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.8 }} title="Cancelar evento">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
