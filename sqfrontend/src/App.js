import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './index.css';
import Error from './components/ErrorPage';
import Notes from './components/Notes';
import NotesContent from './components/NotesContent';
import Questions from './components/Questions';
import Header from './components/Header';
import Courses from './components/Courses';

const App = () => {
    return (
        <Provider store={store}>
            <Router>
                <Header />
                <Switch>
                    <Route exact path='/' component={Courses} />
                    <Route exact path='/notes/:courseID' component={Notes} />
                    <Route exact path='/content/:topicID' component={NotesContent} />
                    <Route exact path='/questions/:topicID' component={Questions} />
                    <Route
                        render={() => (
                            <Error statusText={404} message={'Page not found.'} />
                        )}
                    />
                </Switch>
            </Router>
        </Provider>
    );
}

export default App;
