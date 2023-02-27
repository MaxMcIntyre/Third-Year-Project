import './App.css';
import CourseCard from './components/CourseCard';
import NewCourse from './components/NewCourse';
import { useState, useEffect } from 'react'

function App() {
    const [courseData, setCourseData] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            const timestamp = new Date().getTime();
            const response = await fetch('http://localhost:8000/api/courses/?timestamp=${timestamp}', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            const responseData = await response.json();
            setCourseData(responseData.courses);
            console.log(courseData);
        }
        fetchCourses();
    }, []);

    return (
        <div>
            <h2 style={{ textAlign: "center" }}>My Courses</h2>
            {courseData.map(course => (
                <CourseCard key={course.id} name={course.name} />
            ))}
            <br />
            <NewCourse />
        </div>
    );
}

export default App;
