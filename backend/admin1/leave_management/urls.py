from rest_framework.routers import DefaultRouter
from .views import StaffLeaveRequestViewSet

router = DefaultRouter()
router.register(r"requests", StaffLeaveRequestViewSet, basename="leave-requests")

urlpatterns = router.urls
