import { Modal, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useRef } from 'react';
import { updateCourse } from '../redux/actions/coursesActions';

// Modal shown when editing a course
const EditCourseModal = props => {
    const nameInputRef = useRef(null);
    const dispatch = useDispatch();

    const handleUpdate = e => {
        e.preventDefault();
        dispatch(updateCourse(props.id, nameInputRef.current.value));
        props.handleCloseModal();
    }

    return (
        <Modal show={props.showModal} onHide={props.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Course</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Label>Course Name:</Form.Label>
                    <Form.Control id="edit-course-name" type="text" ref={nameInputRef} placeholder="Enter course name" defaultValue={props.name} />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button id="edit-course-submit" variant="secondary" onClick={handleUpdate}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditCourseModal;