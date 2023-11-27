from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.http import JsonResponse

@csrf_exempt
@api_view(['POST'])
def webhook_received(request):
    # Your webhook logic here
    # ...
    pass
