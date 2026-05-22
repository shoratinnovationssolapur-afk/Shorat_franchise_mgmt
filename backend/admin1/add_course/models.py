from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=200)
    duration = models.CharField(max_length=50)

    def __str__(self):
        return self.name
