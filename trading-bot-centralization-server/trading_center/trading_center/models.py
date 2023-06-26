from django.db import models
import uuid
from django.utils import timezone


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
        max_length=10, choices=(("open", "open"), ("closed", "closed")), default="open"
    )
    openingTime = models.DateTimeField(default=timezone.now)
    closingTime = models.DateTimeField(null=True, blank=True)
    PnL = models.DecimalField(max_digits=50, decimal_places=20, null=True, blank=True)

    symbol = models.CharField(max_length=255)
    buyPrice = models.DecimalField(max_digits=50, decimal_places=20, null=True)
    sellPrice = models.DecimalField(max_digits=50, decimal_places=20, null=True)
    quantity = models.IntegerField()
    type = models.CharField(max_length=5, choices=POSITION_TYPE_CHOICES)
    status = models.CharField(
        max_length=6, choices=POSITION_STATUS_CHOICES, default=OPEN
    )
