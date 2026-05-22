import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// List of students
const students = [
  {
    id: "STU101",
    name: "Rahul Sharma",
    batch: "Batch A - Python",
    attendance: 82,
    reports: [
      { subject: "Python Basics", marks: 85, status: "Pass" },
      { subject: "OOP Concepts", marks: 78, status: "Pass" },
      { subject: "Django Intro", marks: 65, status: "Pass" },
      { subject: "Final Project", marks: 55, status: "Needs Improvement" },
    ],
    attendanceTrend: [
      { month: "Jan", attendance: 80 },
      { month: "Feb", attendance: 85 },
      { month: "Mar", attendance: 70 },
      { month: "Apr", attendance: 90 },
      { month: "May", attendance: 82 },
    ],
  },
  {
    id: "STU102",
    name: "Priya Verma",
    batch: "Batch B - JavaScript",
    attendance: 90,
    reports: [
      { subject: "JS Basics", marks: 88, status: "Pass" },
      { subject: "ES6 Concepts", marks: 92, status: "Pass" },
      { subject: "React Intro", marks: 85, status: "Pass" },
      { subject: "Final Project", marks: 75, status: "Pass" },
    ],
    attendanceTrend: [
      { month: "Jan", attendance: 95 },
      { month: "Feb", attendance: 92 },
      { month: "Mar", attendance: 89 },
      { month: "Apr", attendance: 90 },
      { month: "May", attendance: 90 },
    ],
  },
];

export default function StudentProgressList() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="p-6 space-y-6">
      {/* Main Page Heading */}
      <h1 className="text-3xl font-bold mb-4">Student Progress and Report</h1>

      {!selectedStudent ? (
        // Show student list
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Batch</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="p-2">{student.id}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2">{student.batch}</td>
                    <td className="p-2 text-center">
                      <Button onClick={() => setSelectedStudent(student)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        // Show selected student's progress & reports
        <div>
          <Button onClick={() => setSelectedStudent(null)} className="mb-4">
            ← Back to List
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>ID:</strong> {selectedStudent.id}</p>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Batch:</strong> {selectedStudent.batch}</p>
              <p><strong>Attendance:</strong></p>
              <Progress value={selectedStudent.attendance} className="w-64" />
              <span>{selectedStudent.attendance}%</span>
            </CardContent>
          </Card>

          <Tabs defaultValue="progress" className="mt-6">
            <TabsList>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="report">Reports</TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedStudent.attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Subject</th>
                        <th className="p-2">Marks</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.reports.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{r.subject}</td>
                          <td className="p-2 text-center">{r.marks}</td>
                          <td className={`p-2 text-center ${r.status === "Pass" ? "text-green-600" : "text-red-600"}`}>
                            {r.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4">
                    <Button>Download Report Card</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
