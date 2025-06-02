
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: "task" | "note" | "general";
  relatedId?: string;
  completed: boolean;
  createdAt: string;
}

export interface CalculatorHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface AppSettings {
  darkMode: boolean;
  defaultTaskPriority: "low" | "medium" | "high";
  defaultCategories: string[];
}
