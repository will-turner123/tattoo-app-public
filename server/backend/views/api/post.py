from django.contrib.auth.middleware import get_user
from django.contrib.humanize.templatetags.humanize import naturaltime
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from .image_upload import FileUploadView
from django.core.files.storage import default_storage

from backend.models import Post, Like, Comment

class PostView(FileUploadView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.dimensions = (500, 500)
        self.directory = 'posts'

    def post(self, request, *args, **kwargs):
        user = get_user(request)
        if user.is_anonymous:
            return JsonResponse({"error": "Not logged in"}, status=400)
        try:
            file = request.FILES.get('file')
            # Here we could check if the user is an artist
            photoUrl = self.save_image(request, *args, **kwargs)
            text = request.data.get('text', '')
            if isinstance(photoUrl, JsonResponse): # Is this the best pattern? 
                return photoUrl
            post = Post(user=user, photoUrl=photoUrl, text=text)
            post.save()
            post_response = post.to_dict_with_likes_and_comments(user)
            return JsonResponse(post_response, status=201)
        except Exception as e:
            print(f'PostView post encountered error: {e}, {e.with_traceback()}')
            return JsonResponse({"error": "Unknown server error"}, status=500)

    def get(self, request, *args, **kwargs):
        try:
            post_id = kwargs.get('id')
            post = Post.objects.get(id=post_id)
            post = post.to_dict(['id', 'user', 'text', 'photoUrl', 'createdAt', 'updatedAt'])
            post['isLiked'] = Like.objects.filter(user=request.user, post=post_id).exists()
            post['likes'] = Like.objects.filter(post=post_id).count()
            post['commentAmount'] = Comment.objects.filter(post=post_id).count()
            post['createdAt'] = naturaltime(post['createdAt'])
            post['updatedAt'] = naturaltime(post['updatedAt'])
            return JsonResponse(post)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except Exception as e:
            print(f'PostView get encountered error: {e}')
            return JsonResponse({"error": "Unknown server error"}, status=500)

    def patch(self, request, *args, **kwargs):
        try:
            user = get_user(request)
            if user.is_anonymous:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            post_id = kwargs.get('id')
            post = Post.objects.get(id=post_id)
            if post.user != user:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            text = request.data.get('text')
            if text is not None:
                post.text = text
            post.save()
            return JsonResponse(post.to_dict(['id', 'user', 'text', 'photoUrl', 'createdAt', 'updatedAt']))
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        except Exception as e:
            print(f'PostView patch encountered error: {e}')
            return JsonResponse({"error": "Unknown server error"}, status=500)

    def post_save(self, file, user):
        print(f'post save called')
        # Redundant to call it again but fine for now
        file = default_storage.url(f'{self.directory}/{file.name}')
        

class PostLikeView(APIView):
    
    def post(self, request):
        try:
            user = get_user(request)
            if user.is_anonymous:
                return JsonResponse({"error": "You must be logged in to like posts"}, status=400)
            
            else:
                post_id = request.data.get('postId')
                try:
                    post = Post.objects.get(id=post_id)
                except Post.DoesNotExist:
                    return JsonResponse({"error": "Post not found"}, status=404)
                like = Like.objects.filter(user=user, post=post_id)
                is_liked = like.exists()
                if is_liked:
                    like.delete()
                    is_liked = False
                else:
                    like = Like(user=user, post=post)
                    like.save()
                    is_liked = True
                like_count = Like.objects.filter(post=post_id).count()
                print(f'isLiked: {is_liked}, likeCount: {like_count}')
                return JsonResponse({"isLiked": is_liked, "likes": like_count})

        except Exception as e:
            print(f'PostLikeView post encountered error: {e}')
            return JsonResponse({"error": "Unknown server error"}, status=500)


class PostCommentView(APIView):        
    def post(self, request):
        try:
            user = get_user(request)
            if user.is_anonymous:
                return JsonResponse({"error": "You must be logged in to comment"}, status=400)
            else:
                post_id = request.data.get('postId')
                post = Post.objects.get(id=post_id)
                text = request.data.get('text')
                comment = Comment(user=user, post=post, text=text)
                comment.save()
                
                return JsonResponse(comment.to_dict_with_user(), status=201)
        except Exception as e:
            print(f'PostCommentView post encountered error: {e}')
            return JsonResponse({"error": "Failed to save post"}, status=500)