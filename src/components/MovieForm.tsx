// components/MovieForm.tsx
'use client'

import { useState } from 'react';
import { createMovie } from '@/lib/actions';
import { Movie } from '@/types/movies';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
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
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            let imageUrl = '';
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }
            
            const result = await createMovie({
                ...formData,
                image_url: imageUrl,
            } as Movie);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Movie added successfully",
                });
                
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
            } else {
                throw new Error('Failed to create movie');
            }
        } catch (error) {
            console.error('Error creating movie:', error);
            toast({
                title: "Error",
                description: "Failed to add movie",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Movie
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Enter movie title"
                              required
                              className="w-full"
                          />
                      </div>
                      
                      <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Enter movie description"
                              required
                              className="min-h-[100px]"
                          />
                      </div>
  
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="release_year">Release Year</Label>
                              <Input
                                  type="number"
                                  id="release_year"
                                  value={formData.release_year}
                                  onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
                                  min="1888"
                                  max={new Date().getFullYear() + 5}
                                  required
                              />
                          </div>
  
                          <div className="space-y-2">
                              <Label htmlFor="genre">Genre</Label>
                              <Input
                                  id="genre"
                                  value={formData.genre}
                                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                  placeholder="Enter movie genre"
                                  required
                              />
                          </div>
                      </div>
  
                      <div className="space-y-2">
                          <Label htmlFor="poster">Movie Poster</Label>
                          <Input
                              id="poster"
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="cursor-pointer"
                          />
                          {previewUrl && (
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                  <Image
                                      src={previewUrl}
                                      alt="Preview"
                                      fill
                                      className="object-cover"
                                  />
                                  <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => {
                                          setPreviewUrl('');
                                          setSelectedImage(null);
                                      }}
                                  >
                                      Remove
                                  </Button>
                              </div>
                          )}
                      </div>
  
                      <Button 
                          type="submit" 
                          disabled={uploading}
                          className="w-full"
                      >
                          {uploading ? 'Uploading...' : 'Add Movie'}
                      </Button>
                  </form>
              </CardContent>
          </Card>
      );
  }