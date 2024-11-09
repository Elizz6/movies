'use client'

import { useState } from 'react';
import { Movie } from '@/types/movies';
import { updateMovie, deleteMovie } from '@/lib/actions';

interface MovieListProps {
  initialMovies: Movie[];
}

export default function MovieList({ initialMovies }: MovieListProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Movie | null>(null);

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id!);
    setEditForm(movie);
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

  const handleDelete = async (id: string) => {
    const result = await deleteMovie(id);
    if (result.success) {
      setMovies(movies.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {movies.map((movie) => (
        <div key={movie.id} className="border rounded-lg p-4">
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
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
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