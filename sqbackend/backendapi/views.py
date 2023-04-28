from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import viewsets, mixins
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
from django.views.decorators.csrf import csrf_exempt
from datetime import date, timedelta


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
            return Response(status=404)

    def destroy(self, request, pk=None):
        course = Course.objects.get(pk=pk)
        course.delete()
        return Response(status=204)

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
        return Response(status=204)

    def update(self, request, pk=None):
        topic = Topic.objects.get(pk=pk)
        course_id = topic.course.id
        serializer = self.serializer_class(
            topic, data={**request.data, 'course': course_id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=400)


class CourseTopicsView(viewsets.ModelViewSet):
    serializer_class = TopicSerializer

    def list(self, request, *args, **kwargs):
        # Get topics for a particular course ID
        try:
            # Check course exists
            course_id = self.kwargs['course_pk']
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return JsonResponse({'topics': []}, status=404)

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
            return Response(status=404)


class QuestionView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def destroy(self, request, pk):
        question = Question.objects.get(pk=pk)
        question.delete()
        return Response(status=204)


class QuestionSetView(viewsets.ModelViewSet):
    queryset = QuestionSet.objects.all()
    serializer_class = QuestionSetSerializer
    predictor = Predictor()

    def create(self, request, pk=None):
        try:
            topic = Topic.objects.get(pk=request.data.get('topicID'))
            # Remove any existing question sets for the topic
            existing_question_sets = QuestionSet.objects.filter(topic=topic)
            existing_question_sets.delete()

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
    def calculate_user_score(self, question_set):
        two_weeks_date = date.today() - timedelta(days=14)
        # Take 50 most recent attempts in last 2 weeks
        recent_attempts = QuestionSetAttempt.objects.filter(Q(question_set=question_set) & Q(
            attempt_date__gte=two_weeks_date)).order_by('-attempt_date')[:50]
        if len(recent_attempts) < 2:
            return 0
        oldest_attempt_date = recent_attempts[len(
            recent_attempts)-1].attempt_date

        # Calculate the total sum of (attempt date - oldest attempt date) with and without fraction correct
        total = 0
        total_with_correctness = 0
        for attempt in recent_attempts:
            total += (attempt.attempt_date - oldest_attempt_date).total_seconds()
            total_with_correctness += (attempt.correct_answers / attempt.total_questions) * (
                attempt.attempt_date - oldest_attempt_date).total_seconds()

        # Divide total sum with correctness fraction by total sum
        return total_with_correctness / total

    # Get subset of questions for a specific question set ID based on user
    # score on attempts on that question set
    def list(self, request, *args, **kwargs):
        try:
            topic = Topic.objects.get(id=self.kwargs['topic_pk'])
        except Topic.DoesNotExist:
            return JsonResponse({'question_set_id': -1, 'questions': []}, status=404)

        try:
            # Saves from request failing in case there are somehow multiple or no sets for the topic
            question_set = QuestionSet.objects.filter(
                topic=self.kwargs['topic_pk']).first()
            if question_set is None:
                raise QuestionSet.DoesNotExist
        except Exception:
            return JsonResponse({'question_set_id': 0, 'questions': []})

        questions_in_set = Question.objects.filter(
            question_set=question_set).order_by('?')
        score = self.calculate_user_score(question_set)

        probabilities = {
            'SA': expit(0.5 + 5 * score),
            'FIB': expit(0.2 - 5 * score),
            'MCQ': expit(0.2 - 5 * score),
            'TF': expit(0.1 - 10 * score),
        }
        total = sum(probabilities.values())
        normalised_probabilities = {
            type: prob / total for type, prob in probabilities.items()}

        questions_sa = list(questions_in_set.filter(question_type='SA'))
        questions_fib = list(questions_in_set.filter(question_type='FIB'))
        questions_mcq = list(questions_in_set.filter(question_type='MCQ'))
        questions_tf = list(questions_in_set.filter(question_type='TF'))

        picked_questions = []
        while len(picked_questions) < 20:
            question_type_probabilities = [len(questions_sa) * normalised_probabilities['SA'],
                                           len(questions_fib) *
                                           normalised_probabilities['FIB'],
                                           len(questions_mcq) *
                                           normalised_probabilities['MCQ'],
                                           len(questions_tf) * normalised_probabilities['TF']]
            total_probability = sum(question_type_probabilities)
            if total_probability == 0:
                # Exhausted all questions
                break

            question_type_probabilities = [
                p / total_probability for p in question_type_probabilities]
            # Choose a question type with probability proportional to the
            # number of unpicked questions left in the question type
            question_type = random.choices(
                ['SA', 'FIB', 'MCQ', 'TF'], weights=question_type_probabilities)[0]

            if question_type == 'SA':
                question = questions_sa.pop()
            elif question_type == 'FIB':
                question = questions_fib.pop()
            elif question_type == 'MCQ':
                question = questions_mcq.pop()
            elif question_type == 'TF':
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
            if question_set is None:
                raise QuestionSet.DoesNotExist
            queryset = QuestionSetAttempt.objects.filter(
                question_set=question_set).order_by('-attempt_date')
            serializer = self.serializer_class(queryset, many=True)
            return JsonResponse({'attempts': serializer.data})
        except QuestionSet.DoesNotExist:
            return JsonResponse({'attempts': []})

    def create(self, request):
        total_questions = request.data.get('totalQuestions')
        correct_answers = request.data.get('correctAnswers')
        attempt_date = request.data.get('attemptDate')

        try:
            question_set = QuestionSet.objects.get(
                pk=request.data.get('questionSetID'))
            question_set_attempt = QuestionSetAttempt(
                question_set=question_set, total_questions=total_questions, correct_answers=correct_answers, attempt_date=attempt_date)
            question_set_attempt.save()
            serialized_question_set_attempt = self.serializer_class(
                question_set_attempt)
            return JsonResponse({'success': True, 'questionSetAttempt': serialized_question_set_attempt.data})
        except QuestionSet.DoesNotExist:
            return JsonResponse({'error': 'Invalid Question Set ID'}, status=400)

class TopicQuestionSetAttemptsView(viewsets.ModelViewSet):
    queryset = QuestionSetAttempt.objects.all()
    serializer_class = QuestionSetAttemptSerializer

    def list(self, request, *args, **kwargs):
        try:
            question_set = QuestionSet.objects.filter(topic=self.kwargs['topic_pk']).first()
            if question_set is None:
                raise QuestionSet.DoesNotExist
            queryset = QuestionSetAttempt.objects.filter(
                question_set=question_set).order_by('-attempt_date')
            serializer = self.serializer_class(queryset, many=True)
            return JsonResponse({'attempts': serializer.data})
        except QuestionSet.DoesNotExist:
            return JsonResponse({'attempts': []})
        
# Determines if a question set exists for a given topic ID or not
class QuestionsExistView(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = QuestionSet.objects.all()

    def list(self, request, *args, **kwargs):
        question_set = QuestionSet.objects.filter(
            topic=self.kwargs['topic_pk'])
        return JsonResponse({'exists': question_set.exists()})


@csrf_exempt
def delete_all(request):
    Course.objects.all().delete()
    return JsonResponse({"message": "All cleaned up"})