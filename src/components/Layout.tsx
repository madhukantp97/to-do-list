// src/components/Layout.tsx
"use client";

import { useState, useEffect } from "react"; // Added useEffect for potential client-side checks
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    CheckSquare, FileText, Link as LinkIcon, Calendar, Calculator, Settings, Search, Menu, Moon, Sun, Home
} from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
}

interface SearchResult {
    tasks: Array<{ id: string; title: string; description?: string; }>;
    notes: Array<{ id: string; title: string; content: string; }>;
    links: Array<{ id: string; title: string; url: string; }>;
}

export default function Layout({ children }: LayoutProps) {
    const { settings, updateSettings, searchItems } = useApp();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
        { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
        { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
        { id: "links", label: "Links", icon: LinkIcon, href: "/links" },
        { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
        { id: "calculator", label: "Calculator", icon: Calculator, href: "/calculator" },
        { id: "settings", label: "Settings", icon: Settings, href: "/settings" }
    ];

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = searchItems(query);
            setSearchResults(results);
        } else {
            setSearchResults(null);
        }
    };

    const toggleDarkMode = () => {
        updateSettings({ darkMode: !settings.darkMode });
    };

    // Close search results if user clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const searchContainer = document.getElementById('search-container'); // Add an ID to your search container div
            if (searchContainer && !searchContainer.contains(event.target as Node)) {
                setSearchResults(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const NavigationContent = () => (
        <div className="flex flex-col h-full bg-background"> {/* Ensure background for sidebar */}
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold">Mk To-Do Hub</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1"> {/* Reduced space-y for tighter links */}
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = (item.href === "/" && pathname === "/") ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link href={item.href} key={item.id} passHref legacyBehavior>
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                className="w-full justify-start text-sm font-normal" // Adjusted styling
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Icon className="mr-3 h-4 w-4" /> {/* Slightly more margin */}
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className={`min-h-screen ${settings.darkMode ? "dark" : ""}`}>
            <div className="flex h-screen bg-background text-foreground">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex md:w-60 lg:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r z-30"> {/* Fixed position */}
                    <NavigationContent />
                </aside>

                {/* Main Content Area */}
                <div className="md:pl-60 lg:pl-64 flex-1 flex flex-col overflow-hidden"> {/* Padding to offset fixed sidebar */}
                    {/* Header */}
                    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"> {/* Sticky header */}
                        <div className="flex h-14 items-center px-4 gap-4">
                            {/* Mobile Menu Button & Sheet */}
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64 z-40"> {/* Ensure mobile menu is above content */}
                                    <NavigationContent />
                                </SheetContent>
                            </Sheet>

                            {/* Search Bar */}
                            <div id="search-container" className="flex-1 max-w-md relative"> {/* Added ID for click outside */}
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search tasks, notes, links..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8 w-full"
                                />
                                {/* Search Results Dropdown */}
                                {searchResults && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto text-card-foreground">
                                        <div className="p-2">
                                            {searchResults.tasks.length > 0 && (
                                                <div className="mb-2">
                                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 px-2">Tasks</h4>
                                                    {searchResults.tasks.slice(0, 3).map((task) => (
                                                        <div key={task.id} className="p-2 hover:bg-accent rounded cursor-pointer" onClick={() => { /* TODO: Navigate to task */ setSearchResults(null); setSearchQuery(''); }}>
                                                            <div className="font-medium">{task.title}</div>
                                                            {task.description && <div className="text-xs text-muted-foreground truncate">{task.description}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.notes.length > 0 && (
                                                <div className="mb-2">
                                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 px-2">Notes</h4>
                                                    {searchResults.notes.slice(0, 3).map((note) => (
                                                        <div key={note.id} className="p-2 hover:bg-accent rounded cursor-pointer" onClick={() => { /* TODO: Navigate to note */ setSearchResults(null); setSearchQuery(''); }}>
                                                            <div className="font-medium">{note.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{note.content.substring(0, 50)}...</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.links.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1 px-2">Links</h4>
                                                    {searchResults.links.slice(0, 3).map((link) => (
                                                        <div key={link.id} className="p-2 hover:bg-accent rounded cursor-pointer" onClick={() => { /* TODO: Navigate to link */ setSearchResults(null); setSearchQuery(''); }}>
                                                            <div className="font-medium">{link.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.tasks.length === 0 && searchResults.notes.length === 0 && searchResults.links.length === 0 && (
                                                <div className="p-2 text-sm text-center text-muted-foreground">No results found for "{searchQuery}"</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dark Mode Toggle Button */}
                            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
                                {settings.darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </div>
                    </header>

                    {/* Main Page Content (passed as children) */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
