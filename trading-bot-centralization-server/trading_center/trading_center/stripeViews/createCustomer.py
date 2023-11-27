from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from ..models import User

import json
import stripe


@csrf_exempt
def create_customer(request):
    data = json.loads(request.body)
    try:
        customer = stripe.Customer.create(email=data["email"])

        # Assuming you have a user model that stores the Stripe customer ID or email
        user, created = User.objects.get_or_create(
            details__email=data["email"],
            defaults={
                "stripe_customer_id": customer.id,
                "stripe_customer_details": customer,
            },
        )

        if not created:  # If the user already exists, update the Stripe information
            user.stripe_customer_id = customer.id
            user.stripe_customer_details = customer
            user.save()

        return JsonResponse({"customer": customer})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=403)
