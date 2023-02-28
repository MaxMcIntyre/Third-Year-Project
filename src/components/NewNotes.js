import { Card, Col, Row, Button, Form, FormControl } from 'react-bootstrap';
import { useRef, useState } from 'react';
import { addTopic } from '../redux/actions/topicsActions';
import { useDispatch } from 'react-redux';
import { StepContext } from '@mui/material';

const NewNotes = props => {
    const nameInputRef = useRef(null);
    const notesInputRef = useRef(null);
    const [text, setText] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = e => {
        e.preventDefault();
        const name = nameInputRef.current.value;
        const notes = text;
        console.log(notes);
        dispatch(addTopic(name, notes, props.courseID));
    }

    const handleChange = e => {
        setText(e.target.value);
    }

    return (
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Text>Add new notes:</Card.Text>
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-3">
                        <Card.Text>Topic name:</Card.Text>
                        <Form.Control ref={nameInputRef} type="text" placeholder="Enter topic name" />
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-3">
                        <Card.Text>Notes Text:</Card.Text>
                        <Form.Control onChange={handleChange} ref={notesInputRef} as="textarea" placeholder="Enter notes" rows={10} />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex mt-3 justify-content-start">
                        <Button onClick={handleSubmit} style={{ minWidth: "15%" }} variant="primary" type="submit">Submit</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default NewNotes;