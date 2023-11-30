from .utils import CustomModel
from django.db import models
from backend.models import User


class Tag(CustomModel):
    TAG_CHOICES = [
        ('1', 'Lettering'),
        ('2', 'Traditional'),
        ('3', 'Neo Traditional'),
        ('4', 'Fine Line'),
        ('5', 'Tribal'),
        ('6', 'Japanese'),
        ('7', 'Blackwork'),
        ('8', 'Realism'),
    ]
    name = models.CharField(max_length=20, choices=TAG_CHOICES)


class Socials(CustomModel):
    SOCIAL_CHOICES = [
        ('instagram', 'Instagram'),
        ('website', 'Website'),
    ]
    
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='socials')
    social_name = models.CharField(max_length=20, choices=SOCIAL_CHOICES)
    social_url = models.URLField(max_length=200)

class ProfileSave(CustomModel):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='saves')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='saved_profiles')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    

class Profile(CustomModel):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    long = models.FloatField(null=True)
    lat = models.FloatField(null=True)
    city = models.CharField(max_length=50, null=True)

    tags = models.ManyToManyField(Tag, related_name='profiles', blank=True)
    hourly_pricing = models.IntegerField(default=0)
    min_pricing = models.IntegerField(default=0)
    
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    
    def to_dict_with_posts(self, request_user):
        # request user can be anonymous
        profile_dict = self.to_dict(['id', 'long', 'lat', 'createdAt', 'updatedAt', 'hourly_pricing', 'min_pricing', 'city'])
        profile_dict['tags'] = [tag.name for tag in self.tags.all()]
        profile_dict['socials'] = [{'social_name': social.social_name, 'social_url': social.social_url} for social in self.socials.all()]
        profile_dict['user'] = self.user.to_dict(['id', 'username', 'photoUrl', 'bio'])
        profile_dict['posts'] = [post.to_dict_with_likes_and_comments(request_user) for post in self.user.posts.all()]
        return profile_dict