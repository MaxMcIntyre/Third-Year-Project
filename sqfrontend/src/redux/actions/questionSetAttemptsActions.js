export const fetchQuestionSetAttempts = topicID => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/questionsetattempts/${topicID}`)
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'questionsetattempts/fetch', payload: json.attempts });
            });
    }
}

export const addQuestionSetAttempt = (questionSetID, total, noCorrect, currTime) => {
    return dispatch => {
        return fetch('http://localhost:8000/api/questionsetattempts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'questionSetID': questionSetID,
                'totalQuestions': total,
                'correctAnswers': noCorrect,
                'attemptDate': currTime
            })
        })
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'questionsetattempts/add', payload: json.questionSetAttempt });
            });
    }
}

export const wipeQuestionSetAttempts = () => {
    return dispatch => {
        dispatch({ type: 'questionsetattempts/wipe' });
    }
}