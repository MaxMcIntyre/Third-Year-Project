import { Modal } from 'react-bootstrap';

const QuestionsAlreadyGeneratingModal = props => {
    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>Questions are already being generated for this set of notes! Check back in a short while to see them.</Modal.Body>
        </Modal>
    );
}

export default QuestionsAlreadyGeneratingModal;