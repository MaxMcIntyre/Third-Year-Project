import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useRef } from 'react';
import { updateTopic } from '../redux/actions/topicsActions';

// Modal shown when editing a topic
const EditTopicModal = props => {
    const nameInputRef = useRef(null);
    const notesInputRef = useRef(null);
    const dispatch = useDispatch();

    const handleUpdate = e => {
        e.preventDefault();
        dispatch(updateTopic(props.id, nameInputRef.current.value, notesInputRef.current.value));
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Topic</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col className="mt-3">
                            <Form.Label>Topic Name:</Form.Label>
                            <Form.Control ref={nameInputRef} type="text" placeholder="Enter topic name" defaultValue={props.name} />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="mt-3">
                            <Form.Label>Notes Text:</Form.Label>
                            <Form.Control ref={notesInputRef} as="textarea" placeholder="Enter notes" defaultValue={props.notes} rows={10} />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleUpdate}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditTopicModal;