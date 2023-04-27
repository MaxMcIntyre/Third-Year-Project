export const fetchQuestions = topicID => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/topics/${topicID}/questions`)
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'questions/fetch', payload: json});
            });
    }
}

export const startQuestionGeneration = id => {
    return dispatch => {
        dispatch({ type: 'questions/generating', payload: id });
    }
}

export const finishQuestionGeneration = id => {
    return dispatch => {
        dispatch({ type: 'questions/finishgenerating', payload: id });
    }
}

export const deleteQuestion = id => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/questions/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    dispatch({ type: 'questions/delete', payload: id });
                }
            });
    }
}