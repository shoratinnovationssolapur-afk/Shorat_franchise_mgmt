from rest_framework import generics, permissions
from .models import Profile
from .serializers import ProfileSerializer

class MyProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Return the profile of the logged-in user
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile
