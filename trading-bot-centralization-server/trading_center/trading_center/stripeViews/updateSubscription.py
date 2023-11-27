from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def update_subscription(request):
    data = json.loads(request.body)
    try:
        subscription = stripe.Subscription.retrieve(data['subscriptionId'])
        updated_subscription = stripe.Subscription.modify(
            data['subscriptionId'],
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': os.getenv(data['newPriceLookupKey'].upper()),
            }]
        )
        return JsonResponse(updated_subscription)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=403)
