import { Card, Col, Row, Container, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchQuestions, startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import generateQuestions from '../generateQuestions';

const NotesContent = props => {
    const { match } = props;
    const topicID = match.params.topicID;
    const [notesData, setNotesData] = useState({});
    const dispatch = useDispatch();
    const history = useHistory();

    // Fetch topic and course name from topic ID
    useEffect(() => {
        const fetchNotesData = async () => {
            const response = await fetch(`http://localhost:8000/api/notescontent/${topicID}`);
            const responseData = await response.json();
            setNotesData(responseData.topic);
        }
        fetchNotesData();
    }, []);

    const handleTestYourselfClick = e => {
        e.preventDefault();
        dispatch(fetchQuestions(topicID));
        history.push(`/questions/${topicID}`);
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        dispatch(startQuestionGeneration(topicID));
        generateQuestions(topicID).then(() => dispatch(finishQuestionGeneration(topicID)));
    }

    return (
        <Container>
            <div style={{ textAlign: "center" }}>
                <h2>{notesData.course_name}</h2>
                <h4>{notesData.topic_name}</h4>
            </div>
            <Card className="w-80 mx-auto mt-3">
                <Card.Body style={{ whiteSpace: "pre-wrap"}}>
                    {notesData.notes}
                </Card.Body>
            </Card>
            <Row className="d-flex mt-3 justify-content-between">
                <Col>
                    <Button onClick={handleQuestGenClick} className="mr-2" variant="primary">Generate Questions</Button>
                    <Button onClick={handleTestYourselfClick} className="mx-4" variant="primary">Test Yourself</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default NotesContent;