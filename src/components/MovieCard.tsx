"use client"

import { Movie } from '@/types/movies';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, movie: Movie) => void;
  onCancel: () => void;
  isEditing: boolean;
  editForm: Movie | null;
  setEditForm: (movie: Movie | null) => void;
  uploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MovieCard({
  movie,
  onEdit,
  onDelete,
  onUpdate,
  onCancel,
  isEditing,
  editForm,
  setEditForm,
  uploading,
  onImageChange,
}: MovieCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    onUpdate(movie.id!, editForm);
  };

  return (
    <Card className="w-full">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editForm?.title}
              onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editForm?.description}
              onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="release_year">Release Year</Label>
            <Input
              id="release_year"
              type="number"
              value={editForm?.release_year}
              onChange={(e) => setEditForm({ ...editForm!, release_year: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={editForm?.genre}
              onChange={(e) => setEditForm({ ...editForm!, genre: e.target.value })}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="image">Movie Poster</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Changes'}
            </Button>
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
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
          <CardHeader>
            <CardTitle>{movie.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{movie.description}</p>
            <div className="flex gap-4 text-sm">
              <span>Release Year: {movie.release_year}</span>
              <span>Genre: {movie.genre}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(movie)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(movie.id!)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}