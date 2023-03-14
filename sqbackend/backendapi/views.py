from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import viewsets, mixins, status
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
from scipy.special import expit
import random

class CourseView(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def create(self, request):
        name = request.data.get('name')
        course = Course(course_name=name)
        course.save()
        serialized_course = self.serializer_class(course)
        return JsonResponse({'success': True, 'course': serialized_course.data})

    def list(self, request):
        serializer = self.serializer_class(Course.objects.all(), many=True)
        return JsonResponse({'courses': serializer.data})

    def retrieve(self, request, pk=None):
        try:
            course = Course.objects.get(pk=pk)
            serializer = self.serializer_class(course)
            return JsonResponse({'course': serializer.data})
        except Course.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, pk=None):
        course = Course.objects.get(pk=pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, pk=None):
        course = Course.objects.get(pk=pk)
        serializer = self.serializer_class(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            print('serializer errors:', serializer.errors)
            return Response(serializer.errors, status=400)

class TopicView(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer 

    def create(self, request):
        name = request.data.get('name')
        notes = request.data.get('notes')

        try:
            course = Course.objects.get(pk=request.data.get('courseID'))
            topic = Topic(course=course, topic_name=name, notes=notes)
            topic.save()
            serialized_topic = self.serializer_class(topic)
            return JsonResponse({'success': True, 'topic': serialized_topic.data})
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Invalid Course ID'}, status=400)
    
    def destroy(self, request, pk=None):
        topic = Topic.objects.get(pk=pk)
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, pk=None):
        topic = Topic.objects.get(pk=pk)
        course_id = topic.course.id
        serializer = self.serializer_class(topic, data={**request.data, 'course': course_id })
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

class CourseTopicsView(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    
    def list(self, request, *args, **kwargs):
        # Get topics for a particular course ID
        course_id = self.kwargs['course_pk']
        topics_for_course = Topic.objects.filter(course=course_id)
        serializer = self.serializer_class(topics_for_course, many=True)
        return JsonResponse({'topics': serializer.data})

class NotesContentView(viewsets.ModelViewSet):
    serializer_class = NotesContentSerializer 

    def retrieve(self, request, pk=None):
        try:
            topic = Topic.objects.get(pk=pk)
            serializer = self.serializer_class(topic)
            return JsonResponse({'topic': serializer.data})
        except Topic.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class QuestionView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer 

    def destroy(self, request, pk):
        question = Question.objects.get(pk=pk)
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class QuestionSetView(viewsets.ModelViewSet):
    queryset = QuestionSet.objects.all()
    serializer_class = QuestionSetSerializer 
    predictor = Predictor()

    def create(self, request, pk=None):
        topic = Topic.objects.get(pk=request.data.get('topicID'))
        # Remove any existing question sets for the topic
        existing_question_sets = QuestionSet.objects.filter(topic=topic)
        existing_question_sets.delete()

        try:
            topic = Topic.objects.get(pk=request.data.get('topicID'))
            question_set = QuestionSet(topic=topic)
            question_set.save()
            notes = topic.notes 
            question_answers = self.predictor.predict(notes)
            # Separate each question-answer pair out and add it to database
            for qa in question_answers:
                question = qa['question']
                answer = qa['answer']
                question_type = qa['type']
                question = Question(
                    question_set=question_set, question_type=question_type, question=question, answer=answer)
                question.save()
            return JsonResponse({'success': True})
        except Topic.DoesNotExist:
            return JsonResponse({'error': 'Invalid Topic ID'}, status=400)

class TopicQuestionsView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer 
    
    # Calculate user score for their 50 most recent attempts at the question set
    def calculate_user_score(self):
        recent_attempts = QuestionSetAttempt.objects.order_by('-attempt_date')[:50]
        oldest_attempt_date = recent_attempts[len(recent_attempts)-1].attempt_date
        total_distance = (timezone.now() - oldest_attempt_date).total_seconds()

        # Calculate the total sum of (1 - normalised distances) multiplied by the fraction of correct answers
        total_correct_normalised = 0
        for attempt in recent_attempts:
            normalised_distance = (timezone.now() - attempt.attempt_date).total_seconds() / total_distance
            total_correct_normalised += (attempt.correct_answers / attempt.total_questions) * (1 - normalised_distance)
        
        # Divide total number of actual results normalised by recency by sum of all 100% results normalised by recency
        return total_correct_normalised / total_distance
    
    # Get subset of questions for a specific question set ID based on user
    # score on attempts on that question set
    def list(self, request, *args, **kwargs):
        try:
            # Saves from request failing in case there are somehow multiple sets for the same topic
            question_set = QuestionSet.objects.filter(topic=self.kwargs['topic_pk']).first()
        except QuestionSet.DoesNotExist:
            return JsonResponse({'question_set_id': -1, 'questions': []})
       
        questions_in_set = Question.objects.filter(question_set=question_set).order_by('?')
        score = self.calculate_user_score()

        probabilities = {
            'SA': expit(0.5 + 5 * score),
            'FIB': expit(0.2 - 5 * score),
            'MCQ': expit(0.2 - 5 * score),
            'TF': expit(0.1 - 10 * score),
        }
        total = sum(probabilities.values())
        normalised_probabilities = {type: prob / total for type, prob in probabilities.items()}
        
        questions_sa = list(questions_in_set.filter(question_type='SA'))
        questions_fib = list(questions_in_set.filter(question_type='FIB'))
        questions_mcq = list(questions_in_set.filter(question_type='MCQ'))
        questions_tf = list(questions_in_set.filter(question_type='TF'))
        
        picked_questions = []
        while len(picked_questions) < 20:
            category_probs = [len(questions_sa) * normalised_probabilities['SA'],
                              len(questions_fib) * normalised_probabilities['FIB'],
                              len(questions_mcq) * normalised_probabilities['MCQ'],
                              len(questions_tf) * normalised_probabilities['TF']]
            total_probs = sum(category_probs)
            if total_probs == 0:
                break
            
            category_probs = [p / total_probs for p in category_probs]
            # Choose a category with probability proportional to the number of
            # unpicked questions left in the category
            category = random.choices(['SA', 'FIB', 'MCQ', 'TF'], weights=category_probs)[0]
        
            if category == 'SA':
                question = questions_sa.pop()
            elif category == 'FIB':
                question = questions_fib.pop()
            elif category == 'MCQ':
                question = questions_mcq.pop()
            elif category == 'TF':
                question = questions_tf.pop()
            
            picked_questions.append(question)

        return JsonResponse({'question_set_id': question_set.id, 'questions': [QuestionSerializer(q).data for q in picked_questions]})

class QuestionSetAttemptView(viewsets.ModelViewSet):
    queryset = QuestionSetAttempt.objects.all()
    serializer_class = QuestionSetAttemptSerializer 
    
    # pk is Topic ID, not QuestionSet ID
    def retrieve(self, request, pk=None):
        try:
            question_set = QuestionSet.objects.filter(topic=pk).first()
            queryset = QuestionSetAttempt.objects.filter(question_set=question_set).order_by('-attempt_date')
            serializer = self.serializer_class(queryset, many=True)
            return JsonResponse({'attempts': serializer.data})
        except QuestionSet.DoesNotExist:
            return JsonResponse({'attempts': []})
    
    def create(self, request):
        total_questions = request.data.get('totalQuestions')
        correct_answers = request.data.get('correctAnswers')
        attempt_date = request.data.get('attemptDate')
        
        try: 
            question_set = QuestionSet.objects.get(pk=request.data.get('questionSetID'))
            question_set_attempt = QuestionSetAttempt(
                question_set=question_set, total_questions=total_questions, correct_answers=correct_answers, attempt_date=attempt_date)
            question_set_attempt.save()
            serialized_question_set_attempt = self.serializer_class(question_set_attempt)
            return JsonResponse({'success': True, 'questionSetAttempt': serialized_question_set_attempt.data})
        except QuestionSet.DoesNotExist:
            return JsonResponse({'error': 'Invalid Question Set ID'}, status=400)

# Determines if a question set exists for a given topic ID or not
class QuestionsExistView(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = QuestionSet.objects.all()

    def list(self, request, *args, **kwargs):
        question_set = QuestionSet.objects.filter(topic=self.kwargs['topic_pk'])
        return JsonResponse({'exists': question_set.exists()})