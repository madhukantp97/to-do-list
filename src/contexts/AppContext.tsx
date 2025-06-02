"use client"; // <--- ADD THIS DIRECTIVE AT THE VERY TOP

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Task, Note, Link, Category, Reminder, CalculatorHistory, AppSettings } from "@/types";

interface AppContextType {
    tasks: Task[];
    notes: Note[];
    links: Link[];
    categories: Category[];
    reminders: Reminder[];
    calculatorHistory: CalculatorHistory[];
    settings: AppSettings;
    addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    addLink: (link: Omit<Link, "id" | "createdAt" | "updatedAt">) => void;
    updateLink: (id: string, updates: Partial<Link>) => void;
    deleteLink: (id: string) => void;
    addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    addReminder: (reminder: Omit<Reminder, "id" | "createdAt">) => void;
    updateReminder: (id: string, updates: Partial<Reminder>) => void;
    deleteReminder: (id: string) => void;
    addCalculatorHistory: (history: Omit<CalculatorHistory, "id" | "timestamp">) => void;
    clearCalculatorHistory: () => void;
    updateSettings: (updates: Partial<AppSettings>) => void;
    exportData: () => void;
    importData: (data: string) => void;
    searchItems: (query: string) => { tasks: Task[]; notes: Note[]; links: Link[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
    darkMode: false,
    defaultTaskPriority: "medium",
    defaultCategories: ["Work", "Personal", "Important", "Links"]
};

const defaultCategories: Category[] = [
    { id: "1", name: "Work", color: "#3b82f6", createdAt: new Date().toISOString() },
    { id: "2", name: "Personal", color: "#10b981", createdAt: new Date().toISOString() },
    { id: "3", name: "Important", color: "#ef4444", createdAt: new Date().toISOString() },
    { id: "4", name: "Links", color: "#8b5cf6", createdAt: new Date().toISOString() }
];

export default function AppProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [calculatorHistory, setCalculatorHistory] = useState<CalculatorHistory[]>([]);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    useEffect(() => {
        const savedTasks = localStorage.getItem("productivity-tasks");
        const savedNotes = localStorage.getItem("productivity-notes");
        const savedLinks = localStorage.getItem("productivity-links");
        const savedCategories = localStorage.getItem("productivity-categories");
        const savedReminders = localStorage.getItem("productivity-reminders");
        const savedHistory = localStorage.getItem("productivity-calculator-history");
        const savedSettings = localStorage.getItem("productivity-settings");

        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (savedLinks) setLinks(JSON.parse(savedLinks));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        if (savedReminders) setReminders(JSON.parse(savedReminders));
        if (savedHistory) setCalculatorHistory(JSON.parse(savedHistory));
        if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }, []);

    useEffect(() => {
        localStorage.setItem("productivity-tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem("productivity-notes", JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem("productivity-links", JSON.stringify(links));
    }, [links]);

    useEffect(() => {
        localStorage.setItem("productivity-categories", JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem("productivity-reminders", JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        localStorage.setItem("productivity-calculator-history", JSON.stringify(calculatorHistory));
    }, [calculatorHistory]);

    useEffect(() => {
        localStorage.setItem("productivity-settings", JSON.stringify(settings));
    }, [settings]);

    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
        const newTask: Task = {
            ...task,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
        const newNote: Note = {
            ...note,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
    };

    const updateNote = (id: string, updates: Partial<Note>) => {
        setNotes(prev => prev.map(note =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
        ));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(note => note.id !== id));
    };

    const addLink = (link: Omit<Link, "id" | "createdAt" | "updatedAt">) => {
        const newLink: Link = {
            ...link,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setLinks(prev => [...prev, newLink]);
    };

    const updateLink = (id: string, updates: Partial<Link>) => {
        setLinks(prev => prev.map(link =>
            link.id === id ? { ...link, ...updates, updatedAt: new Date().toISOString() } : link
        ));
    };

    const deleteLink = (id: string) => {
        setLinks(prev => prev.filter(link => link.id !== id));
    };

    const addCategory = (category: Omit<Category, "id" | "createdAt">) => {
        const newCategory: Category = {
            ...category,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = (id: string, updates: Partial<Category>) => {
        setCategories(prev => prev.map(category =>
            category.id === id ? { ...category, ...updates } : category
        ));
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(category => category.id !== id));
    };

    const addReminder = (reminder: Omit<Reminder, "id" | "createdAt">) => {
        const newReminder: Reminder = {
            ...reminder,
            id: generateId(),
            createdAt: new Date().toISOString()
        };
        setReminders(prev => [...prev, newReminder]);
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
        setReminders(prev => prev.map(reminder =>
            reminder.id === id ? { ...reminder, ...updates } : reminder
        ));
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
    };

    const addCalculatorHistory = (history: Omit<CalculatorHistory, "id" | "timestamp">) => {
        const newHistory: CalculatorHistory = {
            ...history,
            id: generateId(),
            timestamp: new Date().toISOString()
        };
        setCalculatorHistory(prev => [...prev, newHistory]);
    };

    const clearCalculatorHistory = () => {
        setCalculatorHistory([]);
    };

    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const exportData = () => {
        const data = {
            tasks,
            notes,
            links,
            categories,
            reminders,
            settings,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `productivity-data-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (dataString: string) => {
        try {
            const data = JSON.parse(dataString);
            if (data.tasks) setTasks(data.tasks);
            if (data.notes) setNotes(data.notes);
            if (data.links) setLinks(data.links);
            if (data.categories) setCategories(data.categories);
            if (data.reminders) setReminders(data.reminders);
            if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
        } catch (error) {
            console.error("Failed to import data:", error);
        }
    };

    const searchItems = (query: string) => {
        const lowercaseQuery = query.toLowerCase();

        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description?.toLowerCase().includes(lowercaseQuery) ||
            task.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
        );

        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(lowercaseQuery) ||
            note.content.toLowerCase().includes(lowercaseQuery) ||
            note.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
        );

        const filteredLinks = links.filter(link =>
            link.title.toLowerCase().includes(lowercaseQuery) ||
            link.description?.toLowerCase().includes(lowercaseQuery) ||
            link.url.toLowerCase().includes(lowercaseQuery) ||
            link.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
        );

        return { tasks: filteredTasks, notes: filteredNotes, links: filteredLinks };
    };

    return (
        <AppContext.Provider value={{
            tasks,
            notes,
            links,
            categories,
            reminders,
            calculatorHistory,
            settings,
            addTask,
            updateTask,
            deleteTask,
            addNote,
            updateNote,
            deleteNote,
            addLink,
            updateLink,
            deleteLink,
            addCategory,
            updateCategory,
            deleteCategory,
            addReminder,
            updateReminder,
            deleteReminder,
            addCalculatorHistory,
            clearCalculatorHistory,
            updateSettings,
            exportData,
            importData,
            searchItems
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
};
