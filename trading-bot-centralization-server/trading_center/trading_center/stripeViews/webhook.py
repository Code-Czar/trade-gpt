from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse
from django.db.models import Q
from ..models import User


import stripe

# stripe.api_key = settings.STRIPE_SECRET_KEY


@csrf_exempt
@api_view(["POST"])
def webhook_received(request):
    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET  # Your webhook secret

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        print(e)
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print(e)
        # Invalid signature
        return HttpResponse(status=400)

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Perform actions (e.g., update customer status)
        handle_checkout_session(session)

    # Other event types can be handled here

    return HttpResponse(status=200)


def handle_checkout_session(session):
    customer_email = session.get("customer_email")

    # Filter users where details.email matches customer_email
    users = User.objects.filter(Q(details__email=customer_email))

    if users.exists():
        user = users.first()
        user.permission_level = "VIP"  # Update the permission level
        user.save()
    else:
        # Handle case where no matching user is found
        # This might involve creating a new user or logging an error
        print("No user found with email:", customer_email)
