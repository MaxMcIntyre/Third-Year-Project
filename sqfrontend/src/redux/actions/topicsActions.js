export const fetchTopics = courseID => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/courses/${courseID}/topics`)
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'topics/fetch', payload: json.topics });
            });
    }
}

export const addTopic = (name, notes, courseID) => {
    return dispatch => {
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

export const updateTopic = (id, name, notes) => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/topics/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic_name: name, notes: notes })
        })
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'topics/update', payload: { id: json.id, topic_name: json.topic_name, notes: json.notes }});
            });
    }
}

export const deleteTopic = id => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/topics/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    dispatch({ type: 'topics/delete', payload: id });
                }
            });
    }
}