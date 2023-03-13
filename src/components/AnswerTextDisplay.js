import { Row, Col, Button } from 'react-bootstrap';

const AnswerTextDisplay = props => {
    if (props.questionType === "SA") {
        return (
            <div>
                <Row>
                    <Col>
                        Your answer: <b>{props.userAnswer}</b>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Suggested answer: <b>{props.actualAnswer}</b>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={() => props.setNextQuestion(true)} variant="success" className="mt-3">Mark answer correct</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => props.setNextQuestion(false)} variant="danger" className="mt-3">Mark answer incorrect</Button>
                    </Col>
                </Row>
            </div>
        );
    } else {
        const answerMessage = props.answerCorrect ? <p>Your answer was correct!</p> : <p>Incorrect, the answer was: <strong>{props.actualAnswer}</strong></p>
        return (
            <div>
                <Row>
                    <Col>
                        Your answer: <b>{props.userAnswer}</b>
                    </Col>
                </Row> 
                <Row>
                    <Col>
                        {answerMessage}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={() => props.setNextQuestion(props.answerCorrect)} variant="primary" className="mt-3">Go to next question</Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default AnswerTextDisplay;