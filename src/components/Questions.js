import QuestionCard from './QuestionCard';
import { useState } from 'react';

const Questions = props => {
    const [index, setIndex] = useState(0);
    const [question, setQuestion] = useState(props.questions[0].question);
    const [answer, setAnswer] = useState(props.questions[0].answer);

    const loadNextQuestion = () => {
        setIndex(prevIndex => prevIndex + 1);
        console.log(index);
        if (index >= props.questions.length - 1) {
            setQuestion('ok');
            setAnswer('cool');
        } else {
            setQuestion(props.questions[index + 1].question);
            setAnswer(props.questions[index + 1].answer);
        }
    }

    return (
        <div>
            <h2 className="text-center">Test Yourself</h2>
            <QuestionCard loadNextQuestion={loadNextQuestion} question={question} answer={answer} />
        </div>
    );
}

export default Questions;