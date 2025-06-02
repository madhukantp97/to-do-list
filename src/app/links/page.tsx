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
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
import { Link as LinkType } from "@/types";

export default function Links() {
    const { links, addLink, updateLink, deleteLink, categories } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkType | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const [formData, setFormData] = useState({
        title: "",
        url: "",
        description: "",
        categories: [] as string[]
    });

    const resetForm = () => {
        setFormData({
            title: "",
            url: "",
            description: "",
            categories: []
        });
        setEditingLink(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.url.trim()) return;

        // Add http:// if missing
        let url = formData.url;
        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }

        if (editingLink) {
            updateLink(editingLink.id, { ...formData, url });
        } else {
            addLink({ ...formData, url });
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (link: LinkType) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            description: link.description || "",
            categories: link.categories
        });
        setIsDialogOpen(true);
    };

    const openLink = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const filteredLinks = links
        .filter(link => {
            const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                link.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || link.categories.includes(categoryFilter);
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Links</h1>
                    <p className="text-muted-foreground">Save and organize your important URLs</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Link
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="URL (e.g., https://example.com)"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                required
                            />
                            <Textarea
                                placeholder="Description (optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <Select
                                value={formData.categories.length > 0 ? formData.categories[0] : ""}
                                onValueChange={(value) => setFormData({ ...formData, categories: [value] })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingLink ? "Update" : "Add"} Link
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
                        placeholder="Search links..."
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

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                        <Card key={link.id} className="h-fit">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-2">{link.title}</CardTitle>
                                    <div className="flex space-x-1">
                                        <Button variant="ghost" size="sm" onClick={() => openLink(link.url)}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => deleteLink(link.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-500 hover:underline break-all"
                                    >
                                        {link.url}
                                    </a>
                                    {link.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {link.description}
                                        </p>
                                    )}
                                    {link.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {link.categories.map((categoryName) => (
                                                <Badge key={categoryName} variant="secondary" className="text-xs">
                                                    {categoryName}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Added {new Date(link.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No links found. Create your first link to get started!</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
