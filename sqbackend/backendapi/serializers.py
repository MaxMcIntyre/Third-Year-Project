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