'use server'

import { revalidatePath } from 'next/cache';
import { supabase } from './supabase';
import { Movie } from '@/types/movies';

export async function createMovie(movie: Movie) {
  try {
    const { data, error } = await supabase
      .from('movies')
      .insert([movie])
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/movies');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating movie:', error);
    return { success: false, error };
  }
}

export async function updateMovie(id: string, movie: Partial<Movie>) {
  try {
    const { data, error } = await supabase
      .from('movies')
      .update(movie)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/movies');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating movie:', error);
    return { success: false, error };
  }
}

export async function deleteMovie(id: string) {
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/movies');
    return { success: true };
  } catch (error) {
    console.error('Error deleting movie:', error);
    return { success: false, error };
  }
}