from django.db import models

# Create your models here.
class Course(models.Model):
    course_name = models.TextField()

class Topic(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    topic_name = models.TextField()
    notes = models.TextField()

class QuestionSet(models.Model):
    topic = models.ForeignKey('Topic', on_delete=models.CASCADE)

class Question(models.Model):
    QUESTION_TYPES = [
        ('SA', 'Short Answer'),
        ('FIG', 'Fill in Gap'),
        ('MCQ', 'Multiple Choice'),
        ('TF', 'True False')
    ]
    question_set = models.ForeignKey('QuestionSet', on_delete=models.CASCADE)
    question_type = models.TextField(choices=QUESTION_TYPES)
    question = models.TextField()
    answer = models.TextField()

class QuestionSetAttempt(models.Model):
    question_set = models.ForeignKey('QuestionSet', on_delete=models.CASCADE)
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    attempt_date = models.DateTimeField()