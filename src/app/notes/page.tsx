"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Note } from "@/types";

export default function Notes() {
    const { notes, addNote, updateNote, deleteNote, categories } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        categories: [] as string[]
    });

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            categories: []
        });
        setEditingNote(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        if (editingNote) {
            updateNote(editingNote.id, formData);
        } else {
            addNote(formData);
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            categories: note.categories
        });
        setIsDialogOpen(true);
    };

    const formatText = (text: string, type: "bold" | "italic" | "bullet") => {
        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);

        let newText = "";
        if (type === "bold") {
            newText = `**${selectedText}**`;
        } else if (type === "italic") {
            newText = `*${selectedText}*`;
        } else if (type === "bullet") {
            newText = `• ${selectedText}`;
        }

        const updatedContent = text.substring(0, start) + newText + text.substring(end);
        setFormData({ ...formData, content: updatedContent });
    };

    const filteredNotes = notes
        .filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || note.categories.includes(categoryFilter);
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Notes</h1>
                    <p className="text-muted-foreground">Capture your thoughts and ideas</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Note
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Note title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            {/* Rich Text Formatting Buttons */}
                            <div className="flex space-x-2 border-b pb-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => formatText(formData.content, "bold")}
                                >
                                    <strong>B</strong>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => formatText(formData.content, "italic")}
                                >
                                    <em>I</em>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => formatText(formData.content, "bullet")}
                                >
                                    •
                                </Button>
                            </div>

                            <Textarea
                                name="content"
                                placeholder="Write your note here... Use **bold**, *italic*, or • for bullets"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-48"
                                required
                            />

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingNote ? "Update" : "Add"} Note
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                        <Card key={note.id} className="h-fit">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                                    <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div
                                        className="text-sm text-muted-foreground line-clamp-6"
                                        dangerouslySetInnerHTML={{
                                            __html: note.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                .replace(/^• (.+)$/gm, '<li>$1</li>')
                                                .replace(/\n/g, '<br>')
                                        }}
                                    />
                                    {note.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {note.categories.map((categoryName) => (
                                                <Badge key={categoryName} variant="secondary" className="text-xs">
                                                    {categoryName}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No notes found. Create your first note to get started!</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
