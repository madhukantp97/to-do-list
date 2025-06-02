"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Download, Upload, Trash2, Plus, Edit, Save } from "lucide-react";
import { Category } from "@/types";

export default function Settings() {
    const {
        settings,
        updateSettings,
        exportData,
        importData,
        categories,
        addCategory,
        updateCategory,
        deleteCategory
    } = useApp();

    const [importFile, setImportFile] = useState<File | null>(null);
    const [newCategory, setNewCategory] = useState({ name: "", color: "#3b82f6" });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleImport = () => {
        if (!importFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                importData(content);
                alert("Data imported successfully!");
            } catch {
                alert("Failed to import data. Please check the file format.");
            }
        };
        reader.readAsText(importFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.name.trim()) return;

        addCategory({
            name: newCategory.name,
            color: newCategory.color
        });

        setNewCategory({ name: "", color: "#3b82f6" });
    };

    const handleUpdateCategory = () => {
        if (!editingCategory || !editingCategory.name.trim()) return;

        updateCategory(editingCategory.id, {
            name: editingCategory.name,
            color: editingCategory.color
        });

        setEditingCategory(null);
    };

    const startEditCategory = (category: Category) => {
        setEditingCategory({ ...category });
    };

    const cancelEditCategory = () => {
        setEditingCategory(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Customize your productivity experience</p>
            </div>

            <Tabs defaultValue="general">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Configure your application preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Toggle between light and dark theme
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Sun className="h-4 w-4" />
                                    <Switch
                                        id="dark-mode"
                                        checked={settings.darkMode}
                                        onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                                    />
                                    <Moon className="h-4 w-4" />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="default-priority">Default Task Priority</Label>
                                <Select
                                    value={settings.defaultTaskPriority}
                                    onValueChange={(value: "low" | "medium" | "high") =>
                                        updateSettings({ defaultTaskPriority: value })
                                    }
                                >
                                    <SelectTrigger id="default-priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Set the default priority for new tasks
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Management */}
                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories Management</CardTitle>
                            <CardDescription>Create and manage categories for tasks, notes, and links</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add New Category */}
                            <div className="space-y-2">
                                <Label>Add New Category</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="Category name"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                    <Input
                                        type="color"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                        className="w-16 p-1 h-10"
                                    />
                                    <Button onClick={handleAddCategory}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Categories List */}
                            <div className="space-y-2">
                                <Label>Existing Categories</Label>
                                <div className="space-y-3">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between p-3 border rounded-md">
                                                {editingCategory && editingCategory.id === category.id ? (
                                                    <div className="flex-1 flex items-center space-x-2">
                                                        <Input
                                                            value={editingCategory.name}
                                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="color"
                                                            value={editingCategory.color}
                                                            onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                                                            className="w-16 p-1 h-10"
                                                        />
                                                        <Button size="sm" onClick={handleUpdateCategory}>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={cancelEditCategory}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center space-x-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            <span>{category.name}</span>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button variant="ghost" size="sm" onClick={() => startEditCategory(category)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No categories found</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Management */}
                <TabsContent value="data">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Export and import your productivity data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Export Data</Label>
                                <p className="text-sm text-muted-foreground">
                                    Download all your tasks, notes, links, and settings as a JSON file
                                </p>
                                <Button onClick={exportData}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Data
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Import Data</Label>
                                <p className="text-sm text-muted-foreground">
                                    Import previously exported data (this will replace your current data)
                                </p>
                                <div className="flex flex-col space-y-2">
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        onClick={handleImport}
                                        disabled={!importFile}
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
