import stripe
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

import json

stripe.api_key = settings.STRIPE_SEC_KEY


@csrf_exempt
@api_view(["POST"])
def create_checkout_session(request):
    try:
        # Parse the request body to get the product price ID
        data = json.loads(request.body)
        email = data["email"]
        product_price_id = data.get(
            "priceId"
        )  # Ensure 'priceId' is sent in the request body
        success_url = data.get("successURL")
        cancel_url = data.get("cancelURL")

        # Create a new Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": product_price_id,
                    "quantity": 1,
                }
            ],
            customer_email=email,  # Set the email for the session here
            mode="subscription",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
        )
        return JsonResponse({"sessionId": checkout_session["id"]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
