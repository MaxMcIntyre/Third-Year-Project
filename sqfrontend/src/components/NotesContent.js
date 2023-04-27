import { Card, Col, Row, Container, Button, Table } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import { fetchQuestionSetAttempts } from '../redux/actions/questionSetAttemptsActions';
import handleQuestGen from '../handleQuestGen';
import QuestionsAlreadyGeneratingModal from './QuestionsAlreadyGeneratingModal';
import QuestionsOverwriteModal from './QuestionsOverwriteModal';
import Error from './ErrorPage';

const selectQuestionsGenerating = state => state.questions.questions_generating;
const selectQuestionSetAttempts = state => state.questionsetattempts.attempts;

const NotesContent = props => {
    const { match } = props;
    const topicID = match.params.topicID;
    const [notesData, setNotesData] = useState({});
    const [errorStatus, setErrorStatus] = useState(0);
    const [showQuestAlreadyGenModal, setShowQuestAlreadyGenModal] = useState(false);
    const [showQuestionsOverwriteModal, setShowQuestionsOverwriteModal] = useState(false);

    const questionsGenerating = useSelector(selectQuestionsGenerating);

    const dispatch = useDispatch();
    const history = useHistory();

    const handleCloseQuestAlreadyGenModal = () => setShowQuestAlreadyGenModal(false);
    const handleCloseQuestionsOverwriteModal = () => setShowQuestionsOverwriteModal(false);

    // Fetch topic and course name from topic ID
    useEffect(() => {
        const fetchNotesData = async () => {
            const response = await fetch(`http://localhost:8000/api/notescontent/${topicID}`);
            if (response.ok) {
                const responseData = await response.json();
                setNotesData(responseData.topic);
            } else {
                setErrorStatus(response.status);
            }
        }
        fetchNotesData();
    }, [topicID]);

    // Fetch question set attempts for question set currently associated with topic ID
    useEffect(() => {
        dispatch(fetchQuestionSetAttempts(topicID));
    }, [dispatch, topicID]);

    const questionSetAttempts = useSelector(selectQuestionSetAttempts);

    const handleTestYourselfClick = e => {
        e.preventDefault();
        history.push(`/questions/${topicID}`);
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        handleQuestGen(topicID, questionsGenerating, dispatch, setShowQuestAlreadyGenModal, setShowQuestionsOverwriteModal, startQuestionGeneration, finishQuestionGeneration);
    }

    if (errorStatus !== 0) {
        return (
            <div>
                <Error statusText={errorStatus} message={errorStatus === 404 ? 'Topic not found.' : 'Unexpected error. Please try again.'} />
            </div>
        );
    } else {
        return (
            <Container>
                <div style={{ textAlign: "center" }}>
                    <h2>{notesData.course_name}</h2>
                    <h4>{notesData.topic_name}</h4>
                </div>
                <Card className="w-80 mx-auto mt-3">
                    <Card.Body style={{ whiteSpace: "pre-wrap" }}>
                        {notesData.notes}
                    </Card.Body>
                </Card>
                <Row className="d-flex mt-3 justify-content-between">
                    <Col>
                        <Button onClick={handleQuestGenClick} className="mr-2" variant="primary">Generate Questions</Button>
                        <Button onClick={handleTestYourselfClick} className="mx-4" variant="primary">Test Yourself</Button>
                    </Col>
                </Row>
                <Row>
                    <h4 className="mt-3">Question Set Attempts</h4>
                    <Table striped>
                        <thead>
                            <tr>
                                <th>Total Questions</th>
                                <th>Correct Answers</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionSetAttempts.map((row, index) => {
                                // Display date and time in a readable way
                                const formattedDate = new Date(row.attempt_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                                const formattedTime = new Date(row.attempt_date).toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric' });
                                const dateTime = `${formattedDate} ${formattedTime}`;
                                return (
                                    <tr key={index}>
                                        <td>{row.total_questions}</td>
                                        <td>{row.correct_answers}</td>
                                        <td>{dateTime}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Row>
                <QuestionsAlreadyGeneratingModal
                    showModal={showQuestAlreadyGenModal}
                    handleCloseModal={handleCloseQuestAlreadyGenModal}
                />
                <QuestionsOverwriteModal
                    showModal={showQuestionsOverwriteModal}
                    handleCloseModal={handleCloseQuestionsOverwriteModal}
                    id={topicID}
                />
            </Container>
        );
    }
}

export default NotesContent;