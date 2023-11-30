import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.models import User

def seed():
    User.objects.all().delete()
    
    will = User(
        username="will",
        email="willyrturner@gmail.com",
        password="securepassword",
    )
    
    will.save()
    
    print(f'Deleted all users and created user {will.username} with id {will.id}')

seed()