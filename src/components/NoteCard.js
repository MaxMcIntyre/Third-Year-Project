import { Card, Col, Row, Button } from 'react-bootstrap';
import { fetchQuestions, startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { deleteTopic } from '../redux/actions/topicsActions';
import generateQuestions from '../generateQuestions';
import ConfirmDeletionModal from './ConfirmDeletionModal';
import EditTopicModal from './EditTopicModal';

const NoteCard = props => {
    const dispatch = useDispatch();
    const history = useHistory();
    
    const [showDeletionModal, setShowDeletionModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const handleDelete = () => setShowDeletionModal(true);
    const handleUpdate = () => setShowUpdateModal(true);
    const handleCloseDeletionModal = () => setShowDeletionModal(false);
    const handleCloseUpdateModal = () => setShowUpdateModal(false);

    const handleTestYourselfClick = e => {
        e.preventDefault();
        dispatch(fetchQuestions(props.id));
        history.push(`/questions/${props.id}`, { state: props.state });
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        dispatch(startQuestionGeneration(props.id));
        generateQuestions(props.id).then(() => dispatch(finishQuestionGeneration(props.id)));
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
                            <Button onClick={handleQuestGenClick} className="me-3" variant="primary">Generate Questions</Button>
                            <Button onClick={handleTestYourselfClick} className="me-3" variant="primary">Test Yourself</Button>
                            <Button style={{ minWidth: "30%" }} onClick={handleUpdate} className="me-3" variant="secondary" type="submit">Edit Topic</Button>
                            <Button style={{ minWidth: "30%" }} onClick={handleDelete} variant="danger" type="submit">Delete Topic</Button>
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
        </div>
    );
}

export default NoteCard;