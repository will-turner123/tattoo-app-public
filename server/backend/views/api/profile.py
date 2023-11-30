from django.contrib.auth.middleware import get_user
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse
from backend.models import User
from backend.settings import SECRET_KEY
from rest_framework.request import Request
from rest_framework.views import APIView
from backend.models import Profile, Post

class ProfileView(APIView):
    
    def get(self, request):
        print(f'Artist.get()')
        if 'id' in request.GET:
            user_id = request.GET['id']
            
            profile = Profile.objects.get(id=user_id)
            request_user = get_user(request)
            response_dict = profile.to_dict_with_posts(request_user)
            return JsonResponse(response_dict, safe=False)
        else:
            return JsonResponse({'error': 'id not provided'}, status=400)

class ProfileSearchView(APIView):
    def get(self, request):
        user = get_user(request)
        try: 
            if request.GET.get('city'):
                city = request.GET.get('city').replace('+', ' ')
                profiles = Profile.objects.filter(city__icontains=city)
                if not profiles:
                    return JsonResponse({"error": "No Artists found in the specified city"}, status=400)
                profiles = [profile.to_dict_with_posts(user) for profile in profiles]
                
                return JsonResponse(profiles, status=201, safe=False)
            else:
                return JsonResponse({'error': 'City not provided'}, status=400)
        except Exception as e:
            print(f'ProfileSearchView Exception: {e}')
            return JsonResponse({'error': 'Something went wrong'}, status=400)