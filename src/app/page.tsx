import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MovieList from '@/components/MovieList';
import AddMovieDialog from '@/components/AddMovieDialog';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Movie Catalog</h1>
        <AddMovieDialog />
      </div>
      <Suspense fallback={<div>Loading movies...</div>}>
        <MovieList initialMovies={movies || []} />
      </Suspense>
      <Toaster />
    </div>
  );
}