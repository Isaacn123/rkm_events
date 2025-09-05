# Generated manually to fix audio_file field max_length

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audios', '0003_alter_events_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='audio',
            name='audio_file',
            field=models.FileField(help_text='Upload audio file (MP3, WAV, M4A, AAC, OGG)', max_length=500, upload_to='audio_file_path'),
        ),
    ]
