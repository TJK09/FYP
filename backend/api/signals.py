
# appointments/signals.py
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging
from .models import Appointment

logger = logging.getLogger(__name__)

def _recipients_for(appt: Appointment):
    recipients = []
    if appt.patient and getattr(appt.patient, "email", None):
        recipients.append(appt.patient)
    if appt.doctor and getattr(appt.doctor, "email", None):
        if appt.doctor not in recipients:
            recipients.append(appt.doctor)
    return recipients

def _subject(action: str, appt: Appointment):
    prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "")
    return f"{prefix}Appointment {action.capitalize()} - {appt.date} {appt.time}"

def _render_message_for_recipient(appt: Appointment, action: str, recipient):
    """
    Generate email text/html specifically for one recipient.
    """
    try:
        html = render_to_string("appointments/email/appointment_notification.html", {
            "appointment": appt,
            "action": action,
            "doctor": appt.doctor,
            "patient": appt.patient,
            "department": appt.department,
            "recipient": recipient,
        })
        text = strip_tags(html)
    except Exception:
        # fallback plain text
        if recipient == appt.patient:
            text = (
                f"Hello {recipient.get_full_name() or recipient.username},\n"
                f"Your appointment has been {action} with Dr. {appt.doctor.get_full_name() or appt.doctor.username}.\n"
                f"Date: {appt.date}\nTime: {appt.time}\n"
                f"Department: {appt.department.name if appt.department else 'N/A'}\n"
            )
        else:
            text = (
                f"Hello Dr. {recipient.get_full_name() or recipient.username},\n"
                f"You have an appointment {action} with {appt.patient.get_full_name() or appt.patient.username}.\n"
                f"Date: {appt.date}\nTime: {appt.time}\n"
                f"Department: {appt.department.name if appt.department else 'N/A'}\n"
            )
        html = None
    return text, html

def _send_email(appt: Appointment, action: str, fail_silently=True):
    recipients = _recipients_for(appt)
    if not recipients:
        logger.info("No recipients for appointment %s", getattr(appt, "id", None))
        return
    subject = _subject(action, appt)

    for recipient in recipients:
        if not recipient or not getattr(recipient, "email", None):
            continue
        text, html = _render_message_for_recipient(appt, action, recipient)
        try:
            msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [recipient.email])
            if html:
                msg.attach_alternative(html, "text/html")
            msg.send(fail_silently=fail_silently)
            logger.info("Sent appointment email %s -> %s", action, recipient.email)
        except Exception:
            logger.exception("Failed to send appointment email for appt %s", getattr(appt, "id", None))

# store previous instance snapshot in threadlocal-like attribute on instance (pre_save -> post_save)
@receiver(pre_save, sender=Appointment)
def appointment_pre_save(sender, instance: Appointment, **kwargs):
    if not instance.pk:
        instance._pre_save_snapshot = None
        return
    try:
        previous = sender.objects.get(pk=instance.pk)
        instance._pre_save_snapshot = {
            "status": previous.status,
            "date": previous.date,
            "time": previous.time,
        }
    except sender.DoesNotExist:
        instance._pre_save_snapshot = None

@receiver(post_save, sender=Appointment)
def appointment_post_save(sender, instance: Appointment, created, **kwargs):
    """
    Determine action and send email:
     - created -> 'booked'
     - status changed to confirmed -> 'confirmed'
     - status changed to cancelled -> 'cancelled'
     - date/time changed -> 'rescheduled' (view should set status=rescheduled, but we catch it anyway)
     - otherwise -> 'updated'
    """
    try:
        if created:
            _send_email(instance, "booked")
            return

        prev = getattr(instance, "_pre_save_snapshot", None)

        # status explicit transitions (highest priority)
        if prev is not None:
            prev_status = prev.get("status")
            if prev_status != instance.status:
                if instance.status == Appointment.STATUS_CONFIRMED:
                    _send_email(instance, "confirmed"); return
                if instance.status == Appointment.STATUS_CANCELLED:
                    _send_email(instance, "cancelled"); return
                if instance.status == Appointment.STATUS_RESCHEDULED:
                    _send_email(instance, "rescheduled"); return

            # date/time change detection
            prev_date = prev.get("date")
            prev_time = prev.get("time")
            if prev_date != instance.date or prev_time != instance.time:
                _send_email(instance, "rescheduled")
                return

        # fallback
        _send_email(instance, "updated")
    except Exception:
        logger.exception("Error in appointment_post_save for %s", getattr(instance, "id", None))
