from django.core.management.base import BaseCommand
from API.models import Hospitals

class Command(BaseCommand):
    help = 'Load hospitals from a text file'

    def handle(self, *args, **options):
        insurance = 'ایران'
        Hospitals.objects.filter(pk__lte=30).update(insurance=insurance)
