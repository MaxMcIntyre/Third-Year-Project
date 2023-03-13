import { Row, Col, Form, Button } from 'react-bootstrap';
import { useState } from 'react';

const QuestionTextDisplay = props => {
    const [userAnswer, setUserAnswer] = useState('');

    const handleAnswerChange = e => {
        setUserAnswer(e.target.value);
    }

    const handleAnswerNoCheck = e => {
        e.preventDefault();
        // Answer only passed here so it can be displayed in AnswerTextDisplay
        props.handleCheckAnswer(userAnswer, props.answer, true);
    } 

    const handleAnswerMCQ = e => {
        e.preventDefault();
        props.handleCheckAnswer(userAnswer, props.mcqOptions[3], false);
    }

    const handleAnswer = e => {
        e.preventDefault();
        props.handleCheckAnswer(userAnswer, props.answer, false);
    }

    if (props.questionType === 'SA' || props.questionType === 'FIB') {
        return (
            <Row>
                <Col>
                    <Form.Label>Your answer: </Form.Label>
                    <Form.Control type="text" onChange={handleAnswerChange} placeholder="Enter answer" />
                    <Button onClick={props.questionType === 'SA' ? handleAnswerNoCheck : handleAnswer} className="mt-3 me-2" variant="primary" type="submit">Check Answer</Button>
                    <Button onClick={props.handleDelete} className="mt-3" variant="danger" type="submit">Delete this Question</Button>
                </Col>
            </Row>
        );
    } else if (props.questionType === 'TF') {
        return (
            <Row>
                <Col>
                    <Form.Label>Select one of the following: </Form.Label>
                    <Form.Select onChange={handleAnswerChange}>
                        <option value="">Select an answer</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                    </Form.Select>
                    <Button onClick={handleAnswer} className="mt-3 me-2" variant="primary" type="submit">Check Answer</Button>
                    <Button onClick={props.handleDelete} className="mt-3" variant="danger" type="submit">Delete this Question</Button>
                </Col>
            </Row>
        );
    } else {
        return (
            <Row>
                <Col>
                    <Form.Label>Select one of the following: </Form.Label>
                    <div>
                        <Form.Check
                            type="radio"
                            label={props.mcqOptions[0]}
                            name="radioOption"
                            value={props.mcqOptions[0]}
                            id="radioOption0"
                            onChange={e => setUserAnswer(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            label={props.mcqOptions[1]}
                            name="radioOption"
                            value={props.mcqOptions[1]}
                            id="radioOption1"
                            onChange={e => setUserAnswer(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            label={props.mcqOptions[2]}
                            name="radioOption"
                            value={props.mcqOptions[2]}
                            id="radioOption2"
                            onChange={e => setUserAnswer(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            label={props.mcqOptions[3]}
                            name="radioOption"
                            value={props.mcqOptions[3]}
                            id="radioOption3"
                            onChange={e => setUserAnswer(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAnswerMCQ} className="mt-3 me-2" variant="primary" type="submit">Check Answer</Button>
                    <Button onClick={props.handleDelete} className="mt-3" variant="danger" type="submit">Delete this Question</Button>
                </Col>
            </Row>
        );
    }
}

export default QuestionTextDisplay;