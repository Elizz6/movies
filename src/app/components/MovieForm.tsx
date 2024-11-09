'use client'

import { useState } from 'react';
import { createMovie } from '@/lib/actions';
import { Movie } from '@/types/movies';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function MovieForm() {
    const [formData, setFormData] = useState<Partial<Movie>>({
        title: '',
        description: '',
        release_year: new Date().getFullYear(),
        genre: '',
        image_url: '',
    });
    
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);
            
            // Create unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            
            // Upload image to Supabase Storage
            const { data, error } = await supabase.storage
                .from('movie-posters')
                .upload(fileName, file);
                
            if (error) throw error;
            
            // Get public URL
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            let imageUrl = '';
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }
            
            await createMovie({
                ...formData,
                image_url: imageUrl,
            } as Movie);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                release_year: new Date().getFullYear(),
                genre: '',
                image_url: '',
            });
            setSelectedImage(null);
            setPreviewUrl('');
        } catch (error) {
            console.error('Error creating movie:', error);
        }
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

            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Movie Poster
                </label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                />
                {previewUrl && (
                    <div className="mt-2">
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            width={200}
                            height={300}
                            className="rounded-lg object-cover"
                        />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {uploading ? 'Uploading...' : 'Add Movie'}
            </button>
        </form>
    );
}