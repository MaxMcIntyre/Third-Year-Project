const generateQuestions = async topicID => {
    const response = await fetch('http://localhost:8000/api/questionsets/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topicID })
    });
}

export default generateQuestions;