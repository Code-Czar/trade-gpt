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
        fields = ['id', 'details', 'role', 'permission_level']