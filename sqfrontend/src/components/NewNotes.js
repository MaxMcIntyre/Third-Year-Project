import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import { useRef, useState } from 'react';
import { addTopic } from '../redux/actions/topicsActions';
import { useDispatch } from 'react-redux';

const NewNotes = props => {
    const nameInputRef = useRef(null);
    const [notesText, setNotesText] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = e => {
        e.preventDefault();
        const name = nameInputRef.current.value;
        const notes = notesText;
        dispatch(addTopic(name, notes, props.courseID));
    }

    const handleChange = e => {
        setNotesText(e.target.value);
    }

    return (
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Text>Add new topic:</Card.Text>
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-3">
                        <Form.Label>Topic Name:</Form.Label>
                        <Form.Control ref={nameInputRef} type="text" placeholder="Enter topic name" />
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-3">
                        <Form.Label>Notes Text:</Form.Label>
                        <Form.Control onChange={handleChange} as="textarea" placeholder="Enter notes" rows={10} />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex mt-3 justify-content-start">
                        <Button onClick={handleSubmit} style={{ minWidth: "15%" }} variant="secondary" id="add-topic-submit" type="submit">Submit</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default NewNotes;