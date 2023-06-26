from django.db import models


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

    id = models.UUIDField(primary_key=True, editable=False)
    symbol = models.CharField(max_length=255)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    quantity = models.IntegerField()
    type = models.CharField(max_length=5, choices=POSITION_TYPE_CHOICES)
    status = models.CharField(
        max_length=6, choices=POSITION_STATUS_CHOICES, default=OPEN
    )
