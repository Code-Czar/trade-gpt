from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import stripe

from ..models import User


@csrf_exempt
def cancel_subscription(request):
    data = json.loads(request.body)
    try:
        deleted_subscription = stripe.Subscription.delete(data['subscriptionId'])
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=403)

    user = User.objects.filter(stripe_subcription_id=data['subscriptionId'])
    if user:
        user.stripe_subcription_id = None
        user.stripe_subcription_details = None
        user.save()

    return JsonResponse({'subscription': deleted_subscription})
