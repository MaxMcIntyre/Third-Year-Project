import QuestionCard from './QuestionCard';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions } from '../redux/actions/questionsActions';
import NoQuestionsCard from './NoQuestionsCard';
import QuestionsCompletedCard from './QuestionsCompletedCard';

const selectQuestions = state => state.questions.questions;
const selectQuestionSetID = state => state.questions.question_set_id;

const Questions = props => {

    const [index, setIndex] = useState(-1);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [noCorrect, setNoCorrect] = useState(0);
    const dispatch = useDispatch();

    const { match } = props;
    const topicID = match.params.topicID;

    // Fetch questions for given topic ID
    useEffect(() => {
        dispatch(fetchQuestions(topicID));
    }, []);

    const questions = useSelector(selectQuestions);
    const questionSetID = useSelector(selectQuestionSetID);

    useEffect(() => {
        if (questions.length > 0) {
            setIndex(0);
            setQuestion(questions[0].question);
            setAnswer(questions[0].answer)
        }
    }, [questions]);

    const loadNextQuestion = prevCorrect => {
        if (prevCorrect) {
            setNoCorrect(prevNoCorrect => prevNoCorrect + 1);
        }
        
        setIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            if (nextIndex < questions.length) {
                setQuestion(questions[nextIndex].question);
                setAnswer(questions[nextIndex].answer);
            }
            return nextIndex;
        });
    }
    
    let card;
    if (questions.length == 0) {
        card = <NoQuestionsCard />;;
    } else if (index >= questions.length) {
        card = <QuestionsCompletedCard questionSetID={questionSetID} noCorrect={noCorrect} total={questions.length} />;
    } else {
        card = <QuestionCard loadNextQuestion={loadNextQuestion} question={question} answer={answer} />;
    }
    
    return (
        <div>
            <h2 className="text-center">Test Yourself</h2>
            {card}
        </div>
    );
}

export default Questions;