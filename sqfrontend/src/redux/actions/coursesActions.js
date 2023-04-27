export const fetchCourses = () => {
    return dispatch => {
        return fetch('http://localhost:8000/api/courses/')
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'courses/fetch', payload: json.courses });
            });
    }
}

export const addCourse = name => {
    return dispatch => {
        return fetch('http://localhost:8000/api/courses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'courses/add', payload: json.course });
            });
    }
}

export const updateCourse = (id, name) => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/courses/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_name: name })
        })
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'courses/update', payload: { id: json.id, course_name: json.course_name }});
            });
    }
}

export const deleteCourse = id => {
    return dispatch => {
        return fetch(`http://localhost:8000/api/courses/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    dispatch({ type: 'courses/delete', payload: id });
                }
            });
    }
}