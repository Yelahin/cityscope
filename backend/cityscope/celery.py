import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cityscope.settings.base")

app = Celery("celery")

app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.beat_schedule = {
    "import-all-places": {
        "task": "fetchdata.tasks.import_all_places",
        "schedule": crontab(0, 0, day_of_week="monday")
    }
}

app.autodiscover_tasks()