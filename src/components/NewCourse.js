import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import { useRef } from 'react';

const NewCourse = props => {
    const nameInputRef = useRef(null);

    const addCourse = async () => {
        const response = await fetch('http://localhost:8000/api/courses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': nameInputRef.current.value
            })
        });

        const responseData = await response.json();
    }

    return (
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <Card.Text>Add new course:</Card.Text>
                        <Form.Control ref={nameInputRef} type="text" placeholder="Enter text" />
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button onClick={addCourse} style={{ minWidth: "30%" }} variant="primary" type="submit">Submit</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default NewCourse;