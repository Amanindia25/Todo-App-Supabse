"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Register chart parts
ChartJS.register(ArcElement, Tooltip, Legend);

const supabase = createClient();

export default function StatsPage() {
  const [completedCount, setCompletedCount] = useState(0);
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to view your stats.");
        return;
      }

      const { data, error } = await supabase
        .from("todos")
        .select("is_complete")
        .eq("user_id", user.id);

      if (error) {
        toast.error("Error loading stats!");
        setLoading(false);
        return;
      }

      const completed = data.filter((todo) => todo.is_complete).length;
      const incomplete = data.length - completed;

      setCompletedCount(completed);
      setIncompleteCount(incomplete);
      setLoading(false);
    }

    fetchStats();
  }, []);

  const chartData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        label: "ToDos",
        data: [completedCount, incompleteCount],
        backgroundColor: ["#22c55e", "#ef4444"], // green & red
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-white dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-slate-800">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold mb-4 text-center">ToDo Stats</h2>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading chart...</p>
          ) : (
            <Pie data={chartData} />
          )}

          <div className="mt-6 flex justify-around text-sm text-gray-700 dark:text-gray-300">
            <p>✅ Completed: {completedCount}</p>
            <p>⌛ Remaining: {incompleteCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
