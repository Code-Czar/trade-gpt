from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.http import JsonResponse
import json
import stripe


# Example: Converting Flask's '/create-subscription' route
class CreateSubscriptionView(APIView):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        customer_id = data["customer"]  # Handle customer ID retrieval
        price_id = data["priceId"]

        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"],
            )
            return JsonResponse(
                {
                    "subscriptionId": subscription.id,
                    "clientSecret": subscription.latest_invoice.payment_intent.client_secret,
                }
            )
        except Exception as e:
            return JsonResponse({"error": {"message": str(e)}}, status=400)
