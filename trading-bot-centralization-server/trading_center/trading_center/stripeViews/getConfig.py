import os
from django.views import View
from django.http import JsonResponse
from django.conf import settings


import stripe

stripe.api_key = settings.STRIPE_SEC_KEY


class GetConfigView(View):
    def get(self, request):
        prices = stripe.Price.list(lookup_keys=["sample_basic", "sample_premium"])
        return JsonResponse(
            {
                "publishableKey": settings.STRIPE_PUB_KEY,  # os.getenv('STRIPE_PUBLISHABLE_KEY'),
                "prices": prices.data,
            }
        )
