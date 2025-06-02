import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, FileText, Calendar, Clock } from "lucide-react";

export default function Dashboard() {
    const { tasks, notes, reminders } = useApp();

    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const highPriorityTasks = tasks.filter(task => task.priority === "high" && !task.completed).length;
    const todayReminders = reminders.filter(reminder => {
        const today = new Date().toISOString().split("T")[0];
        return reminder.date === today && !reminder.completed;
    }).length;

    const recentTasks = tasks.slice(-5).reverse();
    const recentNotes = notes.slice(-3).reverse();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your productivity hub</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {completedTasks} completed, {pendingTasks} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highPriorityTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks requiring attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Notes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notes.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Total saved notes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Reminders</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayReminders}</div>
                        <p className="text-xs text-muted-foreground">
                            Scheduled for today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CheckSquare className={`h-4 w-4 ${task.completed ? "text-green-500" : "text-muted-foreground"}`} />
                                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                                        </div>
                                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                                            {task.priority}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No tasks yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentNotes.length > 0 ? (
                                recentNotes.map((note) => (
                                    <div key={note.id} className="space-y-1">
                                        <div className="font-medium">{note.title}</div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {note.content.substring(0, 100)}...
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No notes yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
