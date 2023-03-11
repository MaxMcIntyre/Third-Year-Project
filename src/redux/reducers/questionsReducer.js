/* questions_generating is a dict that maps each topic ID to true or false
depending on whether or not questions are currently being generated for that ID
*/
const initialState = {
    questions: [],
    questions_generating: {}
};

const questionsReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'questions/fetch':
            return { ...state, questions: action.payload.questions, question_set_id: action.payload.question_set_id };
        case 'questions/delete':
            return { ...state, questions: state.questions.filter(question => question.id !== action.payload) };
        case 'questions/generating':
            return { ...state, questions_generating: { ...state.questions_generating, [action.payload]: true } };
        case 'questions/finishgenerating':
            return { ...state, questions_generating: { ...state.questions_generating, [action.payload]: false } };
        default:
            return state;
    }
}

export default questionsReducer;