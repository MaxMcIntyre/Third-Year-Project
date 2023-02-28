import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import coursesReducer from './reducers/coursesReducer';
import topicsReducer from './reducers/topicsReducer';

const rootReducer = combineReducers({
    courses: coursesReducer,
    topics: topicsReducer
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;