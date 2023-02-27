import { Card, Col, Row, Button, Form, FormControl } from 'react-bootstrap';

const NewNotes = props => {
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
                        <Form.Control type="text" placeholder="Enter text" />
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-3">
                        <Card.Text>Notes Text:</Card.Text>
                        <FormControl as="textarea" placeholder="Enter notes" rows={10} />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex mt-3 justify-content-start">
                        <Button style={{ minWidth: "15%" }} variant="primary" type="submit">Submit</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default NewNotes;