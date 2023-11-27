import stripe
from django.views import View
from django.http import JsonResponse
import os

stripePubKey="pk_test_51OGQQoJ5PV7GuigYwTYVEmyl3e1kT9jh6Oh859hcIQo6xDFh21HMWfUJexNE4oZ9bwtlfctUSbWXw0wdmX4srovX00jEAc9PgN"
stripeSecKey="sk_test_51OGQQoJ5PV7GuigYkHHZCrpRqJ4splbWJMC5OuriyMlIgCy89xCPv4pXaeI03GzGZIESNJGzaJQCukbd47kpBxQd00hijhGDee"

stripe.api_key=stripeSecKey

class GetConfigView(View):
    def get(self, request):
        prices = stripe.Price.list(
            lookup_keys=['sample_basic', 'sample_premium']
        )
        return JsonResponse({
            'publishableKey': stripePubKey,#os.getenv('STRIPE_PUBLISHABLE_KEY'),
            'prices': prices.data,
        })
