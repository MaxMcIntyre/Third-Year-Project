import { Card, Col, Row, Button } from 'react-bootstrap';

const NoteCard = props => {
    return (
        <div>
            <Card className="mx-auto" style={{ maxWidth: "80%" }}>
                <Card.Body>
                    <Row>
                        <Col>
                            <a href="something" style={{ fontSize: "125%" }}>{props.name}</a>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="me-3" variant="primary">Generate Questions</Button>
                            <Button className="me-3" variant="primary">Test Yourself</Button>
                            <Button style={{ minWidth: "30%" }} variant="danger" type="submit">Delete Notes</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NoteCard;