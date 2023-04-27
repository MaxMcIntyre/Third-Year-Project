const initialState = {
    topics: []
};

const topicsReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'topics/fetch':
            return { ...state, topics: action.payload };
        case 'topics/add':
            return { ...state, topics: [...state.topics, action.payload] };
        case 'topics/update':
                return {
                    ...state, topics: state.topics.map(topic => {
                        if (topic.id === action.payload.id) {
                            return action.payload;
                        } else {
                            return topic;
                        }
                    })
                };
        case 'topics/delete':
            return { ...state, topics: state.topics.filter(topic => topic.id !== action.payload) };
        default:
            return state;
    }
}

export default topicsReducer;