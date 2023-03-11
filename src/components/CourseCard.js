import { Card, Col, Row, Button } from 'react-bootstrap';
import ConfirmDeletionModal from './ConfirmDeletionModal';
import EditCourseModal from './EditCourseModal';
import { deleteCourse } from '../redux/actions/coursesActions';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const CourseCard = props => {
    const history = useHistory();
    const notesLink = `/notes/${props.id}`;
    
    const [showDeletionModal, setShowDeletionModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const handleDelete = () => setShowDeletionModal(true);
    const handleUpdate = () => setShowUpdateModal(true);
    const handleCloseDeletionModal = () => setShowDeletionModal(false);
    const handleCloseUpdateModal = () => setShowUpdateModal(false);
    
    const handleLinkClick = e => {
        e.preventDefault();
        history.push(notesLink, { state: props.state });
    }
    return (
        <div>
        <Card className="mx-auto" style={{ maxWidth: "80%" }}>
            <Card.Body>
                <Row>
                    <Col>
                        <a style={{ fontSize: "125%" }} href={notesLink} onClick={handleLinkClick}>{props.name}</a>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <Button className="me-3" style={{ minWidth: "30%" }} onClick={handleUpdate} variant="primary" type="submit">Edit Course</Button>
                        <Button style={{ minWidth: "30%" }} onClick={handleDelete} variant="danger" type="submit">Delete Course</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
        <ConfirmDeletionModal 
            showModal={showDeletionModal} 
            handleCloseModal={handleCloseDeletionModal}
            id={props.id}
            deleteMethod={deleteCourse}
            text={'Are you sure you want to delete this course? This cannot be undone, and all of its topics and associated questions will be deleted!'}
        />
        <EditCourseModal 
            showModal={showUpdateModal} 
            handleCloseModal={handleCloseUpdateModal}
            id={props.id}
            name={props.name}
        />
        </div>
    );
}

export default CourseCard;