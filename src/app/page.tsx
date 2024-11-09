import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MovieForm from '@/components/MovieForm';
import MovieList from '@/components/MovieList';
import { Toaster } from '@/components/ui/toaster';

export default async function MoviesPage() {
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Movie Catalog</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <MovieForm />
      </Suspense>
      <Suspense fallback={<div>Loading movies...</div>}>
        <MovieList initialMovies={movies || []} />
      </Suspense>
      <Toaster />
    </div>
  );
}