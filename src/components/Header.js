import '../App.css';
import BackButton from './BackButton';
import { Row, Col, Container } from 'react-bootstrap';
import { Switch, Route } from 'react-router-dom';

const NoBackButtonComponent = () => {
    return (
        <Container className="bg-dark py-3 mb-3" fluid>
            <Row className="align-items-center">
                <div className="text-center">
                    <h1><a style={{ color: 'white', textDecoration: 'none' }} href="/">SmartQuestions</a></h1>
                </div>
            </Row>
        </Container>
    );
}

const BackButtonComponent = () => {
    return (
        <Container className="bg-dark py-3 mb-3" fluid>
            <Row className="align-items-center">
                <Col className="text-end" xs={2}>
                    <BackButton>Go Back</BackButton>
                </Col>
                <Col xs={8} className="text-center">
                    <h1><a style={{ color: 'white', textDecoration: 'none' }} href="/">SmartQuestions</a></h1>
                </Col>
                <Col xs={2}></Col>
            </Row>
        </Container>
    );
}

const Header = () => {
    return (
        <Switch>
            <Route exact path='/' component={NoBackButtonComponent} />
            <Route exact path='/notes/:courseID' component={BackButtonComponent} />
            <Route exact path='/content/:topicID' component={BackButtonComponent} />
            <Route exact path='/questions/:topicID' component={NoBackButtonComponent} />
            <Route component={BackButtonComponent} />
        </Switch>
    );
}

export default Header;