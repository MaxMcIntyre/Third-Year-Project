const initialState = {
    topics: []
};

const topicsReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'topics/fetch':
            return { ...state, topics: action.payload };
        case 'topics/add':
            return { ...state, topics: [...state.topics, action.payload] };
        default:
            return state;
    }
}

export default topicsReducer;