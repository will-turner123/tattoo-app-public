from django.contrib.auth.middleware import get_user
from django.db.models import Q
from django.db.models.query import Prefetch
from django.http import HttpResponse, JsonResponse
from backend.models import User
from rest_framework.request import Request
from rest_framework.views import APIView
from backend.models import Conversation, Message
from django.contrib.humanize.templatetags.humanize import naturaltime

class MessageView(APIView):
    """ takes {recipientId, text, conversationId} or null conversationId"""
    def post(self, request):
        try:
            user = get_user(request)
            
            if user.is_anonymous:
                return HttpResponse(status=401)
        
            sender_id = user.id
            recipient_id = request.data.get("recipientId")
            text = request.data.get("text")
            conversation_id = request.data.get("conversationId")
            
            if conversation_id:
                conversation = Conversation.objects.filter(id=conversation_id).first()
                if conversation.user1.id != sender_id and conversation.user2.id != sender_id:
                    return HttpResponse(status=401)
                message = Message(
                    senderId=sender_id, text=text, conversation=conversation
                )
                message.save()
                message_json = message.to_dict(["id", "text", "senderId"])
                message_json["createdAt"] = naturaltime(message.createdAt)
                return JsonResponse({"message": message_json, "sender": user.to_dict(["id", "username", "photoUrl"])})
                
            conversation = Conversation.find_conversation(sender_id, recipient_id)
            if not conversation:
                user2 = User.objects.filter(id=recipient_id).first()
                if not user2:
                    return JsonResponse({"error": "User not found"}, status=404)
                conversation = Conversation(user1=user, user2=user2)
                conversation.save()
                
            message = Message(senderId=sender_id, text=text, conversation=conversation)
            message.save()
            message_json = message.to_dict(["id", "text", "senderId", "createdAt"])
            return JsonResponse({"message": message_json, "sender": user.to_dict(["id", "username", "photoUrl"])})
        
        except Exception as e:
            print(f'Message got error: {e}')
            return HttpResponse(status=500)
        
        
class ConversationView(APIView):
    def get(self, request):
        try:
            user = get_user(request)
            if user.is_anonymous:
                return JsonResponse({"error": "User is not authenticated"}, status=401)
            user_id = user.id
            
            conversations = (
                Conversation.objects.filter(Q(user1=user_id) | Q(user2=user_id))
                .prefetch_related(
                    Prefetch(
                        "messages", queryset=Message.objects.order_by("-createdAt")
                    )
                ) 
            )
            
            conversations_response = []
            for convo in conversations:
                unread_count = 0
                messages = []
                latest_read_message = 0
                for message in convo.messages.all():
                    message = message.to_dict(["id", "text", "senderId", "createdAt", "read"])
                    messages.append(message)
                    if not message["read"] and message["senderId"] is not user_id:
                        unread_count += 1
                    elif message["read"] and message["senderId"] is user_id:
                        latest_read_message = message["id"]
                
                convo_dict = {
                    "id": convo.id,
                    "messages": messages,
                    "latestReadMessage": latest_read_message,
                }
                
                convo_dict["latestMessage"] = convo_dict["messages"][-1]["text"]
                convo_dict["unreadMessages"] = unread_count
                
                user_fields = ["id", "username", "photoUrl"]
                if convo.user1 and convo.user1.id != user_id:
                    convo_dict["otherUser"] = convo.user1.to_dict(user_fields)
                elif convo.user2 and convo.user2.id != user_id:
                    convo_dict["otherUser"] = convo.user2.to_dict(user_fields)
                
                conversations_response.append(convo_dict)
            conversations_response.sort(
                key=lambda convo: convo["messages"][-1]["createdAt"], 
                reverse=True,
            )
            return JsonResponse(conversations_response, safe=False)
        except Exception as e:
            print(f'ConversationView get encountered error: {e}')
            return JsonResponse({"error": "Unknown server error"}, status=500)
        