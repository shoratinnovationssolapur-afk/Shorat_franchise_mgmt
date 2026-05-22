import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeedbackSystem() {
  const [feedbacks, setFeedbacks] = useState([]);

  // Fetch feedbacks (mock data for now)
  useEffect(() => {
    // Replace this with API call like: fetch("/api/feedback")
    const mockData = [
      { id: 1, name: "Amit Sharma", message: "Great classes, very helpful!", date: "2025-08-10" },
      { id: 2, name: "Priya Desai", message: "Please add more practical sessions.", date: "2025-08-11" },
      { id: 3, name: "Rohit Patil", message: "Loved the interactive sessions.", date: "2025-08-12" },
    ];
    setFeedbacks(mockData);
  }, []);

  return (
    <div className="p-6">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold mb-2">Student Feedback</h1>
      <p className="text-gray-500 mb-6">All feedback shared by students is listed below.</p>

      {/* Feedback List */}
      <div className="grid gap-4 md:grid-cols-2">
        {feedbacks.map((fb) => (
          <Card key={fb.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{fb.name}</span>
                <Badge>{fb.date}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{fb.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
