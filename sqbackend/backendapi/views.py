from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
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
                question = qa['question'] + '?'
                answer = qa['answer']
                question = Question(
                    question_set=question_set, question_type='SA', question=question, answer=answer)
                question.save()
            return JsonResponse({'success': True})
        except Topic.DoesNotExist:
            return JsonResponse({'error': 'Invalid Topic ID'}, status=400)

class TopicQuestionsView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer 

    # Get all questions for a specific question set ID
    # REPLACE WITH MORE COMPLEX METHOD OF SELECTING QUESTIONS
    def list(self, request, *args, **kwargs):
        try:
            # Saves from request failing in case there are somehow multiple sets for the same topic
            question_set = QuestionSet.objects.filter(topic=self.kwargs['topic_pk']).first()
        except QuestionSet.DoesNotExist:
            return JsonResponse({'question_set_id': -1, 'questions': []})

        questions_in_set = Question.objects.filter(question_set=question_set)
        serializer = QuestionSerializer(questions_in_set, many=True)
        return JsonResponse({'question_set_id': question_set.id, 'questions': serializer.data})

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
        print(self.kwargs['topic_pk'])
        question_set = QuestionSet.objects.filter(topic=self.kwargs['topic_pk'])
        return JsonResponse({'exists': question_set.exists()})