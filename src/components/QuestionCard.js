import { Card, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import QuestionTextDisplay from './QuestionTextDisplay';
import AnswerTextDisplay from './AnswerTextDisplay';

const QuestionCard = props => {
    const [questionMode, setQuestionMode] = useState(true);
    const [answerCorrect, setAnswerCorrect] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');

    const setQuestionModeOff = answer => {
        setQuestionMode(false);
        setUserAnswer(answer);
    }

    const handleCheckAnswer = (userAnswer, actualAnswer, alwaysCorrect) => {
        setAnswerCorrect(alwaysCorrect || userAnswer.toLowerCase() === actualAnswer.toLowerCase());
        setQuestionModeOff(userAnswer);
    }

    const setNextQuestion = prevCorrect => {
        props.loadNextQuestion(prevCorrect, props.questionNumber);
        setQuestionMode(true);
    }

    let mcqOptions = []
    if (props.questionType === 'MCQ') {
        // Split MCQ options/answer into 5 separate strings (4 options and real answer at end)
        mcqOptions = props.answer.split('|');
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
                        <QuestionTextDisplay question={props.question} answer={props.answer} mcqOptions={mcqOptions} questionType={props.questionType} handleCheckAnswer={handleCheckAnswer} setQuestionModeOff={setQuestionModeOff} handleDelete={props.handleDelete}/>
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
                        <AnswerTextDisplay questionType={props.questionType} userAnswer={userAnswer} actualAnswer={props.answer} answerCorrect={answerCorrect} setNextQuestion={setNextQuestion}/>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default QuestionCard;