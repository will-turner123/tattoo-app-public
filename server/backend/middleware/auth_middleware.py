from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication, AuthenticationFailed, InvalidToken, TokenError
from backend.settings import SECRET_KEY, DEBUG
# relative import of User model
from backend.models.user import User
import jwt


authenticator = JWTAuthentication()

class AuthMiddleware:
    """
    Before each request, checks for a token in the request header & returns the user associated with that token.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        token = request.headers.get("Authorization")
        user = None
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.get_by_id(decoded["id"]) 
        except (jwt.ExpiredSignatureError, jwt.InvalidSignatureError, jwt.InvalidSignatureError, jwt.DecodeError) as e:
            pass
        finally:
            user = user or AnonymousUser()
        
        request._cached_user = user
        request.user = user
        response = self.get_response(request)
        return response