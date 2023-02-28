import { Card, Row, Col, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const QuestionsCompletedCard = props => {
    const history = useHistory();
    
    // Save attempt (no. questions correct out of total) to database
    const recordAttempt = async () => {
        const currTime = new Date().toISOString();
        const response = await fetch('http://localhost:8000/api/questionsetattempts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'questionSetID': props.questionSetID,
                'totalQuestions': props.total,
                'correctAnswers': props.noCorrect,
                'attemptDate': currTime
            })
        });

        const responseData = await response.json();
    }

    const handleClick = e => {
        e.preventDefault();
        recordAttempt(props.questionSetID);
        history.goBack();
    }

    console.log(props);

    return (
        <div>
            <Card className="mx-auto" style={{ maxWidth: "40%" }}>
                <Card.Body className="text-center">
                    <Row>
                        <Col>
                            You've completed this set of questions.
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            You got {props.noCorrect} questions correct out of {props.total}.
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button onClick={handleClick} variant="primary">Finish Attempt</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default QuestionsCompletedCard;