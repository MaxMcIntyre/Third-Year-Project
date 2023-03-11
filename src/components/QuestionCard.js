import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { useState, useRef } from 'react';

const QuestionCard = props => {
    const [questionMode, setQuestionMode] = useState(true);
    const [userAnswer, setUserAnswer] = useState('');
    const inputRef = useRef(null);

    const setQuestionModeOff = () => {
        setQuestionMode(false);
        setUserAnswer(inputRef.current.value);
    }

    const setNextQuestion = prevCorrect => {
        props.loadNextQuestion(prevCorrect, props.questionNumber);
        setQuestionMode(true);
    }

    if (questionMode) {
        return (
            <div>
                <Card className="mx-auto" style={{ maxWidth: "40%" }}>
                    <Card.Body>
                        <Row className="text-center">
                            <Col>
                                Question <b>{props.questionNumber}</b> of <b>{props.total}</b>
                            </Col>
                        </Row>
                        <Row className="text-center">
                            <Col>
                                Question: <b>{props.question}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label>Your answer: </Form.Label>
                                <Form.Control ref={inputRef} type="text" placeholder="Enter answer" />
                                <Button onClick={setQuestionModeOff} className="mt-3 me-2" variant="primary" type="submit">See Answer</Button>
                                <Button onClick={props.handleDelete} className="mt-3" variant="danger" type="submit">Delete this Question</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        );
    } else {
        return (
            <div>
                <Card className="mx-auto" style={{ maxWidth: "40%", minHeight: "50%" }}>
                    <Card.Body className="text-center">
                        <Row>
                            <Col>
                                Question <b>{props.questionNumber}</b> of <b>{props.total}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                Question: <b>{props.question}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                Answer: <b>{props.answer}</b>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label>Your answer: <b>{userAnswer}</b></Form.Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Button onClick={() => setNextQuestion(true)} variant="success" className="mt-3">Mark answer correct</Button>
                            </Col>
                            <Col>
                                <Button onClick={() => setNextQuestion(false)} variant="danger" className="mt-3">Mark answer incorrect</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default QuestionCard;