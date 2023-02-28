import NoteCard from './NoteCard';
import NewNotes from './NewNotes';
import { fetchTopics } from '../redux/actions/topicsActions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const selectTopics = state => state.topics.topics;

const Notes = props => {
    const dispatch = useDispatch();

    const [courseName, setCourseName] = useState('');
    const { match } = props;
    const courseID = match.params.courseID;

    // Fetch course data to get course name from ID
    useEffect(() => {
        const fetchCourseData = async () => {
            const response = await fetch(`http://localhost:8000/api/courses/${courseID}`);
            const responseData = await response.json();
            setCourseName(responseData.course.course_name);
        }
        fetchCourseData();
    }, [])

    useEffect(() => {
        dispatch(fetchTopics(courseID));
    }, [dispatch, courseID]);

    const topics = useSelector(selectTopics);

    return (
        <div>
            <h2 style={{ textAlign: "center" }}>Notes for {courseName}</h2>
            {topics.map(topic => (
                <NoteCard key={topic.id} id={topic.id} name={topic.topic_name} />
            ))}
            <br />
            <NewNotes courseID={courseID} />
        </div>
    );
}

export default Notes;