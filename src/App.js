import './App.css';
import CourseCard from './components/CourseCard';
import NewCourse from './components/NewCourse';
import { fetchCourses } from './redux/actions/coursesActions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const selectCourses = state => state.courses.courses;

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    const courses = useSelector(selectCourses);
    
    console.log(courses);
    return (
        <div>
            <h2 style={{ textAlign: "center" }}>My Courses</h2>
            {courses.map(course => (
                <CourseCard key={course.id} id={course.id} name={course.course_name} />
            ))}
            <br />
            <NewCourse />
        </div>
    );
}

export default App;
