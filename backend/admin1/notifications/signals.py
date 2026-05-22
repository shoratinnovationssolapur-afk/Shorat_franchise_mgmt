# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# from admin1.add_staff.models import Staff
# from admin1.add_franchise.models import AddFranchise
# from .models import Notification
# from admin1.add_event.models import Event

# def get_franchise_instance(franchise):
#     """
#     Ensure franchise is an AddFranchise instance or None.
#     """
#     if isinstance(franchise, AddFranchise):
#         return franchise
#     if isinstance(franchise, str):
#         try:
#             return AddFranchise.objects.get(name=franchise)
#         except AddFranchise.DoesNotExist:
#             return None
#     return None


# # ---------------- Staff Signals ---------------- #
# @receiver(post_save, sender=Staff)
# def staff_saved(sender, instance, created, **kwargs):
#     Notification.objects.create(
#         message=f"Staff '{instance.name}' was {'added' if created else 'updated'}.",
#         franchise=get_franchise_instance(instance.franchise)
#     )


# @receiver(post_delete, sender=Staff)
# def staff_deleted(sender, instance, **kwargs):
#     Notification.objects.create(
#         message=f"Staff '{instance.name}' was removed.",
#         franchise=get_franchise_instance(instance.franchise)
#     )


# # ---------------- Franchise Signals ---------------- #
# @receiver(post_save, sender=AddFranchise)
# def franchise_saved(sender, instance, created, **kwargs):
#     Notification.objects.create(
#         message=f"Franchise '{instance.name}' was {'added' if created else 'updated'}.",
#         franchise=instance
#     )


# @receiver(post_delete, sender=AddFranchise)
# def franchise_deleted(sender, instance, **kwargs):
#     Notification.objects.create(
#         message=f"Franchise '{instance.name}' was removed.",
#         franchise=instance
#     )


# # ---------------- Event Signals ---------------- #
# @receiver(post_save, sender=Event)
# def event_saved(sender, instance, created, **kwargs):
#     Notification.objects.create(
#         message=f"Event '{instance.name}' was {'added' if created else 'updated'}.",
#         franchise=get_franchise_instance(getattr(instance, "franchise", None))
#     )


# @receiver(post_delete, sender=Event)
# def event_deleted(sender, instance, **kwargs):
#     Notification.objects.create(
#         message=f"Event '{instance.name}' was removed.",
#         franchise=get_franchise_instance(getattr(instance, "franchise", None))
#     )

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from admin1.add_staff.models import Staff
from admin1.add_franchise.models import AddFranchise
from .models import Notification
from .push import send_notification_push
from admin1.add_event.models import Event


@receiver(post_save, sender=Notification)
def notification_saved(sender, instance, created, **kwargs):
    if created:
        send_notification_push(instance)

# ---------------- Staff Signals ---------------- #
@receiver(post_save, sender=Staff)
def staff_saved(sender, instance, created, **kwargs):
    Notification.objects.create(
        message=f"Staff '{instance.name}' was {'added' if created else 'updated'}."
    )

@receiver(post_delete, sender=Staff)
def staff_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        message=f"Staff '{instance.name}' was removed."
    )

# ---------------- Franchise Signals ---------------- #
@receiver(post_save, sender=AddFranchise)
def franchise_saved(sender, instance, created, **kwargs):
    Notification.objects.create(
        message=f"Franchise '{instance.name}' was {'added' if created else 'updated'}."
    )

@receiver(post_delete, sender=AddFranchise)
def franchise_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        message=f"Franchise '{instance.name}' was removed."
    )

# ---------------- Event Signals ---------------- #
@receiver(post_save, sender=Event)
def event_saved(sender, instance, created, **kwargs):
    Notification.objects.create(
        message=f"Event '{instance.name}' was {'added' if created else 'updated'}."
    )

@receiver(post_delete, sender=Event)
def event_deleted(sender, instance, **kwargs):
    Notification.objects.create(
        message=f"Event '{instance.name}' was removed."
    )
