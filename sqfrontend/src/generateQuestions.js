// Function that calls API to generate questions for a given topic ID
const generateQuestions = async topicID => {
    await fetch('http://localhost:8000/api/questionsets/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topicID })
    });
}

export default generateQuestions;