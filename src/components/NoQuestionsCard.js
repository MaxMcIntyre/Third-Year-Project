import { Card, Row, Col, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const NoQuestionsCard = props => {
    const history = useHistory();

    return (
        <div>
            <Card className="mx-auto" style={{ maxWidth: "40%" }}>
                <Card.Body className="text-center">
                    <Row>
                        <Col>
                            Uh oh! Looks like there aren't currently any questions for that set of notes.
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={() => history.goBack()} variant="primary">Go Back</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NoQuestionsCard;