from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import stripe


@csrf_exempt
def create_customer(request):
    data = json.loads(request.body)
    try:
        customer = stripe.Customer.create(email=data['email'])
        resp = JsonResponse({'customer': customer})
        resp.set_cookie('customer', customer.id)
        return resp
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=403)
