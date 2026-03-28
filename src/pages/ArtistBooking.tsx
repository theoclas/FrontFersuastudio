import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submitBooking, getEventsByArtist, getArtistBySlug } from '../services/api';
import type { Artist } from '../types';
import './ArtistBooking.css';

// ─── Carga automática de imágenes ──────────────────────────────────────────
const allGalleryImgs = import.meta.glob<{ default: string }>(
  '../assets/artists/*/*imagen*.{jpg,jpeg,png,webp}',
  { eager: true }
);

function getGalleryForSlug(slug: string): string[] {
  return Object.entries(allGalleryImgs)
    .filter(([path]) => path.includes(`/artists/${slug}/`))
    .sort(([a], [b]) => {
      const numA = parseInt(a.match(/imagen(\d+)/i)?.[1] ?? '0');
      const numB = parseInt(b.match(/imagen(\d+)/i)?.[1] ?? '0');
      return numA - numB;
    })
    .map(([, mod]) => mod.default);
}

const allCovers = import.meta.glob<{ default: string }>(
  '../assets/artists/*/cover.{jpg,jpeg,png,webp}',
  { eager: true }
);
const COVER_BY_SLUG: Record<string, string> = {};
for (const [path, mod] of Object.entries(allCovers)) {
  const slug = path.split('/').at(-2) ?? '';
  if (slug) COVER_BY_SLUG[slug] = mod.default;
}

// ─── Tipo extendido para fallback ────────────────────────────────────────────
type ExtendedArtistInfo = Partial<Artist> & {
  whatsapp?: string;
  members?: { name: string; role: string; desc: string; photo: string; ig: string; sc: string }[];
  shows?: { date: string; place: string; bookLink?: string }[];
  highlightImages?: string[];
  specsStringList?: string[];
};

// ─── Fallback similar a los HTML originales ──────────────────────────────────
const ARTIST_FALLBACKS: Record<string, ExtendedArtistInfo> = {
  'macfly-mikebran': {
    id: '1', slug: 'macfly-mikebran', name: 'Mike Bran & Macfly',
    tagline: 'Electronic club show',
    bio: 'Mike Bran & Macfly son un dúo de DJs originarios de Medellín, dedicados a llevar energía y buen ritmo a cualquier tipo de escenario. Con una gran versatilidad horaria, ofrecen sets inmersivos cargados de groove y atmósferas electrónicas que conectan con el público desde el primer beat.',
    genres: [{ name: 'House' }, { name: 'Tech House' }, { name: 'Minimal Deep Tech' }, { name: 'Jackin & Funky' }],
    whatsapp: '573505209860',
    specsStringList: ['DJM V10', 'ALLEN HEATH XONE 92/96', 'DJM 900NXS2', 'CDJ 3000', 'CDJ 2000 NEXUS 2', 'XDJ XZ/RX3', 'RMX 1000'],
    members: [
      {
        name: 'Mike Bran', role: 'House / Tech / Jackin · DJ',
        desc: 'Un sonido cargado de groove y energía, con atmósferas alegres y melodías emotivas que iluminan cualquier dancefloor.',
        photo: getGalleryForSlug('macfly-mikebran')[0] || '', // fallbacks si las tuviera separadas
        ig: 'https://www.instagram.com/mikebran_/',
        sc: 'https://soundcloud.com/macfly-mike-bran'
      },
      {
        name: 'Macfly', role: 'Tech House / Minimal deep Tech / House · DJ',
        desc: 'Energía marcada por bajos firmes, capas sintéticas con atmósferas que generan tensión y movimiento.',
        photo: getGalleryForSlug('macfly-mikebran')[1] || '',
        ig: 'https://www.instagram.com/macfly_ofc/',
        sc: 'https://soundcloud.com/macfly-mike-bran'
      }
    ],
    shows: [
      { date: '14 NOV', place: 'Ramasound Garden' },
      { date: '16 NOV', place: 'Paramount Records x Nakai Rooftop' },
      { date: '27 NOV', place: 'Viuz' },
      { date: '29 NOV', place: 'Grooveland x La terraza.deepink' },
      { date: '30 NOV', place: 'Sonorama' }
    ]
  },
  'diann-makinne': {
    id: '2', slug: 'diann-makinne', name: 'Diann & Makinne',
    tagline: 'DJs · Medellín · Electronic',
    bio: 'Mike Bran & Macfly son un dúo de DJs originarios de Medellín, dedicados a llevar energía y buen ritmo a cualquier tipo de escenario. Con una gran versatilidad horaria, ofrecen sets inmersivos cargados de groove y atmósferas electrónicas que conectan con el público desde el primer beat.',
    genres: [{ name: 'Techno' }, { name: 'Melodic Progressive' }, { name: 'Live Experience' }],
    whatsapp: '573013530292',
    specsStringList: ['DJM V10', 'CDJ 3000'],
    members: [
      {
        name: 'Diann', role: 'DJ & Productor',
        desc: 'DJ y productor orientado a sonidos melodic techno y progressive, con sets detallistas y una fuerte conexión con la pista.',
        photo: '', ig: 'https://instagram.com/_dianndj/', sc: 'https://soundcloud.com/diann-dj-6943050'
      },
      {
        name: 'Makinne', role: 'DJ & Productor',
        desc: 'Enfocado en house, deep y grooves hipnóticos, aporta calidez y ritmo al formato B2B.',
        photo: '', ig: 'https://instagram.com/makinne_345/', sc: 'https://soundcloud.com/julianwowboyz'
      }
    ],
  },
  'molina-music': {
    id: '3', slug: 'molina-music', name: 'Molina Music',
    tagline: 'DJ & Producer',
    bio: 'Creando experiencias sonoras únicas que fusionan los ritmos electrónicos del house con composiciones originales. Disponible para festivales, eventos privados, corporativos y producción musical personalizada.',
    genres: [{ name: 'House' }, { name: 'Deep House' }, { name: 'Electronic' }],
    whatsapp: '573045229120',
  }
};


