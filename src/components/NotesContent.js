import { Card, Col, Row, Container, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import handleQuestGen from '../handleQuestGen';
import QuestionsAlreadyGeneratingModal from './QuestionsAlreadyGeneratingModal';
import QuestionsOverwriteModal from './QuestionsOverwriteModal';

const selectQuestionsGenerating = state => state.questions.questions_generating;

const NotesContent = props => {
    const { match } = props;
    const topicID = match.params.topicID;
    const [notesData, setNotesData] = useState({});
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
            const responseData = await response.json();
            setNotesData(responseData.topic);
        }
        fetchNotesData();
    }, [topicID]);

    const handleTestYourselfClick = e => {
        e.preventDefault();
        dispatch(fetchQuestions(topicID));
        history.push(`/questions/${topicID}`);
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        handleQuestGen(topicID, questionsGenerating, dispatch, setShowQuestAlreadyGenModal, setShowQuestionsOverwriteModal, startQuestionGeneration, finishQuestionGeneration);
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

export default NotesContent;