from rest_framework import serializers 
from .models import Course
from .models import Topic
from .models import QuestionSet
from .models import Question 
from .models import QuestionSetAttempt

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class QuestionSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionSet
        fields = '__all__'

class QuestionSetAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionSetAttempt
        fields = '__all__'

# For selecting course and notes data for a given topic
class NotesContentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.course_name')

    class Meta:
        model = Topic 
        fields = ['id', 'topic_name', 'notes', 'course_name']