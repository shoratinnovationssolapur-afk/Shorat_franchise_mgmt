# admin1/add_batch/serializers.py
from rest_framework import serializers
from .models import Batch

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ['id', 'name', 'franchise', 'students', 'start', 'end', 'status']