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
                            {props.text}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button className="mt-2" onClick={() => history.goBack()} variant="secondary">Go Back</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NoQuestionsCard;