from .models import Course
from .models import Topic
from .models import QuestionSet
from .models import Question
from .models import QuestionSetAttempt
from .serializers import CourseSerializer
from .serializers import TopicSerializer
from .serializers import QuestionSetSerializer
from .serializers import QuestionSerializer
from .serializers import QuestionSetAttemptSerializer
from .serializers import NotesContentSerializer
from .prediction import Predictor
from rest_framework.test import APIClient, APITestCase
import json
from datetime import date
from django.test import TestCase
from .prediction import Predictor


class CoursesTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')

    def test_create(self):
        data = {'name': 'Test Course'}
        response = self.client.post('/api/courses/', data)
        self.assertEqual(response.status_code, 200)

        course = Course.objects.filter(course_name='Test Course').first()
        self.assertIsNotNone(course)

    def test_list(self):
        data = [{'course_name': 'Course 1'}, {
            'course_name': 'Course 2'}, {'course_name': 'Course 3'}]
        for data_item in data:
            Course.objects.create(course_name=data_item['course_name'])
            new_course = Course.objects.filter(
                course_name=data_item['course_name']).first()
            new_course_id = new_course.id
            data_item['id'] = new_course_id

        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['courses'], data)

    def test_retrieve(self):
        Course.objects.create(course_name='Test Course')
        course = Course.objects.filter(course_name='Test Course').first()
        course_id = course.id

        response = self.client.get(f"/api/courses/{course_id}/")
        self.assertEqual(response.status_code, 200)

        serialised_course = CourseSerializer(course)
        self.assertEqual(response.json()['course'], serialised_course.data)

    def test_destroy(self):
        Course.objects.create(course_name='Test Course')
        course = Course.objects.get(course_name='Test Course')
        course_id = course.id

        self.client.delete(f"/api/courses/{course_id}/")

        deleted_course = Course.objects.filter(course_name='Test Course')
        self.assertTrue(len(deleted_course) == 0)

    def test_update(self):
        Course.objects.create(course_name='Test Course')
        course = Course.objects.filter(course_name='Test Course').first()
        course_id = course.id

        self.client.put(f"/api/courses/{course_id}/",
                        {'course_name': 'Test Course Edited'})

        updated_course = Course.objects.get(pk=course_id)
        serialised_updated_course = CourseSerializer(updated_course)
        self.assertEqual(serialised_updated_course.data, {
                         'id': course_id, 'course_name': 'Test Course Edited'})


class TopicTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        self.course_id = Course.objects.filter(
            course_name='Test Course').first().id

    def test_create(self):
        data = {'name': 'Test Topic', 'notes': '', 'courseID': self.course_id}
        response = self.client.post('/api/topics/', data)
        self.assertEqual(response.status_code, 200)

        topic = Topic.objects.filter(topic_name='Test Topic').first()
        self.assertIsNotNone(topic)

    def test_create_course_not_exist(self):
        data = {'name': 'Test Topic', 'notes': '', 'courseID': 0}
        response = self.client.post('/api/topics/', data)
        self.assertEqual(response.status_code, 400)

    def test_destroy(self):
        Topic.objects.create(
            topic_name='Test Topic', notes='', course=Course.objects.get(pk=self.course_id)
        )
        topic = Topic.objects.get(topic_name='Test Topic')
        topic_id = topic.id

        self.client.delete(f"/api/topics/{topic_id}/")

        deleted_topic = Topic.objects.filter(topic_name='Test Topic')
        self.assertTrue(len(deleted_topic) == 0)

    def test_update(self):
        Topic.objects.create(
            topic_name='Test Topic', notes='', course=Course.objects.get(pk=self.course_id)
        )
        topic = Topic.objects.filter(topic_name='Test Topic').first()
        topic_id = topic.id

        data = {
            'topic_name': 'Test Topic Edited',
            'notes': 'Some notes'
        }

        self.client.put(
            f"/api/topics/{topic_id}/", json.dumps(data), content_type='application/json')

        updated_topic = Topic.objects.get(pk=topic_id)
        serialised_updated_topic = TopicSerializer(updated_topic)
        self.assertEqual(serialised_updated_topic.data, {
                         'id': topic_id, 'topic_name': 'Test Topic Edited', 'notes': 'Some notes', 'course': self.course_id})


class CourseTopicsTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        self.course_id = Course.objects.filter(
            course_name='Test Course').first().id

    def test_list(self):
        data = [
            {'topic_name': 'Topic 1', 'notes': '', 'course': self.course_id},
            {'topic_name': 'Topic 2', 'notes': '', 'course': self.course_id},
            {'topic_name': 'Topic 3', 'notes': '', 'course': self.course_id}
        ]

        for data_item in data:
            Topic.objects.create(
                topic_name=data_item['topic_name'],
                notes=data_item['notes'],
                course=Course.objects.get(pk=data_item['course'])
            )
            new_topic = Topic.objects.filter(
                topic_name=data_item['topic_name']).first()
            new_topic_id = new_topic.id
            data_item['id'] = new_topic_id

        response = self.client.get(f"/api/courses/{self.course_id}/topics/")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['topics'], data)

    def test_list_course_not_exist(self):
        response = self.client.get(f"/api/courses/0/topics/")
        self.assertEqual(response.status_code, 404)


class NotesContentTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        self.course_name = 'Test Course'
        Course.objects.create(course_name=self.course_name)
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        self.topic_name = 'Test Topic'
        self.notes = 'Testing is cool'
        Topic.objects.create(
            topic_name=self.topic_name, notes=self.notes, course=Course.objects.get(pk=course_id))
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id

    def test_retrieve(self):
        response = self.client.get(f"/api/notescontent/{self.topic_id}/")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['topic'], {
            'id': self.topic_id,
            'topic_name': self.topic_name,
            'notes': self.notes,
            'course_name': self.course_name
        })

    def test_retrieve_topic_not_exist(self):
        response = self.client.get(f"/api/notescontent/0/")
        self.assertEqual(response.status_code, 404)


class QuestionTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='Testing is cool',
            course=Course.objects.get(pk=course_id)
        )
        topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=topic_id)).first().id
        Question.objects.create(
            question_type='SA',
            question_set=QuestionSet.objects.get(pk=self.question_set_id),
            question='Why should we test programs?',
            answer='To ensure that they work'
        )
        self.question_id = Question.objects.filter(
            question_set=QuestionSet.objects.get(pk=self.question_set_id)).first().id

    def test_destroy(self):
        self.client.delete(f"/api/questions/{self.question_id}/")

        deleted_question = Question.objects.filter(
            question_set_id=QuestionSet.objects.get(pk=self.question_set_id)
        )
        self.assertTrue(len(deleted_question) == 0)


class QuestionSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='The sky is blue',
            course=Course.objects.get(pk=course_id)
        )
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=self.topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first().id

    def test_create(self):
        response = self.client.post(
            '/api/questionsets/', {'topicID': self.topic_id})
        self.assertEqual(response.status_code, 200)

        # Check previous question set was deleted
        old_question_set = QuestionSet.objects.filter(id=self.question_set_id)
        self.assertTrue(len(old_question_set) == 0)

        question_set = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first()
        question_set_id = question_set.id

        # Check questions exist
        questions = Question.objects.filter(question_set=question_set_id)
        self.assertTrue(len(questions) > 0)

    def test_create_topic_not_exist(self):
        response = self.client.post('/api/questionsets/', {'topicID': 0})
        self.assertEqual(response.status_code, 400)


class TopicQuestionsCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='The sky is blue',
            course=Course.objects.get(pk=course_id)
        )
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=self.topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first().id

    def test_list(self):
        data = [
            {'question_type': 'SA', 'question_set': QuestionSet.objects.get(
                pk=self.question_set_id), 'question': 'Question 1', 'answer': 'Answer 1', },
            {'question_type': 'SA', 'question_set': QuestionSet.objects.get(
                pk=self.question_set_id), 'question': 'Question 2', 'answer': 'Answer 2', },
            {'question_type': 'SA', 'question_set': QuestionSet.objects.get(
                pk=self.question_set_id), 'question': 'Question 3', 'answer': 'Answer 3', }
        ]

        for data_item in data:
            Question.objects.create(
                question_type=data_item['question_type'],
                question=data_item['question'],
                answer=data_item['answer'],
                question_set=data_item['question_set']
            )
            new_question = Question.objects.filter(
                question=data_item['question']).first()
            new_question_id = new_question.id
            data_item['id'] = new_question_id

        response = self.client.get(f"/api/topics/{self.topic_id}/questions/")
        self.assertEqual(response.status_code, 200)
        
        response_questions = response.json()['questions']
        expected_questions = [{'question_type': data_item['question_type'], 'id': data_item['id'], 'question': data_item['question'], 'question_set': self.question_set_id, 'answer': data_item['answer']} for data_item in data]

        # Sort both lists by the 'id' key
        response_questions.sort(key=lambda x: x['id'])
        expected_questions.sort(key=lambda x: x['id'])

        self.assertEqual(response_questions, expected_questions)
        self.assertEqual(
            response.json()['question_set_id'], self.question_set_id)

    def test_list_question_set_not_exist(self):
        question_set_to_delete = QuestionSet.objects.get(pk=self.question_set_id)
        question_set_to_delete.delete()
        response = self.client.get(f"/api/topics/{self.topic_id}/questions/")
        self.assertEqual(response.json()['question_set_id'], 0)

    def test_list_topic_not_exist(self):
        response = self.client.get('/api/topics/0/questions/', content_type='application/json')
        self.assertEqual(response.status_code, 404)


class QuestionSetAttemptTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='The sky is blue',
            course=Course.objects.get(pk=course_id)
        )
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=self.topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first().id
    
    def test_create(self):
        current_date = date.today() 
        data = {
            'questionSetID': self.question_set_id, 
            'totalQuestions': 1, 
            'correctAnswers': 1, 
            'attemptDate': current_date
        }
        response = self.client.post('/api/questionsetattempts/', data)
        self.assertEqual(response.status_code, 200)

        question_set = QuestionSetAttempt.objects.filter(
            question_set=QuestionSet.objects.get(pk=self.question_set_id)).first()
        self.assertIsNotNone(question_set)

    def test_create_question_set_not_exist(self):
        current_date = date.today() 
        data = {
            'questionSetID': 0, 
            'totalQuestions': 1, 
            'correctAnswers': 1, 
            'attemptDate': current_date
        }
        response = self.client.post('/api/questionsetattempts/', data)
        self.assertEqual(response.status_code, 400)

class TopicQuestionSetAttemptsTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='The sky is blue',
            course=Course.objects.get(pk=course_id)
        )
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=self.topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first().id
        
    def test_list(self):
        current_date = date.today() 

        QuestionSetAttempt.objects.create(
            question_set=QuestionSet.objects.get(pk=self.question_set_id),
            total_questions=1,
            correct_answers=1,
            attempt_date=current_date
        )
        question_set_attempt = QuestionSetAttempt.objects.filter(
            question_set=QuestionSet.objects.get(pk=self.question_set_id)).first()
        question_set_attempt_id = question_set_attempt.id

        response = self.client.get(f"/api/topics/{self.topic_id}/questionsetattempts/")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['attempts'], [{
            'id': question_set_attempt_id,
            'question_set': self.question_set_id, 
            'total_questions': 1, 
            'correct_answers': 1, 
            'attempt_date': current_date.isoformat() + 'T00:00:00Z'
        }])

    def test_list_topic_not_exist(self):
        response = self.client.get(f"/api/topics/0/questionsetattempts/")
        self.assertEqual(response.json()['attempts'], [])

class QuestionsExistTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.delete('/api/deleteall')
        Course.objects.create(course_name='Test Course')
        course_id = Course.objects.filter(
            course_name='Test Course').first().id
        Topic.objects.create(
            topic_name='Test Topic',
            notes='The sky is blue',
            course=Course.objects.get(pk=course_id)
        )
        self.topic_id = Topic.objects.filter(
            topic_name='Test Topic').first().id
        QuestionSet.objects.create(topic=Topic.objects.get(pk=self.topic_id))
        self.question_set_id = QuestionSet.objects.filter(
            topic=Topic.objects.get(pk=self.topic_id)).first().id

    def test_list_true(self):
        response = self.client.get(f"/api/topics/{self.topic_id}/questionsexist/")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['exists'], True)
    
    def test_list_false(self):
        question_set_to_delete = QuestionSet.objects.get(pk=self.question_set_id)
        question_set_to_delete.delete()
        response = self.client.get(f"/api/topics/{self.topic_id}/questionsexist/")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json()['exists'], False)

class QuestGenTestCase(TestCase):
    def setUp(self):
        self.predictor = Predictor()
    
    def test_short_answer(self):
        text = '''The T5 (Text-to-Text Transfer Transformer) model is a
        large-scale transformer-based neural network developed by Google AI. It
        is a general-purpose language model that can be fine-tuned for a wide
        range of natural language processing tasks'''
        
        questions = self.predictor.predict_sa_mcq(text.replace('\n', ' '), False)

        for question in questions:
            question_pattern = r'^.+\?$'
            # Check each question is some text ended by a question mark
            self.assertRegex(question['question'], question_pattern)
            # Check each question has an answer
            self.assertNotEqual(question['answer'], '')
    
    def test_mcq(self):
        question = 'What colour is the sky?'
        answer = 'Blue'

        question = self.predictor.predict_mcq(question, answer)

        question_pattern = r'^.+\?$'
        answer_pattern = r'^.+\|.+\|.+\|.+\|.+'
        self.assertRegex(question['question'], question_pattern)
        # Check answer is in the correct format
        self.assertRegex(question['answer'], answer_pattern)
    
    def test_fib(self):
        text = '''The T5 (Text-to-Text Transfer Transformer) model is a
        large-scale transformer-based neural network developed by Google AI. It
        is a general-purpose language model that can be fine-tuned for a wide
        range of natural language processing tasks, such as text
        classification, question answering, and machine translation.

        The T5 model is based on the transformer architecture, which was first
        introduced in the Transformer model by Vaswani et al. in 2017. The
        transformer model uses a self-attention mechanism to process input
        sequences, which allows it to capture long-range dependencies between
        the elements of the sequence.'''

        questions = self.predictor.predict_fib(text.replace('\n', ' '))

        for question in questions:
            question_pattern = r'^Fill in the blank in the following: .+$'
            self.assertRegex(question['question'], question_pattern)
            # Check each question has a blank
            self.assertIn('______', question['question'])
            self.assertNotEqual(question['answer'], '')
    
    def test_tf(self):
        text = 'The quick brown fox jumps over the lazy dog'

        question = self.predictor.predict_tf(text)
        
        question_pattern = r'^True or False\? .+$'
        self.assertRegex(question['question'], question_pattern)
        # Check answer is either True or False
        self.assertIn(question['answer'], ['True', 'False'])