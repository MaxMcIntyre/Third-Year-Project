import { Modal, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

// Generic deletion confirmation model for deleting courses and topics
const ConfirmDeletionModal = props => {
    const dispatch = useDispatch();

    const handleDelete = e => {
        e.preventDefault();
        dispatch(props.deleteMethod(props.id));
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>{props.text}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleCloseModal}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDeletionModal;