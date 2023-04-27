import { Card, Col, Row, Button } from 'react-bootstrap';
import { fetchQuestions, startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { deleteTopic } from '../redux/actions/topicsActions';
import handleQuestGen from '../handleQuestGen';
import ConfirmDeletionModal from './ConfirmDeletionModal';
import EditTopicModal from './EditTopicModal';
import QuestionsAlreadyGeneratingModal from './QuestionsAlreadyGeneratingModal';
import QuestionsOverwriteModal from './QuestionsOverwriteModal';

const selectQuestionsGenerating = state => state.questions.questions_generating;

const NoteCard = props => {
    const dispatch = useDispatch();
    const history = useHistory();

    const questionsGenerating = useSelector(selectQuestionsGenerating);
    
    const [showDeletionModal, setShowDeletionModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showQuestAlreadyGenModal, setShowQuestAlreadyGenModal] = useState(false);
    const [showQuestionsOverwriteModal, setShowQuestionsOverwriteModal] = useState(false);

    const handleDelete = () => setShowDeletionModal(true);
    const handleUpdate = () => setShowUpdateModal(true);

    const handleCloseDeletionModal = () => setShowDeletionModal(false);
    const handleCloseUpdateModal = () => setShowUpdateModal(false);
    const handleCloseQuestAlreadyGenModal = () => setShowQuestAlreadyGenModal(false);
    const handleCloseQuestionsOverwriteModal = () => setShowQuestionsOverwriteModal(false);

    const handleTestYourselfClick = e => {
        e.preventDefault();
        history.push(`/questions/${props.id}`, { state: props.state });
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        handleQuestGen(props.id, questionsGenerating, dispatch, setShowQuestAlreadyGenModal, setShowQuestionsOverwriteModal, startQuestionGeneration, finishQuestionGeneration);
    }

    const handleLinkClick = e => {
        e.preventDefault();
        history.push(contentLink, { state: props.state });
    }

    const contentLink = `/content/${props.id}`;
    return (
        <div>
            <Card className="mx-auto" style={{ maxWidth: "80%" }}>
                <Card.Body>
                    <Row>
                        <Col>
                            <a href={contentLink} onClick={handleLinkClick} style={{ fontSize: "125%" }}>{props.name}</a>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button onClick={handleQuestGenClick} style={{ minWidth: "20%" }} className="me-3" variant="primary">Generate Questions</Button>
                            <Button onClick={handleTestYourselfClick} style={{ minWidth: "20%" }} className="me-3" variant="primary">Test Yourself</Button>
                            <Button onClick={handleUpdate} style={{ minWidth: "20%" }} className="me-3" variant="secondary" type="submit">Edit Topic</Button>
                            <Button onClick={handleDelete} style={{ minWidth: "20%" }} variant="danger" type="submit">Delete Topic</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <ConfirmDeletionModal 
                showModal={showDeletionModal} 
                handleCloseModal={handleCloseDeletionModal}
                id={props.id}
                deleteMethod={deleteTopic}
                text={'Are you sure you want to delete this topic? This cannot be undone, and all of its associated questions will be deleted!'}
            />
            <EditTopicModal 
                showModal={showUpdateModal} 
                handleCloseModal={handleCloseUpdateModal}
                id={props.id}
                name={props.name}
                notes={props.notes}
            />
            <QuestionsAlreadyGeneratingModal
                showModal={showQuestAlreadyGenModal} 
                handleCloseModal={handleCloseQuestAlreadyGenModal}
            />
            <QuestionsOverwriteModal
                showModal={showQuestionsOverwriteModal} 
                handleCloseModal={handleCloseQuestionsOverwriteModal}
                id={props.id}
            />
        </div>
    );
}

export default NoteCard;