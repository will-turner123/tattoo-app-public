from typing import Any
from django.contrib.auth.middleware import get_user
from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from io import BytesIO
from django.utils.crypto import get_random_string
import os
from django.core.files.storage import default_storage


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dimensions = (500, 500)
        self.directory = 'media'
        self.strip_query_params = True # since env variable doesn't wanna work

    def save_image(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        user = get_user(request)
        if not file:
            return JsonResponse({"error": "No file given"}, status=400)
        if user.is_anonymous:
            return JsonResponse({"error": "Not logged in"}, status=400)
        try:
            # Image validation
            if (not self.validation(file)):
                return JsonResponse({"error": "Invalid file"}, status=400)
            
            file = self.image_edits(file, self.dimensions)
                                            
            # if not default_storage.exists(file_path):
            path_within_bucket = os.path.join(self.directory, file.name)
            default_storage.save(path_within_bucket, file)
            url = default_storage.url(path_within_bucket)
            if self.strip_query_params:
                url = url.split('?')[0]
            return url
        except Exception as e:
            return JsonResponse({"error": "Unknown server error"}, status=500)


    def validation(self, file):
        if file.size > 1000000:
            print(f'file size issue')
            return False
        # if file.content_type not in ['image/jpeg', 'image/png', 'image/jpg']:
        #     return False
        return True
    
    def image_edits(self, file, dimensions=None):
        dimensions = dimensions or self.dimensions
        image = Image.open(file)
        output = BytesIO()

        image = image.resize(dimensions)
        image.save(output, format='JPEG', quality=75)
        output.seek(0)

        file = InMemoryUploadedFile(
            output,
            'ImageField',
            f"{get_random_string(length=32)}.jpg",
            'image/jpeg',
            output.getbuffer().nbytes,
            None
        )
        return file
    


class ProfilePicUploadView(FileUploadView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dimensions = (200, 200)
        self.directory = 'profile_pic'
    
    def post(self, request): # TODO: Do this like in post
        user = get_user(request)
        if user.is_anonymous:
            return JsonResponse({"error": "Not logged in"}, status=400)
        try:
            photoUrl = self.save_image(request)
            if isinstance(photoUrl, JsonResponse):
                return photoUrl
            user.profile_pic = photoUrl
            user.save()
            return JsonResponse({"photoUrl": photoUrl}, status=200)
        except Exception as e:
            print(f'ProfilePicUploadView got error: {e}')
            return JsonResponse({"error": "Unknown server error"}, status=500)