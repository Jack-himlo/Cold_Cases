# Generated by Django 5.2 on 2025-04-10 21:01

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_case_owner_caseinstance'),
    ]

    operations = [
        migrations.CreateModel(
            name='Clue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('order', models.PositiveIntegerField(default=0)),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clues', to='api.case')),
            ],
        ),
    ]
