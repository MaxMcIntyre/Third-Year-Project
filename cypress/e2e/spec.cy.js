describe('Courses', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    it('Should add a new course', () => {
        cy.request('DELETE', 'http://localhost:8000/api/deleteall');
        cy.get('input[placeholder="Enter course name"]').type('Test Course');
        cy.get('button#add-course-submit').click();
        cy.contains('Test Course');
    });

    it('Should edit a course', () => {
        cy.contains('Test Course')
            .parent()
            .parent()
            .within(() => {
                cy.contains('Edit Course').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('input#edit-course-name').clear().type('Test Course Edited');
        cy.get('button#edit-course-submit').click();
        cy.contains('Test Course Edited');
    });

    it('Should cancel a delete course operation', () => {
        cy.contains('Test Course Edited')
            .parent()
            .parent()
            .within(() => {
                cy.get('button[id=delete]').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Cancel').click();
        cy.contains('Test Course Edited');
    });

    it('Should delete a course', () => {
        cy.contains('Test Course Edited')
            .parent()
            .parent()
            .within(() => {
                cy.get('button[id=delete]').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Delete').click();
        cy.contains('Test Course Edited').should('not.exist');
    });

    it('Should retrieve courses', () => {
        cy.get('input[placeholder="Enter course name"]').clear().type('Course 1');
        cy.get('button#add-course-submit').click();
        cy.get('input[placeholder="Enter course name"]').clear().type('Course 2');
        cy.get('button#add-course-submit').click();
        cy.get('input[placeholder="Enter course name"]').clear().type('Course 3');
        cy.get('button#add-course-submit').click();

        cy.reload();
        cy.contains('Course 1');
        cy.contains('Course 2');
        cy.contains('Course 3');
    });
});

describe('Topics', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.contains('Course 1').click();
    });

    it('Should retrieve the course name', () => {
        cy.contains('Topics for Course 1');
    });

    it('Should add a new topic', () => {
        cy.get('input[placeholder="Enter topic name"]').type('Test Topic');
        cy.get('textarea[placeholder="Enter notes"]').type('Today the weather is sunny.');
        cy.get('button#add-topic-submit').click();
        cy.contains('Test Topic').click();
        cy.contains('Today the weather is sunny.');
    });

    it('Should edit a topic', () => {
        cy.contains('Test Topic')
            .parent()
            .parent()
            .within(() => {
                cy.contains('Edit Topic').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('input#edit-topic-name').clear().type('Test Topic Edited');
        cy.get('textarea#edit-topic-notes').clear().type('Today the weather is rainy.')
        cy.get('button#edit-topic-submit').click();
        cy.contains('Test Topic Edited');
        cy.contains('Test Topic Edited').click()
        cy.contains('Today the weather is rainy.');
    });

    it('Should cancel a delete topic operation', () => {
        cy.contains('Test Topic Edited')
            .parent()
            .parent()
            .within(() => {
                cy.get('button[id=delete]').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Cancel').click();
        cy.contains('Test Topic Edited');
    });

    it('Should delete a topic', () => {
        cy.contains('Test Topic Edited')
            .parent()
            .parent()
            .within(() => {
                cy.get('button[id=delete]').click();
            });

        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Delete').click();
        cy.contains('Test Topic Edited').should('not.exist');
    });

    it('Should retrieve topics', () => {
        cy.get('input[placeholder="Enter topic name"]').clear().type('Topic 1');
        cy.get('textarea[placeholder="Enter notes"]').clear().type('The sky is blue.');
        cy.get('button#add-topic-submit').click();
        cy.get('input[placeholder="Enter topic name"]').clear().type('Topic 2');
        cy.get('button#add-topic-submit').click();
        cy.get('input[placeholder="Enter topic name"]').clear().type('Topic 3');
        cy.get('button#add-topic-submit').click();

        cy.reload();
        cy.contains('Topic 1');
        cy.contains('Topic 2');
        cy.contains('Topic 3');
    });

    it("Should retrieve a topic's info", () => {
        cy.contains('Topic 1').click();
        cy.contains('Course 1');
        cy.contains('Topic 1');
        cy.contains('The sky is blue.');
    });

    it("Should show a 404 error page for topics for a course that doesn't exist", () => {
        cy.visit('http://localhost:3000/notes/0');
        cy.contains('An unexpected error occurred. Sorry about that.');
        cy.contains('404 - Course not found.');
    });

    it("Should show a 404 error page for notes for a topic that doesn't exist", () => {
        cy.visit('http://localhost:3000/content/0');
        cy.contains('An unexpected error occurred. Sorry about that.');
        cy.contains('404 - Topic not found.');
    });
});

describe('Questions', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.contains('Course 1').click();
        cy.contains('Topic 1').click();
    });

    it('Should show an error message if attempting to test oneself on a topic with no questions', () => {
        cy.contains('Test Yourself').click();
        cy.contains("Uh oh! Looks like there aren't currently any questions for this set of notes.");
    });

    it('Should show an error message if attempting to test oneself on a topic while questions are generating for it', () => {
        cy.contains('Generate Questions').click();
        cy.contains('Test Yourself').click();
        cy.contains('Questions are currently being generated for this set of notes! Check back in a short while to see them.');
    });

    it('Should successfully generate questions', () => {
        cy.wait(45000);
        cy.contains('Test Yourself').click();
        cy.contains('Test Yourself');
        cy.contains('Question 1 of');
        cy.contains('Question: ');
    });

    it('Should cancel question generation when showed an overwrite warning', () => {
        cy.contains('Generate Questions').click();
        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Cancel').click();
        cy.contains('Test Yourself').click();
        cy.contains('Test Yourself');
        cy.contains('Question 1 of');
        cy.contains('Question: ');
    });

    it('Should go ahead with question generation when showed an overwrite warning', () => {
        cy.contains('Generate Questions').click();
        cy.get('.modal-dialog').should('be.visible');
        cy.get('.modal-footer').contains('Continue').click();
        cy.contains('Test Yourself').click();
        cy.contains('Questions are currently being generated for this set of notes! Check back in a short while to see them.');
    });

    it("Should show a 404 error page for questions for a topic that doesn't exist", () => {
        cy.visit('http://localhost:3000/questions/0')
        cy.contains('An unexpected error occurred. Sorry about that.');
        cy.contains('404 - Topic not found.');
    });
});

describe('Question Set Attempting', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.contains('Course 1').click();
        cy.contains('Topic 1').click();
    });

    it('Should delete a question', () => {
        cy.contains('Test Yourself').click();
        cy.contains('Delete this Question').click();
        cy.contains('Question 1 of');
        cy.contains('Question: ');
    });

    it('Should complete a question set', () => {
        cy.contains('Test Yourself').click();
        cy.contains('Check Answer').click();
        cy.contains('Your answer:');
        cy.get('div')
            .then($element => {
                if ($element.find('button:contains("Go to next question")').length) {
                    cy.contains('Incorrect, the answer was:');
                    cy.get('button:contains("Go to next question")').click();
                } else {
                    cy.contains('Mark answer incorrect');
                    cy.contains('Mark answer correct').click();
                }
            });
        cy.contains('Finish Attempt').click();
    });

    it('Should show question set attempts', () => {
        cy.get('Table')
            .find('tr')
            .then(($rows) => {
                expect($rows.length).to.be.greaterThan(0);
            });
    });
});

describe('Misc', () => {
    it('Should show a 404 error page for an unrecognised URL', () => {
        cy.visit('http://localhost:3000/something');
        cy.contains('An unexpected error occurred. Sorry about that.');
        cy.contains('404 - Page not found.');
    });
});