export const fetchTopics = courseID => {
    return function (dispatch) {
        return fetch(`http://localhost:8000/api/courses/${courseID}/topics`)
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'topics/fetch', payload: json.topics });
            });
    }
}

export function addTopic(name, notes, courseID) {
    return function (dispatch) {
        return fetch('http://localhost:8000/api/topics/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, notes, courseID })
        })
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'topics/add', payload: json.topic });
            });
    }
}