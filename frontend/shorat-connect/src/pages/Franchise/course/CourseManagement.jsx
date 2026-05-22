import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;
const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/courses/`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCourses(data.results || data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      }
    };
    fetchCourses();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Course Management</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {course.name}
              </h3>
              <p className="text-gray-600">Duration: {course.duration} Month</p>
            </div>
          ))
        ) : (
          <div className="col-span-full p-6 text-center text-gray-400">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
