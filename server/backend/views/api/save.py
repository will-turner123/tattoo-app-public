from django.contrib.auth.middleware import get_user
from django.db.models import Q
from django.db.models.query import Prefetch
from django.http import HttpResponse, JsonResponse
from backend.models import User
from rest_framework.request import Request
from rest_framework.views import APIView
from backend.models import Conversation, Message, Profile, ProfileSave
from django.contrib.humanize.templatetags.humanize import naturaltime

class SaveProfileView(APIView):
    """ takes profile_id """ # a put request would be better
    def post(self, request):
        try:
            user = get_user(request)
            
            if user.is_anonymous:
                return HttpResponse(status=401)
        except:
            return HttpResponse(status=401)
        
        profile_id = request.data.get("profile_id")
        profile = Profile.objects.filter(id=profile_id).first()
        if not profile:
            return JsonResponse({"message": "Profile not found"}, status=400)
        else:
            # check if already saved
            profile_save = ProfileSave.objects.filter(profile=profile, user=user)
            if profile_save.exists():
                profile_save.delete()
                return JsonResponse({"message": "Profile unsaved", "saved": False}, status=201)
            else:
                profile_save = ProfileSave.objects.create(profile=profile, user=user)
                profile_save.save()
                return JsonResponse({"message": "Profile saved", "saved": True}, status=201)
