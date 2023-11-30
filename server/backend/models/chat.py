from . import utils
from .user import User
from django.db import models
from django.db.models import Q



class Conversation(utils.CustomModel):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    
    
    # find conversation given two user Ids
    def find_conversation(user1Id, user2Id):
        # return conversation or None if it doesn't exist
        try:
            return Conversation.objects.get(
                (Q(user1__id=user1Id) | Q(user1__id=user2Id)),
                (Q(user2__id=user1Id) | Q(user2__id=user2Id)),
            )
        except Conversation.DoesNotExist:
            return None



class Message(utils.CustomModel):
    text = models.TextField(null=False)
    senderId = models.IntegerField(null=False)
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name="messages",
        related_query_name="message", 
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    read = models.BooleanField(default=False)