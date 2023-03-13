import QuestionCard from './QuestionCard';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestions, deleteQuestion } from '../redux/actions/questionsActions';
import NoQuestionsCard from './NoQuestionsCard';
import QuestionsCompletedCard from './QuestionsCompletedCard';

const selectQuestions = state => state.questions.questions;
const selectQuestionsGenerating = state => state.questions.questions_generating;
const selectQuestionSetID = state => state.questions.question_set_id;

const Questions = props => {
    const [index, setIndex] = useState(-1);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [noCorrect, setNoCorrect] = useState(0);
    const dispatch = useDispatch();

    const { match } = props;
    const topicID = match.params.topicID;

    // Fetch questions for given topic ID
    useEffect(() => {
        dispatch(fetchQuestions(topicID));
    }, [dispatch, topicID]);

    let questions = useSelector(selectQuestions);
    const questionSetID = useSelector(selectQuestionSetID);
    const questionsGenerating = useSelector(selectQuestionsGenerating);

    useEffect(() => {
        if (questions.length > 0) {
            setIndex(0);
            setQuestion(questions[0].question);
            setAnswer(questions[0].answer);
            setQuestionType(questions[0].question_type);
        }
    }, []);

    const loadNextQuestion = (prevCorrect, nextIndex) => {
        if (prevCorrect) {
            setNoCorrect(prevNoCorrect => prevNoCorrect + 1);
        }
        
        setIndex(nextIndex);
        if (nextIndex < questions.length) {
            setQuestion(questions[nextIndex].question);
            setAnswer(questions[nextIndex].answer);
            setQuestionType(questions[nextIndex].question_type)
        }
    }

    const handleDelete = e => {
        e.preventDefault();
        dispatch(deleteQuestion(questions[index].id));
        const newQuestions = questions.filter(question => question.id !== questions[index].id);
        questions = newQuestions;
        loadNextQuestion(false, index);
    }

    let card;
    if (questionsGenerating[topicID]) {
        card = <NoQuestionsCard text="Questions are currently being generated for this set of notes! Check back in a short while to see them." />
    } else if (questions.length === 0) {
        card = <NoQuestionsCard text="Uh oh! Looks like there aren't currently any questions for this set of notes." />;
    } else if (index >= questions.length) {
        card = <QuestionsCompletedCard questionSetID={questionSetID} noCorrect={noCorrect} total={questions.length} />;
    } else {
        card = <QuestionCard loadNextQuestion={loadNextQuestion} handleDelete={handleDelete} questionNumber={index + 1} total={questions.length} question={question} answer={answer} questionType={questionType} />;
    }

    return (
        <div>
            <h2 className="text-center">Test Yourself</h2>
            {card}
        </div>
    );
}

export default Questions;