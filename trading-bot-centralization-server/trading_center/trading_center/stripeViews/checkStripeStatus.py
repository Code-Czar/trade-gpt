from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db.models import Q
from ..models import User  # Adjust the import path as necessary
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SEC_KEY


@api_view(["GET"])
def check_subscription_status(request):
    stripe_customer_id = request.GET.get("customer_id")
    customer_email = request.GET.get("email")

    # Try to retrieve the Stripe customer ID from the email if not provided
    if not stripe_customer_id and customer_email:
        user = User.objects.filter(Q(details__email=customer_email)).first()
        if user and user.stripe_customer_id:
            stripe_customer_id = user.stripe_customer_id

    elif not stripe_customer_id:
        return JsonResponse(
            {"error": "Missing Stripe customer ID or email"}, status=400
        )

    try:
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id, status="all", limit=1
        )
        if subscriptions and len(subscriptions.data) > 0:
            subscription = subscriptions.data[0]
            return JsonResponse({"status": subscription.status})
        else:
            return JsonResponse({"status": "No subscription found"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
