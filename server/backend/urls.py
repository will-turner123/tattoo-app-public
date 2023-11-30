"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from backend.views import auth, api
from backend.views.debug import DebugView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/login/', auth.Login.as_view()),
    path('auth/register/', auth.Register.as_view()),
    path('auth/user/', auth.AuthenticatedUser.as_view()),
    path('api/debug/', DebugView.as_view()),
    path('auth/logout/', auth.LogOut.as_view()),
    path('api/profile/', api.ProfileView.as_view()),
    path('api/profile/save/', api.SaveProfileView.as_view()),
    path('api/conversations/', api.ConversationView.as_view()),
    path('api/message/', api.MessageView.as_view()),
    path('api/user/edit/profilepic/', api.ProfilePicUploadView.as_view()),
    path('api/post/', api.PostView.as_view()),
    path('api/post/like/', api.PostLikeView.as_view()),
    path('api/post/comment/', api.PostCommentView.as_view()),
    path('api/search/', api.ProfileSearchView.as_view()),
    path('api/save/', api.SaveProfileView.as_view()),
]
