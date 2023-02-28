export const fetchCourses = () => {
    return function (dispatch) {
        return fetch('http://localhost:8000/api/courses/')
            .then(response => response.json())
            .then(json => {
                dispatch({ type: 'courses/fetch', payload: json.courses });
            });
    }
}

export function addCourse(name) {
    return function (dispatch) {
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