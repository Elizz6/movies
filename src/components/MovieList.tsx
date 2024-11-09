// components/MovieList.tsx
'use client'

import { useState } from 'react';
import { Movie } from '@/types/movies';
import { updateMovie, deleteMovie } from '@/lib/actions';
import { MovieCard } from './MovieCard';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: "Error",
        description: "Failed to delete the old image",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      try {
        if (editForm.image_url) {
          await deleteOldImage(editForm.image_url);
        }

        const imageUrl = await uploadImage(file);
        setEditForm({ ...editForm, image_url: imageUrl });
      } catch (error) {
        console.error('Error updating image:', error);
        toast({
          title: "Error",
          description: "Failed to update image",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const movieToDelete = movies.find(m => m.id === id);
    
    if (movieToDelete?.image_url) {
      await deleteOldImage(movieToDelete.image_url);
    }

    const result = await deleteMovie(id);
    if (result.success) {
      setMovies(movies.filter(m => m.id !== id));
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updatedMovie: Movie) => {
    const result = await updateMovie(id, updatedMovie);
    if (result.success) {
      setMovies(movies.map(m => m.id === id ? updatedMovie : m));
      setEditingId(null);
      setEditForm(null);
      toast({
        title: "Success",
        description: "Movie updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update movie",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onCancel={() => {
            setEditingId(null);
            setEditForm(null);
          }}
          isEditing={editingId === movie.id}
          editForm={editForm}
          setEditForm={setEditForm}
          uploading={uploading}
          onImageChange={handleImageChange}
        />
      ))}
    </div>
  );
}