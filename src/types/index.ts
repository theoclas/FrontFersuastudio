export type Social = {
  platform: string;
  url: string;
  label?: string;
};

export type Spec = {
  label: string;
  category: string;
};

export type Genre = {
  name: string;
};

export type EventShow = {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  ticketUrl?: string;
};

export type Photo = {
  id: string;
  url: string;
  caption?: string;
  category?: string;
};

export type Artist = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  bio: string;
  city?: string;
  coverImage?: string;
  headerImage?: string;
  whatsapp?: string;
  genres: Genre[];
  socials: Social[];
  events: EventShow[];
  photos: Photo[];
  specs: Spec[];
};
