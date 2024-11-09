// components/AddMovieDialog.tsx
'use client'

import { useState } from 'react';
import { createMovie } from '@/lib/actions';
import { Movie } from '@/types/movies';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddMovieDialog() {
    const [open, setOpen] = useState(false);
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

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            release_year: new Date().getFullYear(),
            genre: '',
            image_url: '',
        });
        setSelectedImage(null);
        setPreviewUrl('');
        setUploading(false);
    };

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
                
                resetForm();
                setOpen(false);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Movie
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Add New Movie</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-full max-h-[calc(90vh-8rem)] px-6">
                    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter movie title"
                                required
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="relative w-full max-h-[300px] overflow-hidden rounded-lg">
                                    <div className="aspect-video relative">
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
                                            className="absolute top-2 right-2 z-10"
                                            onClick={() => {
                                                setPreviewUrl('');
                                                setSelectedImage(null);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </ScrollArea>
                <div className="flex justify-end gap-2 p-6 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                            resetForm();
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Add Movie'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}