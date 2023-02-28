import { Card, Col, Row, Button } from 'react-bootstrap';

const CourseCard = props => {
    const notesLink = `/notes/${props.id}`
    return (
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <a style={{ fontSize: "125%" }} href={notesLink}>{props.name}</a>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button style={{ minWidth: "30%" }} variant="danger" type="submit">Delete Course</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default CourseCard;