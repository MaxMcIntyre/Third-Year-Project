import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import { useRef } from 'react';
import { addCourse } from '../redux/actions/coursesActions';
import { useDispatch } from 'react-redux';

const NewCourse = props => {
    const nameInputRef = useRef(null);
    const dispatch = useDispatch();

    const handleSubmit = e => {
        e.preventDefault();
        const name = nameInputRef.current.value;
        dispatch(addCourse(name));
    }

    return (
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <Form.Label>Add new course:</Form.Label>
                        <Form.Control ref={nameInputRef} type="text" placeholder="Enter course name" />
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button onClick={handleSubmit} style={{ minWidth: "20%" }} variant="secondary" id="add-course-submit" type="submit">Submit</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default NewCourse;