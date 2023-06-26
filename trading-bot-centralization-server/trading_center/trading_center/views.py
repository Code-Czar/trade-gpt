from rest_framework import viewsets
from .models import Position
from .serializers import PositionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        position = self.get_object()
        position.status = "closed"
        position.save()
        return Response({"status": "position closed"})

    @action(detail=False)
    def open_positions(self, request):
        open_positions = Position.objects.filter(status="open")
        serializer = self.get_serializer(open_positions, many=True)
        return Response(serializer.data)
