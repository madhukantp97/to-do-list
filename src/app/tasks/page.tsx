"use client";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Task } from "@/types";


export default function Tasks() {
    const { tasks, addTask, updateTask, deleteTask } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
    const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
    const [sortBy, setSortBy] = useState<"date" | "priority" | "title">("date");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium" as "low" | "medium" | "high",
        dueDate: "",
        categories: [] as string[]
    });

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            categories: []
        });
        setEditingTask(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        if (editingTask) {
            updateTask(editingTask.id, formData);
        } else {
            addTask({
                ...formData,
                completed: false
            });
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            dueDate: task.dueDate || "",
            categories: task.categories
        });
        setIsDialogOpen(true);
    };

    const toggleTaskComplete = (taskId: string, completed: boolean) => {
        updateTask(taskId, { completed });
    };

    const filteredTasks = tasks
        .filter(task => {
            if (filter === "pending") return !task.completed;
            if (filter === "completed") return task.completed;
            return true;
        })
        .filter(task => {
            if (priorityFilter === "all") return true;
            return task.priority === priorityFilter;
        })
        .sort((a, b) => {
            if (sortBy === "priority") {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });



    return (
        <div className="space-y-6">


            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">Manage your to-do list</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="Task title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Textarea
                                placeholder="Description (optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingTask ? "Update" : "Add"} Task
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <Select value={filter} onValueChange={(value: "all" | "pending" | "completed") => setFilter(value)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value: "all" | "low" | "medium" | "high") => setPriorityFilter(value)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: "date" | "priority" | "title") => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="priority">Sort by Priority</SelectItem>
                        <SelectItem value="title">Sort by Title</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <Card key={task.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={(checked) => toggleTaskComplete(task.id, checked as boolean)}
                                        />
                                        <div className="flex-1">
                                            <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                                                    {task.priority}
                                                </Badge>
                                                {task.dueDate && (
                                                    <Badge variant="outline">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
