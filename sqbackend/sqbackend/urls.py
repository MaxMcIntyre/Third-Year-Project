"""sqbackend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers 
from backendapi import views
from backendapi.views import QuestionsExistView

router = routers.DefaultRouter()
router.register(r'courses', views.CourseView, 'courses')
router.register(r'topics', views.TopicView, 'topics')
router.register(r'questions', views.QuestionView, 'questions')
router.register(r'questionsets', views.QuestionSetView, 'questionsets')
router.register(r'questionsetattempts', views.QuestionSetAttemptView, 'questionsetattempts')
router.register(r'notescontent', views.NotesContentView, 'notescontent')
router.register(r'courses/(?P<course_pk>\d+)/topics', views.CourseTopicsView, 'coursetopics')
router.register(r'topics/(?P<topic_pk>\d+)/questions', views.TopicQuestionsView, 'topicquestions')
router.register(r'topics/(?P<topic_pk>\d+)/questionsetattempts', views.TopicQuestionSetAttemptsView, 'topicquestionsetattempts')
router.register(r'topics/(?P<topic_pk>\d+)/questionsexist', QuestionsExistView, 'questionsexist')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/deleteall', views.delete_all, name='deleteall'),
]