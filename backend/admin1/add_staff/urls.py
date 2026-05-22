from django.urls import path
from .views import FranchiseListAPIView, StaffListCreateAPIView, StaffRetrieveUpdateDestroyAPIView

urlpatterns = [
    # Franchise dropdown
    path('franchise/', FranchiseListAPIView.as_view(), name='franchise-list'),

    # Staff list & create
    path('', StaffListCreateAPIView.as_view(), name='staff-list-create'),

    # Staff retrieve, update & delete (by ID)
    path('<int:id>/', StaffRetrieveUpdateDestroyAPIView.as_view(), name='staff-detail'),
]
