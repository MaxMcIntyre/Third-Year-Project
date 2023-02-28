export const fetchQuestions = topicID => {
    return function (dispatch) {
        return fetch(`http://localhost:8000/api/topics/${topicID}/questions`)
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'questions/fetch', payload: json});
            });
    }
}