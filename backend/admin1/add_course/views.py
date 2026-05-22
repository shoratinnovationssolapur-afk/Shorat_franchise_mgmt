from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Course
from .serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]  # Require login

    def get_queryset(self):
        user = self.request.user
        # Admin sees all courses
        if user.role == "admin":
            return Course.objects.all()
        # Franchise head sees all courses (customize filter if needed)
        if user.role == "franchise_head":
            return Course.objects.all()
        # Staff or others see nothing
        return Course.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != "admin":
            raise PermissionDenied("Only admins can add courses.")
        serializer.save()  # ✅ remove 'created_by'

    def perform_update(self, serializer):
        if self.request.user.role != "admin":
            raise PermissionDenied("Only admins can update courses.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != "admin":
            raise PermissionDenied("Only admins can delete courses.")
        instance.delete()
