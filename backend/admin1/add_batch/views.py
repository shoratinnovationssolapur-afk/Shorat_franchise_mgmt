# admin1/add_batch/views.py
from rest_framework import viewsets, permissions
from .models import Batch
from .serializers import BatchSerializer

class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # ✅ Admin sees all batches
        if user.is_superuser or user.is_staff:
            return Batch.objects.all()

        # ✅ Franchise head/staff see only their franchise batches
        user_franchise = getattr(user, "franchise", None)
        if user_franchise:
            return Batch.objects.filter(franchise=user_franchise.name)

        # Default empty
        return Batch.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        user_franchise = getattr(user, "franchise", None)

        # ✅ Franchise head creates only their own batch
        if user_franchise and not user.is_superuser:
            serializer.save(franchise=user_franchise.name)
        else:
            serializer.save()
