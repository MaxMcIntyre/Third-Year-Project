# Generated by Django 4.1.7 on 2023-02-27 12:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='QuestionSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('notes', models.TextField()),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backendapi.course')),
            ],
        ),
        migrations.CreateModel(
            name='QuestionSetAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_questions', models.IntegerField()),
                ('correct_answers', models.IntegerField()),
                ('attempt_date', models.DateTimeField()),
                ('question_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backendapi.questionset')),
            ],
        ),
        migrations.AddField(
            model_name='questionset',
            name='topic',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backendapi.topic'),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_type', models.TextField(choices=[('SA', 'Short Answer'), ('FIG', 'Fill in Gap'), ('MCQ', 'Multiple Choice'), ('TF', 'True False')])),
                ('question', models.TextField()),
                ('answer', models.TextField()),
                ('question_set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backendapi.questionset')),
            ],
        ),
    ]
