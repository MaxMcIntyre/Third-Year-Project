import { Card, Col, Row, Container, Button } from 'react-bootstrap';

const NotesContent = props => {
    return (
        <Container>
            <h2 style={{ textAlign: "center" }}>{props.courseName} - {props.topicName}</h2>
            <Card className="w-80 mx-auto mt-3">
                <Card.Body>
                    Lorem ipsum dolor sit amet. Sed facere repellendus et fuga quia ut veniam sunt quo suscipit ducimus est quibusdam facilis qui ipsa rerum At ipsum aliquid. Ea illo illum ad illum animi eos possimus adipisci!

                    Aut autem sunt quo soluta rerum sed quis culpa vel omnis quaerat est Quis vero vel mollitia expedita hic praesentium reprehenderit. Eos adipisci distinctio ut accusantium magni eum dolorum fugiat aut cumque quaerat rem labore labore. Vel amet laborum At iure nemo est labore ratione quo expedita libero?

                    Ut saepe deserunt quo quae deserunt vel temporibus aperiam vel dolore omnis. Sed quasi esse non corrupti saepe quo quod iusto id rerum earum nam quia voluptas. Aut quod aspernatur ut veritatis omnis eum blanditiis facilis ea obcaecati facere. Ut neque nihil id harum cupiditate et voluptatibus sunt aut asperiores tempora ut quisquam quam qui doloremque nobis.
                </Card.Body>
            </Card>
            <Row className="d-flex mt-3 justify-content-between">
                <Col>
                    <Button className="mr-2" variant="primary">Generate Questions</Button>
                    <Button className="mx-4" variant="primary">Test Yourself</Button>
                </Col>
            </Row>
        </Container>
    );
}

export default NotesContent;