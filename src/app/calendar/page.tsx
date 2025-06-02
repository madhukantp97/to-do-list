"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Task, Reminder } from "@/types";

export default function Calendar() {
    const { tasks, reminders, addReminder, updateReminder, deleteReminder } = useApp();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedDateString, setSelectedDateString] = useState<string>(new Date().toISOString().split("T")[0]);
    const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "12:00",
        type: "general" as "task" | "note" | "general",
        relatedId: "",
        completed: false
    });

    useEffect(() => {
        if (selectedDate) {
            setSelectedDateString(selectedDate.toISOString().split("T")[0]);
        }
    }, [selectedDate]);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            date: selectedDateString,
            time: "12:00",
            type: "general",
            relatedId: "",
            completed: false
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.date) return;

        addReminder(formData);
        resetForm();
        setIsAddReminderOpen(false);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setSelectedDateString(date.toISOString().split("T")[0]);
            setIsDialogOpen(false);
        }
    };

    const toggleReminderComplete = (reminderId: string, completed: boolean) => {
        updateReminder(reminderId, { completed });
    };

    // Get tasks and reminders for the selected date
    const tasksForSelectedDate = tasks.filter(task =>
        task.dueDate === selectedDateString
    );

    const remindersForSelectedDate = reminders.filter(reminder =>
        reminder.date === selectedDateString
    );

    // Get dates with tasks or reminders for calendar highlighting
    const datesWithItems = [...tasks, ...reminders].reduce((dates, item) => {
        const date = item.hasOwnProperty('dueDate')
            ? (item as Task).dueDate
            : (item as Reminder).date;

        if (date && !dates.includes(date)) {
            dates.push(date);
        }
        return dates;
    }, [] as string[]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Calendar</h1>
                    <p className="text-muted-foreground">Manage your schedule and reminders</p>
                </div>
                <div className="flex space-x-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Select Date</DialogTitle>
                            </DialogHeader>
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="rounded-md border"
                                modifiers={{
                                    highlighted: (date) => {
                                        const dateString = date.toISOString().split("T")[0];
                                        return datesWithItems.includes(dateString);
                                    }
                                }}
                                modifiersStyles={{
                                    highlighted: { backgroundColor: "rgba(59, 130, 246, 0.1)" }
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Reminder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Reminder</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    placeholder="Reminder title"
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date</label>
                                        <Input
                                            type="date"
                                            value={formData.date || selectedDateString}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Time</label>
                                        <Input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Select value={formData.type} onValueChange={(value: "task" | "note" | "general") => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Reminder type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="task">Task</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddReminderOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Add Reminder
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                            modifiers={{
                                highlighted: (date) => {
                                    const dateString = date.toISOString().split("T")[0];
                                    return datesWithItems.includes(dateString);
                                }
                            }}
                            modifiersStyles={{
                                highlighted: { backgroundColor: "rgba(59, 130, 246, 0.1)" }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Selected Date Items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedDate ? format(selectedDate, "PPPP") : "Select a date"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Tasks Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Tasks Due</h3>
                                {tasksForSelectedDate.length > 0 ? (
                                    <div className="space-y-3">
                                        {tasksForSelectedDate.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md">
                                                <div className="flex items-center space-x-3">
                                                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                                                        {task.priority}
                                                    </Badge>
                                                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No tasks due on this date</p>
                                )}
                            </div>

                            {/* Reminders Section */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Reminders</h3>
                                {remindersForSelectedDate.length > 0 ? (
                                    <div className="space-y-3">
                                        {remindersForSelectedDate.map((reminder) => (
                                            <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-md">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className={reminder.completed ? "line-through text-muted-foreground" : "font-medium"}>
                                                            {reminder.title}
                                                        </span>
                                                        <Badge variant="outline">{reminder.time}</Badge>
                                                    </div>
                                                    {reminder.description && (
                                                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                                                            {reminder.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleReminderComplete(reminder.id, !reminder.completed)}
                                                    >
                                                        {reminder.completed ? "Undo" : "Complete"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteReminder(reminder.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No reminders for this date</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
