import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getArtists } from '../services/api';
import type { Artist } from '../types';
import { LogIn, ChevronRight, Disc3, Music2 } from 'lucide-react';
import './Home.css';

// ─── Carga automática de portadas por slug del artista ────────────────────────
//
//  Estructura esperada en assets/:
//    artists/
//      macfly-mikebran/cover.jpg     ← slug del artista = nombre de carpeta
//      diann-makinne/cover.png
//      molina-music/cover.jpg
//      nuevo-artista/cover.webp      ← al agregar un artista, solo crea esta carpeta
//
//  Formatos soportados: jpg, jpeg, png, webp
//  Formato recomendado para nuevos artistas: webp (mejor compresión)
//
const rawCovers = import.meta.glob<{ default: string }>(
  '../assets/artists/*/cover.{jpg,jpeg,png,webp}',
  { eager: true }
);

// Construye mapa: { 'macfly-mikebran': '/ruta/imagen.jpg', ... }
// La clave es el nombre de la carpeta (slug del artista)
const COVER_BY_SLUG: Record<string, string> = {};
for (const [path, mod] of Object.entries(rawCovers)) {
  // path ej: "../assets/artists/macfly-mikebran/cover.jpg"
  const slug = path.split('/').at(-2) ?? '';
  if (slug) COVER_BY_SLUG[slug] = mod.default;
}

// ─── Colores de acento por slot de artista ────────────────────────────────────
// Agrega más entradas si necesitas más de 4 artistas
const ARTIST_ACCENTS = [
  { glow: 'rgba(168, 85, 247, 0.6)', tag: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', color: '#c084fc' },
  { glow: 'rgba(0, 245, 255, 0.5)',  tag: 'rgba(0,245,255,0.12)',  border: 'rgba(0,245,255,0.25)', color: '#00f5ff' },
  { glow: 'rgba(249, 115, 22, 0.5)', tag: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', color: '#fb923c' },
  { glow: 'rgba(236, 72, 153, 0.5)', tag: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', color: '#f472b6' },
];

// ─── Fallback offline (sin backend) ──────────────────────────────────────────
const STATIC_ARTISTS = [
  {
    id: '1', slug: 'macfly-mikebran', name: 'Mac Fly & Mike Bran',
    tagline: 'House · Tech House · Minimal Deep Tech',
    bio: '', genres: [{ name: 'House' }, { name: 'Tech House' }, { name: 'Minimal' }],
    socials: [], events: [], photos: [], specs: [], coverImage: COVER_BY_SLUG['macfly-mikebran'] ?? '',
  },
  {
    id: '2', slug: 'diann-makinne', name: 'Diann & Makinne',
    tagline: 'Techno · Melodic Progressive · Live',
    bio: '', genres: [{ name: 'Techno' }, { name: 'Melodic' }, { name: 'Live' }],
    socials: [], events: [], photos: [], specs: [], coverImage: COVER_BY_SLUG['diann-makinne'] ?? '',
  },
  {
    id: '3', slug: 'molina-music', name: 'Molina Music',
    tagline: 'House · Deep House · Electronic',
    bio: '', genres: [{ name: 'House' }, { name: 'Deep House' }, { name: 'Electronic' }],
    socials: [], events: [], photos: [], specs: [], coverImage: COVER_BY_SLUG['molina-music'] ?? '',
  },
];

export default function Home() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArtists()
      .then((data) => {
        setArtists(data.length > 0 ? data : STATIC_ARTISTS as unknown as Artist[]);
        setLoading(false);
      })
      .catch(() => {
        setArtists(STATIC_ARTISTS as unknown as Artist[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-wrapper">

      {/* ── Top Navbar ── */}
      <nav className="home-nav">
        <div className="nav-brand">
          <Disc3 size={20} className="nav-icon" />
          <span>FersuaStudio</span>
        </div>
        <Link to="/login" className="nav-login-btn" id="nav-login-link">
          <LogIn size={15} />
          <span>Admin</span>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="hero-eyebrow">
            <Music2 size={12} />
            Booking Agency · Medellín
          </span>
          <h1 className="hero-title">
            El sonido que<br />
            <span className="hero-highlight">mueve tu evento</span>
          </h1>
          <p className="hero-desc">
            Selecciona un artista, revisa su propuesta y solicita tu fecha directamente.
          </p>
        </motion.div>
      </section>

      {/* ── Artists ── */}
      <section className="artists-section">
        <p className="section-label">· Nuestros Artistas ·</p>

        {loading ? (
          <div className="loading-state">
            <span className="loading-ring" />
            <span>Cargando artistas...</span>
          </div>
        ) : (
          <div className="artists-grid">
            {artists.map((artist, i) => {
              const accent = ARTIST_ACCENTS[i % ARTIST_ACCENTS.length];
              // Merge with static fallback for tagline/genres if missing
              const staticRef = STATIC_ARTISTS[i];
              const tagline = (artist as any).tagline || staticRef?.tagline || 'Electronic Music';
              const genres = artist.genres?.length > 0 ? artist.genres : (staticRef?.genres || []);

              const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
              const coverUrl = artist.coverImage ? `${API_BASE}${artist.coverImage}` : COVER_BY_SLUG[artist.slug] || '';

              return (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: 'easeOut' }}
                >
                  <Link to={`/${artist.slug}`} className="artist-card" id={`artist-card-${artist.slug}`}>
                    {/* Background Image: BD → local por slug → vacío */}
                    <div
                      className="card-bg"
                      style={{ backgroundImage: `url(${coverUrl})` }}
                    />


                    {/* Gradient Overlay */}
                    <div className="card-overlay" />

                    {/* Glow accent at bottom */}
                    <div className="card-glow" style={{ background: accent.glow }} />

                    {/* Content */}
                    <div className="card-content">
                      {/* Top: genre tags */}
                      <div className="card-tags">
                        {genres.map((g: any) => (
                          <span
                            key={g.id || g.name}
                            className="genre-pill"
                            style={{
                              background: accent.tag,
                              border: `1px solid ${accent.border}`,
                              color: accent.color,
                            }}
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>

                      {/* Bottom: name + cta */}
                      <div className="card-bottom">
                        <h2 className="card-name">{artist.name}</h2>
                        <p className="card-tagline">{tagline}</p>
                        <div className="card-cta">
                          <span>Solicitar Booking</span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <span className="footer-logo">FersuaStudio</span>
        <span className="footer-dot" />
        <span>Medellín, Colombia · {new Date().getFullYear()}</span>
      </footer>

    </div>
  );
}
