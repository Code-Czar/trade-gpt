from django.http import Http404
from rest_framework import viewsets

from rest_framework import views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

import requests

from .models import User
from .models import Position
from .serializers import PositionSerializer
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # def get_object(self):
    #     uuid = self.kwargs.get("id")
    #     try:
    #         return User.objects.get(id=uuid)
    #     except User.DoesNotExist:
    #         raise Http404("User not found")

    def perform_create(self, serializer):
        uuid = self.request.data.get('id')
        if uuid:
            serializer.save(id=uuid)
        else:
            serializer.save()
    
    # def retrieve(self, request, *args, **kwargs):
    #     instance = get_object_or_404(self.get_queryset(), id=kwargs.get('id'))
    #     serializer = self.get_serializer(instance)
    #     return Response(serializer.data)


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"id": serializer.data["id"]},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

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

    def retrieve(self, request, pk=None):
        position = self.get_object()

        # Fetch the position data from Bybit using the order ID
        bybit_order_url = (
            f"https://api.bybit.com/v2/private/order?order_id={position.bybitOrderId}"
        )
        bybit_order_response = requests.get(bybit_order_url)
        bybit_order_data = bybit_order_response.json()

        # Merge the position data from Django and Bybit
        position_data = super().retrieve(request, pk).data
        position_data["bybitOrderData"] = bybit_order_data

        return Response(position_data)
