"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const page = () => {
  const router = useRouter();
  const supabase = createClient();
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isListeningTitle, setIsListeningTitle] = useState(false);
  const [isListeningDescription, setIsListeningDescription] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        toast.error("Authentication error");
        setLoading(false);
        return;
      }

      if (!userData.user) {
        console.log("No authenticated user found");
        toast.error("Please sign in to manage todos");
        setLoading(false);
        // Redirect to sign-in page using Next.js router
        router.push("/auth/signin");
        return;
      }

      setUser(userData.user);

      // Only fetch todos for the current user
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      console.log("Fetched todos for user:", userData.user.id);

      if (error) {
        console.error("Error fetching todos:", error);
        toast.error("Failed to fetch todos");
      } else {
        setTodos(data);
      }
    } catch (err) {
      console.error("Exception when fetching todos:", err);
      toast.error(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return toast.error("Title is required");

    if (!user) {
      toast.error("You must be signed in to add todos");
      return;
    }

    setIsAdding(true);
    try {
      console.log("Adding todo:", newTodo);

      // Add user_id to the todo
      const todoWithUserId = {
        ...newTodo,
        user_id: user.id,
      };

      console.log("Adding todo with user_id:", todoWithUserId);

      const { data, error } = await supabase
        .from("todos")
        .insert([todoWithUserId])
        .select();

      console.log("Response:", { data, error });

      if (error) {
        console.error("Error adding todo:", error);
        toast.error(`Failed to add todo: ${error.message}`);
      } else {
        toast.success("Todo added!");
        setTodos([data[0], ...todos]);
        setNewTodo({ title: "", description: "" });
      }
    } catch (err) {
      console.error("Exception when adding todo:", err);
      toast.error(`Exception: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      toast.error("You must be signed in to delete todos");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Ensure user can only delete their own todos

      if (error) {
        console.error("Error deleting todo:", error);
        toast.error(`Delete failed: ${error.message}`);
      } else {
        toast.success("Deleted");
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (err) {
      console.error("Exception when deleting todo:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async (todo) => {
    if (!user) {
      toast.error("You must be signed in to update todos");
      return;
    }

    try {
      const updated = { ...todo, is_complete: !todo.is_complete };

      const { error } = await supabase
        .from("todos")
        .update({ is_complete: updated.is_complete })
        .eq("id", todo.id)
        .eq("user_id", user.id); // Ensure user can only update their own todos

      if (error) {
        console.error("Error updating todo status:", error);
        toast.error(`Update failed: ${error.message}`);
      } else {
        setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
        toast.success("Todo status updated!");
      }
    } catch (err) {
      console.error("Exception when updating todo status:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodoId(todo.id);
    setEditData({ title: todo.title, description: todo.description });
  };

  const handleSaveEdit = async (id) => {
    if (!user) {
      toast.error("You must be signed in to update todos");
      return;
    }

    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from("todos")
        .update(editData)
        .eq("id", id)
        .eq("user_id", user.id); // Ensure user can only update their own todos

      if (error) {
        console.error("Error updating todo:", error);
        toast.error(`Update failed: ${error.message}`);
      } else {
        toast.success("Todo updated");
        setTodos(todos.map((t) => (t.id === id ? { ...t, ...editData } : t)));
        setEditingTodoId(null);
      }
    } catch (err) {
      console.error("Exception when updating todo:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const startSpeech = (field) => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (field === "title") setIsListeningTitle(true);
      else if (field === "description") setIsListeningDescription(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewTodo((prev) => ({
        ...prev,
        [field]: prev[field] + (prev[field] ? " " : "") + transcript,
      }));
    };

    recognition.onend = () => {
      if (field === "title") setIsListeningTitle(false);
      else if (field === "description") setIsListeningDescription(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      if (field === "title") setIsListeningTitle(false);
      else if (field === "description") setIsListeningDescription(false);
    };

    recognition.start();
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      toast.error(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };
    synth.speak(utter);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.is_complete;
    if (filter === "remaining") return !todo.is_complete;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.is_complete).length,
    remaining: todos.filter((t) => !t.is_complete).length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">📝 Your Todo Dashboard</h1>

      {/* Add Todo */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Title"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
            />
            <Button variant="ghost" onClick={() => startSpeech("title")}>
              {isListeningTitle ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Description"
              value={newTodo.description}
              onChange={(e) =>
                setNewTodo({ ...newTodo, description: e.target.value })
              }
            />
            <Button variant="ghost" onClick={() => startSpeech("description")}>
              {isListeningDescription ? (
                <Mic size={20} />
              ) : (
                <MicOff size={20} />
              )}
            </Button>
          </div>
          <Button onClick={handleAddTodo} className="w-fit" disabled={isAdding}>
            <Plus size={18} className="mr-2" /> Add Todo
          </Button>
        </CardContent>
      </Card>

      {/* Filter + Stats */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
          <Button
            variant={filter === "remaining" ? "default" : "outline"}
            onClick={() => setFilter("remaining")}
          >
            Remaining
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          📊 Total: {stats.total} | ✅ Completed: {stats.completed} | ⏳
          Remaining: {stats.remaining}
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : filteredTodos.length === 0 ? (
          <p className="text-center text-muted-foreground">No todos to show.</p>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo.id}>
              <CardContent className="p-4 flex justify-between items-start">
                {editingTodoId === todo.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                    <Input
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => handleSaveEdit(todo.id)} size="sm" disabled={isSavingEdit}>
                        <Save size={16} className="mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingTodoId(null)}
                        size="sm"
                      >
                        <X size={16} /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-1">
                    <div className="text-lg font-semibold flex items-center gap-2">
                      {todo.title}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          speak(`${todo.title}. ${todo.description}`)
                        }
                      >
                        {isSpeaking ? (
                          <Volume2 size={18} />
                        ) : (
                          <VolumeX size={18} />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {todo.description}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 items-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleComplete(todo)}
                  >
                    <CheckCircle
                      size={24}
                      className={
                        todo.is_complete ? "text-green-500" : "text-gray-400"
                      }
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(todo)}
                  >
                    <Edit3 size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(todo.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
    </div>
  );
};

export default page;
