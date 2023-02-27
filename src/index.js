import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import ErrorPage from './components/ErrorPage';
import Notes from './components/Notes';
import NotesContent from './components/NotesContent';
import Questions from './components/Questions';
import Header from './components/Header';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

const questions = [
    { 'question': 'question 1', 'answer': 'answer 1' },
    { 'question': 'question 2', 'answer': 'answer 2' },
    { 'question': 'question 3', 'answer': 'answer 3' },
];

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <ErrorPage />
    },
    {
        path: '/notes',
        element: <Notes courseName="CS325 - Compiler Design" />
    },
    {
        path: '/content',
        element: <NotesContent courseName="CS325 - Compiler Design" topicName="Parsing" />
    },
    {
        path: '/questions',
        element: <Questions questions={questions} />
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Header />
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
