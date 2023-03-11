import generateQuestions from './generateQuestions';
import { wipeQuestionSetAttempts } from './redux/actions/questionSetAttemptsActions';

// Function that deals with question generation including frontend state
const handleQuestGen = async (id, questionsGenerating, dispatch, setShowQuestAlreadyGenModal, setShowQuestionsOverwriteModal, startQuestionGeneration, finishQuestionGeneration) => {
    if (questionsGenerating[id]) {
        // Display message that tells user questions are already generating for the given topic ID
        setShowQuestAlreadyGenModal(true);
    } else {
        // Check if questions already exist for the given topic ID
        fetch(`http://localhost:8000/api/topics/${id}/questionsexist`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    // Show warning to user if data exists
                    setShowQuestionsOverwriteModal(true);
                } else {
                    dispatch(startQuestionGeneration(id));
                    dispatch(wipeQuestionSetAttempts());
                    generateQuestions(id).then(() => dispatch(finishQuestionGeneration(id)));
                }
            });
    }
};

export default handleQuestGen;