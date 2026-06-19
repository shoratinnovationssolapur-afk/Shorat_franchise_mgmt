import re
from decimal import Decimal

import requests
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone


def get_pending_amount(student):
    total_fees = student.total_fees or Decimal("0")
    fees_paid = student.fees_paid or Decimal("0")
    pending = total_fees - fees_paid
    return pending if pending > 0 else Decimal("0")


def build_fee_reminder_message(student, pending_amount):
    amount = f"{pending_amount:.2f}"
    franchise = student.franchise or "your institute"
    return (
        f"Dear {student.name}, your fee payment of Rs {amount} is pending for "
        f"{franchise}. Please complete the payment at the earliest. If already paid, "
        "please ignore this reminder."
    )


def build_fee_receipt_message(student):
    paid_amount = student.fees_paid or Decimal("0")
    total_fees = student.total_fees or Decimal("0")
    pending_amount = get_pending_amount(student)
    franchise = student.franchise or "your institute"
    receipt_date = timezone.localdate().strftime("%d %b %Y")

    return (
        f"Dear {student.name}, payment receipt from {franchise}: "
        f"Rs {paid_amount:.2f} received toward your fees on {receipt_date}. "
        f"Total fees: Rs {total_fees:.2f}. "
        f"Balance pending: Rs {pending_amount:.2f}. Thank you."
    )


def _format_whatsapp_number(phone):
    phone = (phone or "").strip()
    if not phone:
        return ""

    if phone.startswith("whatsapp:"):
        return phone

    if phone.startswith("+"):
        return f"whatsapp:{phone}"

    digits = re.sub(r"\D", "", phone)
    if not digits:
        return ""

    if len(digits) == 10:
        return f"whatsapp:{settings.DEFAULT_WHATSAPP_COUNTRY_CODE}{digits}"

    return f"whatsapp:+{digits}"


def send_fee_email(student, message):
    if not student.email:
        return {"sent": False, "error": "Student email is missing."}

    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        return {"sent": False, "error": "Email SMTP settings are not configured."}

    send_mail(
        subject="Pending Fees Reminder",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[student.email],
        fail_silently=False,
    )
    return {"sent": True}


def send_fee_whatsapp(student, message):
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_WHATSAPP_FROM
    to_number = _format_whatsapp_number(student.phone)

    if not to_number:
        return {"sent": False, "error": "Student phone number is missing."}

    if not account_sid or not auth_token or not from_number:
        return {"sent": False, "error": "WhatsApp provider settings are not configured."}

    response = requests.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
        data={
            "From": from_number,
            "To": to_number,
            "Body": message,
        },
        auth=(account_sid, auth_token),
        timeout=15,
    )

    if response.status_code >= 400:
        try:
            detail = response.json().get("message", response.text)
        except ValueError:
            detail = response.text
        return {"sent": False, "error": detail}

    payload = response.json()
    return {"sent": True, "sid": payload.get("sid")}


def send_fee_reminder(student):
    pending_amount = get_pending_amount(student)
    if pending_amount <= 0:
        return {
            "student_id": student.id,
            "student_name": student.name,
            "pending_amount": "0.00",
            "sent": False,
            "error": "No pending fees for this student.",
        }

    message = build_fee_reminder_message(student, pending_amount)
    email_result = send_fee_email(student, message)
    whatsapp_result = send_fee_whatsapp(student, message)

    return {
        "student_id": student.id,
        "student_name": student.name,
        "pending_amount": f"{pending_amount:.2f}",
        "sent": email_result.get("sent", False) or whatsapp_result.get("sent", False),
        "email": email_result,
        "whatsapp": whatsapp_result,
    }


def send_fee_receipt(student):
    paid_amount = student.fees_paid or Decimal("0")
    if paid_amount <= 0:
        return {
            "student_id": student.id,
            "student_name": student.name,
            "paid_amount": "0.00",
            "sent": False,
            "error": "No paid fees recorded for this student.",
        }

    message = build_fee_receipt_message(student)
    whatsapp_result = send_fee_whatsapp(student, message)

    return {
        "student_id": student.id,
        "student_name": student.name,
        "paid_amount": f"{paid_amount:.2f}",
        "total_fees": f"{(student.total_fees or Decimal('0')):.2f}",
        "pending_amount": f"{get_pending_amount(student):.2f}",
        "sent": whatsapp_result.get("sent", False),
        "whatsapp": whatsapp_result,
    }
