'use client'

import { useState } from 'react';
import { createMovie } from '@/lib/actions';
import { Movie } from '@/types/movies';

export default function MovieForm() {
    const [formData, setFormData] = useState<Partial<Movie>>({
        title: '',
        description: '',
        release_year: new Date().getFullYear(),
        genre: '',
      });
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createMovie(formData as Movie);
        setFormData({
          title: '',
          description: '',
          release_year: new Date().getFullYear(),
          genre: '',
        });
      };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="release_year" className="block text-sm font-medium text-gray-700">
          Release Year
        </label>
        <input
          type="number"
          id="release_year"
          value={formData.release_year}
          onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
          Genre
        </label>
        <input
          type="text"
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Movie
      </button>
    </form>
  );
}