import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './index.css';
import App from './App';
import Error from './components/ErrorPage';
import Notes from './components/Notes';
import NotesContent from './components/NotesContent';
import Questions from './components/Questions';
import Header from './components/Header';
import BackButtonHeader from './components/BackButtonHeader';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <Router>
            <BackButtonHeader />
            <Switch>
                <Route exact path='/' component={App}/>
                <Route exact path='/notes/:courseID' component={Notes}/>
                <Route exact path='/content/:topicID' component={NotesContent} />
                <Route exact path='/questions/:topicID' component={Questions} />
                <Route 
                    render={props => (
                        <Error statusText={404} message={'Page not found.'} />
                    )}
                />
            </Switch>
        </Router>
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
