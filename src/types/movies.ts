export interface Movie {
    id?: string;
    title: string;
    description: string;
    release_year: number; // Cambiado de releaseYear a release_year
    genre: string;
    image_url?: string; // Cambiado de imageUrl a image_url
    created_at?: string;
    updated_at?: string;
  }