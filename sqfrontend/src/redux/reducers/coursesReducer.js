const initialState = {
    courses: []
};

const coursesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'courses/fetch':
            return { ...state, courses: action.payload };
        case 'courses/add':
            return { ...state, courses: [...state.courses, action.payload] };
        case 'courses/update':
            return {
                ...state, courses: state.courses.map(course => {
                    if (course.id === action.payload.id) {
                        return action.payload;
                    } else {
                        return course;
                    }
                })
            };
        case 'courses/delete':
            return { ...state, courses: state.courses.filter(course => course.id !== action.payload) };
        default:
            return state;
    }
}

export default coursesReducer;