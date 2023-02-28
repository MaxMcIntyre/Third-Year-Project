const initialState = {
    questions: []
};

const questionsReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'questions/fetch':
            return { ...state, questions: action.payload.questions, question_set_id: action.payload.question_set_id };
        default:
            return state;
    }
}

export default questionsReducer;