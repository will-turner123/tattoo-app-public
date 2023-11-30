from rest_framework import response
from rest_framework.views import APIView
from django.http import HttpResponse
import json


class DebugView(APIView):
    
    def post(self, request, format=None):
        sample_data = {
            "message": "Hello, world!"
        }
        print(f'Got request: {request.data}')
        # return json response
        return HttpResponse(json.dumps(sample_data), content_type="application/json")   