from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def cancel_subscription(request):
    data = json.loads(request.body)
    try:
        deleted_subscription = stripe.Subscription.delete(data['subscriptionId'])
        return JsonResponse({'subscription': deleted_subscription})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=403)
