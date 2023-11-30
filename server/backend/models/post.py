from .utils import CustomModel
from django.db import models
from backend.models import User


class Post(CustomModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    text = models.TextField(blank=True)
    photoUrl = models.TextField(blank=False, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def to_dict_with_likes_and_comments(self, request_user):
        post_dict = self.to_dict(['id', 'text', 'photoUrl', 'createdAt', 'updatedAt'])
        post_dict['user'] = self.user.to_dict(['id', 'username', 'photoUrl', 'bio'])
        post_dict['likes'] = self.likes.count()

        comments_amount = 0 # may wanna use this when comments are implemented
        comments = []

        for comment in self.comments.all():
            comments_amount += 1
            comments.append(comment.to_dict_with_user())

        post_dict['comments'] = comments
        post_dict['commentCount'] = comments_amount
        post_dict['isLiked'] = self.likes.filter(user=request_user).exists() if not request_user.is_anonymous else False
        return post_dict


class Like(CustomModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='likes', on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)

class Comment(CustomModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    text = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    def to_dict_with_user(self):
        comment_dict = self.to_dict(['id', 'text', 'createdAt', 'updatedAt'])
        comment_dict['user'] = self.user.to_dict(['id', 'username', 'photoUrl', 'bio'])
        return comment_dict