from django.core.exceptions import ValidationError
import uuid
from rest_framework import serializers
from .models import Position
from .models import User


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = [
            "id",
            "symbol",
            "buyPrice",
            "sellPrice",
            "quantity",
            "type",
            "status",
            "openingTime",
            "closingTime",
            "PnL",
            "bybitOrderId",
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "details", "role", "permission_level"]

    def validate_id(self, value):
        if value:
            try:
                uuid.UUID(str(value))
            except ValueError:
                raise ValidationError("Invalid UUID format.")
            
            if User.objects.filter(id=value).exists():
                raise ValidationError("A user with this UUID already exists.")
        return value
