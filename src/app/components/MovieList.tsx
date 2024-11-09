'use client'

import { useState } from 'react';
import { Movie } from '@/types/movies';
import { updateMovie, deleteMovie } from '@/lib/actions';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface MovieListProps {
  initialMovies: Movie[];
}

export default function MovieList({ initialMovies }: MovieListProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Movie | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id!);
    setEditForm(movie);
  };

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const pathname = new URL(url).pathname;
      // La ruta típica es /storage/v1/object/public/movie-posters/filename
      // Queremos extraer solo 'movie-posters/filename'
      const parts = pathname.split('/public/');
      return parts[1] || null;
    } catch (error) {
      console.error('Error extracting file path:', error);
      return null;
    }
  };

  const deleteOldImage = async (oldImageUrl: string) => {
    try {
      const filePath = extractFilePathFromUrl(oldImageUrl);
      if (!filePath) return;

      const { error } = await supabase.storage
        .from('movie-posters')
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('movie-posters')
        .upload(fileName, file);
          
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('movie-posters')
        .getPublicUrl(fileName);
          
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      try {
        // Si hay una imagen anterior, la borramos primero
        if (editForm.image_url) {
          await deleteOldImage(editForm.image_url);
        }

        const imageUrl = await uploadImage(file);
        setEditForm({ ...editForm, image_url: imageUrl });
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    // Encontrar la película antes de eliminarla
    const movieToDelete = movies.find(m => m.id === id);
    
    if (movieToDelete?.image_url) {
      await deleteOldImage(movieToDelete.image_url);
    }

    const result = await deleteMovie(id);
    if (result.success) {
      setMovies(movies.filter(m => m.id !== id));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editingId) return;

    const result = await updateMovie(editingId, editForm);
    if (result.success) {
      setMovies(movies.map(m => m.id === editingId ? editForm : m));
      setEditingId(null);
      setEditForm(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="border rounded-lg p-4 space-y-4">
          {editingId === movie.id ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={editForm?.title}
                onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                className="w-full border rounded p-2"
              />
              <textarea
                value={editForm?.description}
                onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                className="w-full border rounded p-2"
              />
              <input
                type="number"
                value={editForm?.release_year}
                onChange={(e) => setEditForm({ ...editForm!, release_year: parseInt(e.target.value) })}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                value={editForm?.genre}
                onChange={(e) => setEditForm({ ...editForm!, genre: e.target.value })}
                className="w-full border rounded p-2"
              />
              <div className="space-y-2">
                {editForm?.image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={editForm.image_url}
                      alt={editForm.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditForm(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {movie.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={movie.image_url}
                    alt={movie.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold">{movie.title}</h3>
              <p className="text-gray-600">{movie.description}</p>
              <p className="text-sm">Release Year: {movie.release_year}</p>
              <p className="text-sm">Genre: {movie.genre}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id!)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}