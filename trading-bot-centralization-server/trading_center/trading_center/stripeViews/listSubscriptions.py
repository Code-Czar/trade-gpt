from django.views import View
from django.http import JsonResponse

class ListSubscriptionsView(View):
    def get(self, request):
        customer_id = request.COOKIES.get('customer')
        try:
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='all',
                expand=['data.default_payment_method']
            )
            return JsonResponse({'subscriptions': subscriptions})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=403)
