from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date

from admin1.attendance.reminders import create_attendance_reminders


class Command(BaseCommand):
    help = "Create staff attendance reminder notifications."

    def add_arguments(self, parser):
        parser.add_argument("kind", choices=["clock_in", "clock_out"])
        parser.add_argument("--date", dest="date", help="Date in YYYY-MM-DD format")

    def handle(self, *args, **options):
        reminder_date = parse_date(options["date"]) if options.get("date") else None
        result = create_attendance_reminders(options["kind"], reminder_date)
        self.stdout.write(self.style.SUCCESS(str(result)))
