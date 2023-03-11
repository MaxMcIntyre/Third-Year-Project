import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import coursesReducer from './reducers/coursesReducer';
import topicsReducer from './reducers/topicsReducer';
import questionsReducer from './reducers/questionsReducer';
import questionSetAttemptsReducer from './reducers/questionSetAttemptsReducer';

const rootReducer = combineReducers({
    courses: coursesReducer,
    topics: topicsReducer,
    questions: questionsReducer,
    questionsetattempts: questionSetAttemptsReducer
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;