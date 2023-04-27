import CourseCard from './CourseCard';
import NewCourse from './NewCourse';
import { fetchCourses } from '../redux/actions/coursesActions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const selectCourses = state => state.courses.courses;

const Courses = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    const courses = useSelector(selectCourses);
    
    return (
        <div>
            <h2 style={{ textAlign: "center" }}>My Courses</h2>
            {courses.map(course => (
                <CourseCard key={course.id} id={course.id} name={course.course_name} state={courses} />
            ))}
            <br />
            <NewCourse />
        </div>
    );
}

export default Courses;