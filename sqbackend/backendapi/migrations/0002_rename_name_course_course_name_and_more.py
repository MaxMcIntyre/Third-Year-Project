# Generated by Django 4.1.7 on 2023-02-28 03:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backendapi', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='course',
            old_name='name',
            new_name='course_name',
        ),
        migrations.RenameField(
            model_name='topic',
            old_name='name',
            new_name='topic_name',
        ),
    ]
