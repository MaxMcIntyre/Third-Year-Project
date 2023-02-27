from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import viewsets
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

class CourseView(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def create(self, request):
        name = request.data.get('name')
        course = Course(name=name)
        course.save()
        return JsonResponse({'success': True})

    def list(self, request):
        serializer = self.serializer_class(Course.objects.all(), many=True)
        return JsonResponse({'courses': serializer.data})
    
    def destroy(self, request, pk):
        course = Course.objects.get(pk=pk)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, pk):
        course = self.get_object(pk)
        serializer = self.serializer_class(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

class TopicView(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer 

    def create(self, request):
        name = request.data.get('name')
        notes = request.data.get('notes')
        course = Course.objects.get(pk=request.data.get('courseID'))

        if course:
            topic = Topic(course=course, name=name, notes=notes)
            topic.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid Course ID'}, status=400)
    
    def list(self, request):
        # Get topics for a particular course ID
        topics_for_course = Topic.objects.all().filter(course=request.data.get('courseID'))
        serializer = self.serializer_class(topics_for_course, many=True)
        return JsonResponse({'topics': serializer.data})
    
    def destroy(self, request, pk):
        topic = Topic.objects.get(pk=pk)
        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, pk):
        topic = self.get_object(pk)
        serializer = self.serializer_class(topic, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)

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

    def create(self, request, pk):
        topic = Topic.objects.get(pk=request.data.get('topicID'))

        if topic:
            question_set = QuestionSet(topic=topic)
            question_set.save()
            # DUMMY QUESTIONS - REPLACE WITH NLP MODEL STUFF
            for i in range(5):
                question_text = 'question ' + str(i)
                answer_text = 'answer ' + str(i)
                question = Question(
                    question_set=question_set, question_type='SA', question=question_text, answer=answer_text)
                question.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid Topic ID'}, status=400)
    
    # Get all questions for a specific question set ID
    # REPLACE WITH MORE COMPLEX METHOD OF SELECTING QUESTIONS
    def list(self, request, pk):
        question_set = QuestionSet.objects.get(pk=pk)
        if not question_set:
            return JsonResponse({'error': 'Invalid Question Set ID'}, status=400)

        questions_in_set = Question.objects.filter(question_set=question_set)
        serializer = QuestionSerializer(questions_in_set, many=True)
        return JsonResponse({'questions': serializer.data})
        
class QuestionSetAttemptView(viewsets.ModelViewSet):
    queryset = QuestionSetAttempt.objects.all()
    serializer_class = QuestionSetAttemptSerializer 

    def create(self, request):
        total_questions = request.data.get('totalQuestions')
        correct_answers = request.data.get('correctAnswers')
        attempt_date = request.data.get('attemptDate')
        question_set = Course.objects.get(pk=request.data.get('questionSetID'))

        if question_set:
            question_set_attempt = QuestionSetAttempt(
                question_set=question_set, total_questions=total_questions, correct_answers=correct_answers, attempt_date=attempt_date)
            question_set_attempt.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid Question Set ID'}, status=400)