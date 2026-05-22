from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Staff
from admin1.add_franchise.models import AddFranchise
from .serializers import StaffSerializer
from admin1.add_franchise.serializers import FranchiseSerializer

# ✅ Franchise dropdown API
class FranchiseListAPIView(generics.ListAPIView):
    queryset = AddFranchise.objects.all()
    serializer_class = FranchiseSerializer
    permission_classes = [IsAuthenticated]


# ✅ Staff list & create API
class StaffListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Franchise head: only see their staff
        if hasattr(user, "franchise") and user.franchise:
            return Staff.objects.filter(franchise=user.franchise)
        # Admin: see all staff
        return Staff.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        # Franchise head: assign their franchise automatically
        if hasattr(user, "franchise") and user.franchise:
            serializer.save(franchise=user.franchise, role="Staff")
        else:
            # Admin can specify franchise in POST payload
            serializer.save(role="Staff")


# ✅ Staff retrieve, update & delete API
class StaffRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"  # Use ID for URL, safer than name

    def get_queryset(self):
        return Staff.objects.all()

    # Delete staff and linked user
    def delete(self, request, *args, **kwargs):
        staff = self.get_object()
        staff_name = staff.name
        if staff.user:
            staff.user.delete()  # deletes both User and linked Staff due to CASCADE
        else:
            staff.delete()
        return Response(
            {"detail": f"Staff '{staff_name}' and linked user deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
