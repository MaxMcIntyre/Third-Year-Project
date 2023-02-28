import { Card, Col, Row, Button } from 'react-bootstrap';
import { fetchQuestions } from '../redux/actions/questionsActions';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import generateQuestions from '../generateQuestions';

const NoteCard = props => {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleTestYourselfClick = e => {
        e.preventDefault();
        dispatch(fetchQuestions(props.id));
        history.push(`/questions/${props.id}`);
    }

    const handleQuestGenClick = e => {
        e.preventDefault();
        generateQuestions(props.id);
    }

    const contentLink = `/content/${props.id}`;
    return (
        <div>
            <Card className="mx-auto" style={{ maxWidth: "80%" }}>
                <Card.Body>
                    <Row>
                        <Col>
                            <a href={contentLink} style={{ fontSize: "125%" }}>{props.name}</a>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button onClick={handleQuestGenClick} className="me-3" variant="primary">Generate Questions</Button>
                            <Button onClick={handleTestYourselfClick} className="me-3" variant="primary">Test Yourself</Button>
                            <Button style={{ minWidth: "30%" }} variant="danger" type="submit">Delete Notes</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NoteCard;