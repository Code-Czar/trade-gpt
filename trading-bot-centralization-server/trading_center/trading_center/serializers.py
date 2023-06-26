from rest_framework import serializers
from .models import Position


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
        ]