export default function ArtistBooking() {
  const { slug } = useParams<{ slug: string }>();
  
  // States
  const [activeTab, setActiveTab] = useState<'photos' | 'presskit'>('photos');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', date: '', city: '', message: '' });
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbArtist, setDbArtist] = useState<any>(null);

  // Data
  const fbData = slug ? ARTIST_FALLBACKS[slug] : null;
  const galleryImgs = slug ? getGalleryForSlug(slug) : [];
  const coverImg = slug ? COVER_BY_SLUG[slug] : '';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) {
      getEventsByArtist(slug).then(data => {
        // Filter out cancelled events for public view
        setDbEvents(data.filter((e: any) => e.status !== 'CANCELLED'));
      }).catch(err => console.error(err));
      
      getArtistBySlug(slug).then(data => {
        setDbArtist(data);
      }).catch(err => console.error(err));
    }
  }, [slug]);

  if (!fbData && !dbArtist) {
    return (
      <div className="booking-page-wrapper">
        <div className="booking-shell">
          <p>Artista no encontrado</p>
          <Link to="/" style={{color: 'white'}}>Volver</Link>
        </div>
      </div>
    );
  }

  const handleTabClick = (tab: 'photos' | 'presskit') => {
    setActiveTab(tab);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('loading');
    
    // Original WA behavior
    const targetWa = dbArtist?.whatsapp || fbData?.whatsapp || '573505209860';
    const textMsg = `Solicitud de booking%0A%0ANombre: ${formData.name}%0AEmail: ${formData.email}%0AFecha: ${formData.date}%0ACiudad: ${formData.city}%0ADetalles: ${formData.message}`;
    
    // Simulate API call and redirect
    try {
      const artId = dbArtist?.id || fbData?.id;
      if (artId) await submitBooking({ ...formData, eventType: 'club', phone: '', eventCity: formData.city, eventDate: formData.date, artistId: artId });
      window.open(`https://wa.me/${targetWa}?text=${textMsg}`, '_blank');
      setBookingStatus('success');
      setFormData({ name: '', email: '', date: '', city: '', message: '' });
      setTimeout(() => setBookingStatus('idle'), 5000);
    } catch {
      window.open(`https://wa.me/${targetWa}?text=${textMsg}`, '_blank');
      setBookingStatus('success');
      setTimeout(() => setBookingStatus('idle'), 5000);
    }
  };

  const mainImage = coverImg || '';
  
  const showsToShow = dbEvents.length > 0 
    ? dbEvents.map(e => ({
        date: new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase(),
        place: `${e.venue}, ${e.city}`,
        bookLink: e.ticketUrl,
     }))
    : fbData?.shows || [];

  // Derived Info (DB preferred, fallback to HTML hardcode)
  const artistName = dbArtist?.name || fbData?.name;
  const artistTagline = dbArtist?.tagline || fbData?.tagline;
  const artistBio = dbArtist?.bio || fbData?.bio;
  const artistWa = dbArtist?.whatsapp || fbData?.whatsapp || '573505209860';
  const membersList = fbData?.members || [];
  const genresList = dbArtist?.genres?.length > 0 ? dbArtist.genres : fbData?.genres || [];
  const specsList = dbArtist?.specs?.length > 0 ? dbArtist.specs.map((s: any) => s.label) : fbData?.specsStringList || [];

  return (
    <div className="booking-page-wrapper">
      <div className="booking-shell">
        
        {/* NAV */}
        <nav className="booking-nav">
          <div className="booking-nav-left">
            <Link to="/" className="booking-brand">{artistName}</Link>
            <div className="booking-nav-tag">Booking</div>
          </div>
          <div className="booking-nav-links">
            {membersList.length > 0 && <a href="#artistas">Artistas</a>}
            {showsToShow.length > 0 && <a href="#fechas">Fechas</a>}
            <a href="#booking">Solicitud</a>
          </div>
        </nav>

        {/* HERO */}
        <header className="booking-hero">
          <div className="hero-left">
            <div className="hero-label">DJs</div>
            <h1 className="hero-title">{artistTagline}</h1>
            <p className="hero-sub" style={{ whiteSpace: 'pre-wrap' }}>{artistBio}</p>

            <div className="hero-genres">
              {genresList.map((g: any) => (
                <span key={g.name} className="hero-chip">{g.name}</span>
              ))}
            </div>

            <div className="hero-cta">
              <a 
                className="booking-btn booking-btn-primary" 
                href={`https://wa.me/${artistWa}?text=Hola%20quiero%20cotizar%20booking`} 
                target="_blank" rel="noopener noreferrer"
              >
                WhatsApp Booking
              </a>
              <a className="booking-btn booking-btn-secondary" href="#booking">Enviar solicitud</a>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-photo">
              {mainImage && <img src={mainImage} alt={artistName} />}
              <div className="hero-photo-caption">
                <span>Live club show</span>
                <span>2024 / 2025</span>
              </div>
            </div>
            
            <div className="hero-mini">
              <div className="mini-card">
                <div className="mini-label">Live Setup</div>
                <div className="mini-title">Specs</div>
                <div className="mini-tabs">
                  <button 
                    className={`media-tab-btn ${activeTab === 'presskit' ? 'is-active' : ''}`}
                    onClick={() => handleTabClick('presskit')}
                  >
                    Rider Tecnico
                  </button>
                </div>
              </div>
              <div className="mini-card">
                <div className="mini-label">Media</div>
                <div className="mini-title">Highlights</div>
                <div className="mini-tabs">
                  <button 
                    className={`media-tab-btn ${activeTab === 'photos' ? 'is-active' : ''}`}
                    onClick={() => handleTabClick('photos')}
                  >
                    Photos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MEDIA MODULE */}
        <section className="media-module" id="media-module">
          
          {/* TAB PHOTOS */}
          {activeTab === 'photos' && (
            <div className="media-inner is-visible" data-tab="photos">
              <div className="sec-title">Galería</div>
              <div className="media-grid">
                {galleryImgs.length > 0 ? (
                  galleryImgs.map((imgUrl, i) => (
                    <figure key={i} className="media-item">
                      <img src={imgUrl} alt={`Promo photo ${i}`} />
                    </figure>
                  ))
                ) : (
                  <p style={{color: 'var(--muted)', fontSize: '13px'}}>No hay fotos en galería aún. (Agrega imágenes con formato {slug}imagen1.jpg en /assets/artists/{slug}/)</p>
                )}
              </div>
            </div>
          )}

          {/* TAB PRESSKIT (RIDER) */}
          {activeTab === 'presskit' && (
            <div className="media-inner is-visible" data-tab="presskit">
              <div className="sec-title">Rider Técnico</div>
              <div className="media-grid">
                {specsList.map((spec: string, i: number) => (
                  <figure key={i} className="media-item2">
                    <b>{spec}</b>
                  </figure>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* GRID PRINCIPAL */}
        <div className="booking-section-grid">
          
          {/* ARTISTAS (INDIVIDUALES) */}
          {membersList.length > 0 ? (
            <section id="artistas" className="booking-section">
              <div className="sec-title">Artistas</div>
              <div className="sec-sub">Bookea a cada DJ por separado o el show completo.</div>

              <div className="artists-list">
                {membersList.map((member: any, i: number) => (
                  <article key={i} className="booking-artist-card">
                    <div className="booking-artist-photo">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} />
                      ) : (
                        <div style={{width:'100%', height:'100%', background:'#1e293b'}} />
                      )}
                    </div>
                    <div>
                      <h2 className="booking-artist-name">{member.name}</h2>
                      <div className="booking-artist-role">{member.role}</div>
                      <p className="booking-artist-desc">{member.desc}</p>
                      <div className="socials-list">
                        {member.ig && <a href={member.ig} target="_blank" rel="noopener noreferrer">Instagram</a>}
                        {member.sc && <a href={member.sc} target="_blank" rel="noopener noreferrer">SoundCloud</a>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
             <section className="booking-section">
                <div className="sec-title">Acerca de</div>
                <div className="sec-sub">Información adicional.</div>
                <p style={{fontSize: '13px', color: 'var(--muted)'}}>Disponible para todos los escenarios.</p>
             </section>
          )}

          {/* FECHAS */}
          <section id="fechas" className="booking-section">
            <div className="sec-title">Fechas</div>
            <div className="sec-sub">Agenda actual y espacios abiertos para nuevas reservas.</div>
            
            <div className="shows-list">
              {showsToShow.map((s, i) => (
                <div key={i} className="show-item">
                  <div className="show-date">{s.date}</div>
                  <div className="show-place">{s.place}</div>
                  <div className="show-cta">
                    <a href={s.bookLink || `https://wa.me/${fbData?.whatsapp || '573505209860'}`} target="_blank" rel="noopener noreferrer">
                      {s.date === 'Disponible' ? 'Reservar' : 'Book'}
                    </a>
                  </div>
                </div>
              ))}
              
              {/* Opción disponible siempre */}
              <div className="show-item" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8, paddingTop: 16 }}>
                  <div className="show-date" style={{ color: 'var(--accent)' }}>Disponible</div>
                  <div className="show-place">Abrir nueva fecha en tu ciudad</div>
                  <div className="show-cta">
                    <a href={`https://wa.me/${fbData?.whatsapp || '573505209860'}`} target="_blank" rel="noopener noreferrer">
                      Reservar
                    </a>
                  </div>
              </div>
            </div>

            <p className="shows-note">
              Para otras fechas o giras, envía tu idea de evento y coordinamos agenda completa.
            </p>
          </section>

        </div>

        {/* FORM COMPLETO */}
        <section id="booking" className="booking-section booking-form-wrap">
          <div className="sec-title">Solicitud de booking</div>
          <div className="sec-sub">Completa los datos básicos y te responderemos con la propuesta y condiciones.</div>
          
          <form onSubmit={handleBookingSubmit} id="booking-form">
            <label htmlFor="name">Nombre y empresa / productora</label>
            <input id="name" required placeholder="Tu nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

            <label htmlFor="email">Email</label>
            <input id="email" type="email" required placeholder="tu@correo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />

            <label htmlFor="date">Fecha del evento</label>
            <input id="date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />

            <label htmlFor="city">Ciudad / Lugar evento</label>
            <input id="city" placeholder="Ciudad, país • Lugar evento" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />

            <label htmlFor="message">Detalles del evento</label>
            <textarea id="message" placeholder="Tipo de evento, horario, duración del set, presupuesto, requisitos técnicos..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />

            <div className="booking-form-footer">
              <button className="booking-btn booking-btn-primary" type="submit" disabled={bookingStatus === 'loading'}>
                {bookingStatus === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
              </button>

              <a className="booking-btn booking-btn-secondary" href={`https://wa.me/${fbData?.whatsapp || '573505209860'}?text=Hola,%20quiero%20cotizar%20booking`} target="_blank" rel="noopener noreferrer">
                Hablar por WhatsApp
              </a>
            </div>

            {bookingStatus === 'success' && <div className="booking-form-alert success">Redirigiendo a WhatsApp o Solicitud Guardada Correctamente.</div>}
            {bookingStatus === 'error' && <div className="booking-form-alert error">Error enviando, prueba con WhatsApp.</div>}

            <p className="booking-small-note">
              Al enviar aceptas ser contactado por email o WhatsApp con info de disponibilidad, cachet y rider técnico.
            </p>
          </form>
        </section>

        <div className="booking-footer-text">
          © {new Date().getFullYear()} {fbData?.name} — Booking
        </div>

      </div>
    </div>
  );
}
