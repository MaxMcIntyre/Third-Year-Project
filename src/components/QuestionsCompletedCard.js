import { Card, Row, Col, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addQuestionSetAttempt } from '../redux/actions/questionSetAttemptsActions';

const QuestionsCompletedCard = props => {
    const history = useHistory();
    const dispatch = useDispatch();
    
    // Save attempt (no. questions correct out of total) to database
    const recordAttempt = async () => {
        const currTime = new Date().toISOString();
        dispatch(addQuestionSetAttempt(props.questionSetID, props.total, props.noCorrect, currTime));
    }

    const handleClick = e => {
        e.preventDefault();
        // Only record attempt if all of the questions were not deleted
        if (props.total > 0) {
            recordAttempt(props.questionSetID);
        }
        history.goBack();
    }

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
                            <Button className="mt-2" onClick={handleClick} variant="primary">Finish Attempt</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default QuestionsCompletedCard;