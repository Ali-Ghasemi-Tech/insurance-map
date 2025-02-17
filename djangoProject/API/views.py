from rest_framework import viewsets
from .models import Hospitals
from .serializer import ItemSerializer

class HospitalViews(viewsets.ModelViewSet):
  queryset = Hospitals.objects.all()
  serializer_class = ItemSerializer