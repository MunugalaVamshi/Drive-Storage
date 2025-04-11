

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Add any additional fields you want for the custom user model
    # For example:
    # phone_number = models.CharField(max_length=15)

    # Specify related_name to avoid conflicts with default User model
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Change related_name to avoid clash
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',  # Change related_name to avoid clash
        blank=True,
    )

import uuid
from django.db import models
from django.conf import settings  

class UploadedFile(models.Model):
    file_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)  # Unique file identifier
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} ({self.file_id})"




from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField()

    def __str__(self):
        return self.name





