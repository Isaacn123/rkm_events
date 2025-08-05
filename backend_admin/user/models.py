from django.conf import settings
from django.db import models
from django.db.models.fields import TextField
from django.contrib.auth.models import User
# Create your models here.

class Role(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    def __str__(self):
        return f"{self.user.username} ({self.role.name if self.role else 'No Role'})"  # type: ignore
