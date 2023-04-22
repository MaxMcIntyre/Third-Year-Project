import NoteCard from './NoteCard';
import NewNotes from './NewNotes';
import { fetchTopics } from '../redux/actions/topicsActions';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Error from './ErrorPage';

const selectTopics = state => state.topics.topics;

const Notes = props => {
    const dispatch = useDispatch();

    const [courseName, setCourseName] = useState('');
    const [errorStatus, setErrorStatus] = useState(0);
    const { match } = props;
    const courseID = match.params.courseID;

    // Fetch course data to get course name from ID
    useEffect(() => {
        const fetchCourseData = async () => {
            const response = await fetch(`http://localhost:8000/api/courses/${courseID}`);
            if (response.ok) {
                const responseData = await response.json();
                setCourseName(responseData.course.course_name);
            } else {
                setErrorStatus(response.status);
            }
        }
        fetchCourseData();
    }, [courseID]);

    useEffect(() => {
        dispatch(fetchTopics(courseID));
    }, [dispatch, courseID]);

    const topics = useSelector(selectTopics);

    if (errorStatus !== 0) {
        return (
            <div>
                <Error statusText={errorStatus} message={errorStatus === 404 ? 'Course not found.' : 'Unexpected error. Please try again.'} />
            </div>
        );
    } else {
        return (
            <div>
                <h2 style={{ textAlign: "center" }}>Topics for {courseName}</h2>
                {topics.map(topic => (
                    <NoteCard key={topic.id} id={topic.id} name={topic.topic_name} notes={topic.notes} state={topics} />
                ))}
                <br />
                <NewNotes courseID={courseID} />
            </div>
        );
    }
}

export default Notes;