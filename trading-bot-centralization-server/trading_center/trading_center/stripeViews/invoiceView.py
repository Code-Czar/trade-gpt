from django.views import View
from django.http import JsonResponse

class InvoicePreviewView(View):
    def get(self, request):
        customer_id = request.COOKIES.get('customer')
        subscription_id = request.GET.get('subscriptionId')
        new_price_lookup_key = request.GET.get('newPriceLookupKey')

        try:
            invoice = stripe.Invoice.upcoming(
                customer=customer_id,
                subscription=subscription_id,
                subscription_items=[{
                    'id': subscription['items']['data'][0].id,
                    'price': os.getenv(new_price_lookup_key),
                }],
            )
            return JsonResponse({'invoice': invoice})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=403)
