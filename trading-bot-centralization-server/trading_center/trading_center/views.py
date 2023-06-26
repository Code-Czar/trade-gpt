from django.shortcuts import render
from .models import Position
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def position_list(request):
    if request.method == 'GET':
        positions = Position.objects.all()
        positions_list = list(positions.values())
        return JsonResponse(positions_list, safe=False)
    elif request.method == 'POST':
        data = json.loads(request.body)
        position = Position.objects.create(**data)
        return JsonResponse({'id': position.id}, status=201)

@csrf_exempt
def position_detail(request, pk):
    try:
        position = Position.objects.get(pk=pk)
    except Position.DoesNotExist:
        return JsonResponse({'error': 'Position not found.'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'id': position.id, 'symbol': position.symbol, 'buy_price': position.buy_price, 'sell_price': position.sell_price, 'quantity': position.quantity, 'type': position.type, 'status': position.status})
    elif request.method == 'PUT':
        data = json.loads(request.body)
        position.symbol = data.get('symbol', position.symbol)
        position.buy_price = data.get('buy_price', position.buy_price)
        position.sell_price = data.get('sell_price', position.sell_price)
        position.quantity = data.get('quantity', position.quantity)
        position.type = data.get('type', position.type)
        position.status = data.get('status', position.status)
        position.save()
        return JsonResponse({'id': position.id, 'symbol': position.symbol, 'buy_price': position.buy_price, 'sell_price': position.sell_price, 'quantity': position.quantity, 'type': position.type, 'status': position.status})
    elif request.method == 'DELETE':
        position.delete()
        return JsonResponse({'result': 'Position deleted.'}, status=204)
