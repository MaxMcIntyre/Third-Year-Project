import { Modal, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { startQuestionGeneration, finishQuestionGeneration } from '../redux/actions/questionsActions';
import { wipeQuestionSetAttempts } from '../redux/actions/questionSetAttemptsActions';
import generateQuestions from '../generateQuestions';

const QuestionsOverwriteModal = props => {
    const dispatch = useDispatch();

    const handleContinue = e => {
        e.preventDefault();
        dispatch(startQuestionGeneration(props.id));
        dispatch(wipeQuestionSetAttempts());
        generateQuestions(props.id).then(() => dispatch(finishQuestionGeneration(props.id)));
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Questions Overwrite</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>Warning! There is already a question set associated with this topic. Generating a new one will overwrite the existing questions and delete any attempts at the set.</Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleContinue}>
                    Continue
                </Button>
                <Button variant="secondary" onClick={props.handleCloseModal}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QuestionsOverwriteModal;