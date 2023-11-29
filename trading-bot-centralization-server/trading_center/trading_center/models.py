from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField

import uuid


class User(models.Model):
    ROLE_CHOICES = [
        ("Admin", "Admin"),
        ("Dev", "Developer"),
        ("User", "User"),
    ]

    PERMISSION_CHOICES = [
        ("Basic", "Basic"),
        ("Advanced", "Advanced"),
        ("VIP", "VIP"),
    ]

    id = models.UUIDField(primary_key=True, editable=False)
    details = models.JSONField()  # Updated to use the standard JSONField
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="User")
    permission_level = models.CharField(
        max_length=10, choices=PERMISSION_CHOICES, default="Basic"
    )

    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_customer_details = models.JSONField(default=dict)
    notifications = models.JSONField(default=list)

    def __str__(self):
        return str(self.id)


class Position(models.Model):
    LONG = "long"
    SHORT = "short"
    POSITION_TYPE_CHOICES = [
        (LONG, "Long"),
        (SHORT, "Short"),
    ]

    OPEN = "open"
    CLOSED = "closed"
    POSITION_STATUS_CHOICES = [
        (OPEN, "Open"),
        (CLOSED, "Closed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(
        max_length=10, choices=POSITION_STATUS_CHOICES, default=OPEN
    )
    openingTime = models.DateTimeField(default=timezone.now)
    closingTime = models.DateTimeField(null=True, blank=True)
    PnL = models.DecimalField(max_digits=50, decimal_places=20, null=True, blank=True)

    symbol = models.CharField(max_length=255)
    buyPrice = models.DecimalField(max_digits=50, decimal_places=20, null=True)
    sellPrice = models.DecimalField(max_digits=50, decimal_places=20, null=True)
    quantity = models.IntegerField()
    type = models.CharField(max_length=5, choices=POSITION_TYPE_CHOICES)

    # New field for Bybit order ID
    bybitOrderId = models.CharField(max_length=100, null=True, blank=True)
