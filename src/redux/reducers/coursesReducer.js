const initialState = {
    courses: []
};

const coursesReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'courses/fetch':
            return { ...state, courses: action.payload };
        case 'courses/add':
            return { ...state, courses: [...state.courses, action.payload] };
        default:
            return state;
    }
}

export default coursesReducer;