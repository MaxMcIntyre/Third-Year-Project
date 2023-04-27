const initialState = {
    attempts: []
};

const questionSetAttemptsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'questionsetattempts/fetch':
            return { ...state, attempts: action.payload };
        case 'questionsetattempts/add':
            return { ...state, attempts: [...state.attempts, action.payload] };
        case 'questionsetattempts/wipe':
            return { ...state, attempts: [] };
        default:
            return state;
    }
}

export default questionSetAttemptsReducer;