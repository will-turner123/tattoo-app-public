import os
import requests
import django
import json


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from backend.models import User, Profile, Post, Comment, Like
for user in User.objects.all():
    user.delete()


print(f'Deleted all users')

def print_response(r):
    print(f'Status code: {r.status_code}')
    try:
        json_response = r.json()
        print(json.dumps(json_response, indent=4, sort_keys=True))
    except Exception as e:
        print(r)
        print(e)



base_url = "http://localhost:8000"
# print(f'Making debug API call...')

test_city = "Charlotte, NC, USA"
other_test_city = "Wilmington, NC, USA"

print(f'Making request to create user')
r = requests.post(f'{base_url}/auth/register/', data={
    "email": "hello@world.com",
    "username": "test",
    "password": "securepassword",
    "city": "Charlotte",
})
print_response(r)
token = r.json()['token']

print(f'Making test artist...')
r = requests.post(f'{base_url}/auth/register/', data={
    "email": "test@test.com",
    "username": "testartist",
    "password": "securepassword",
    "city": "Charlotte",
})

artist = Profile.objects.create(
    user=User.objects.get(username="testartist"),
    # long=35.2271544,
    # lat=-80.84254,
    lat=35.2071544,
    long=-80.85254,
    city=test_city,
)
artist.save()
from backend.models import Tag
Tag.objects.all().delete() # Should be migration
import random

# Copy / pasted from TAG_CHOICES. Would be nice to have a better way to do this
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

def create_tags(): # TODO: make this a migration
    for tag in TAG_CHOICES:
        Tag.objects.create(name=tag[1])
    print(f'Created tags')

create_tags()

def get_random_tag():
    tag_name = random.choice(TAG_CHOICES)[1]
    tag = Tag.objects.get(name=tag_name)
    return tag

def set_socials(profile):
    profile.socials.create(social_name='instagram', social_url='https://www.instagram.com/instagram/')
    profile.socials.create(social_name='website', social_url='https://www.instagram.com/instagram/')
    profile.save()

def set_pricing(profile):
    choices = [50, 60, 100, 300]
    price = random.choice(choices)
    profile.hourly_rate = price
    profile.min_pricing = price
    profile.save()

artist.tags.set([get_random_tag() for i in range(6)])
set_socials(artist)
set_pricing(artist)
artist.save()

def create_post(user, text="test post", photoUrl="https://picsum.photos/400"):
    post = Post.objects.create(
        user=user,
        text=text,
        photoUrl=photoUrl,
    )
    
    post.save()

for i in range(2):
    other_user = User(username=f"otheruser{i}", email=f"test{i}@gmail.com", password="securepassword")
    other_user.save()
    random_tags = [get_random_tag() for i in range(6)]    
    
    lat = 35.1971542 
    if i == 0:
        lat = 35.1971544
    
    other_artist = Profile.objects.create(
        user=other_user,
        lat=lat,
        long=-80.86254,
        city=test_city,
    )
    other_artist.tags.set(random_tags)
    set_pricing(other_artist)
    set_socials(other_artist)
    other_artist.save()
    print(f'Creating post for user {other_user.username}')
    create_post(other_user)

# Create a user in a different city
other_user = User(
    username=f"otheruser", 
    email=f"helloo@worldy.com",
    password="securepassword",
)
other_user.save()
other_artist = Profile.objects.create(
    user=other_user,
    lat=34.2104,
    long=-77.8868,
    city=other_test_city,
)
set_pricing(other_artist)
set_socials(other_artist)
other_artist.save()
create_post(other_user)

print(f'Logging user in...')
r = requests.post(f'{base_url}/auth/login/', data={
    "username": "test",
    "password": "securepassword",
})
print_response(r)

r = requests.get(f'{base_url}/auth/user', headers={
    # "Authorization": f'Bearer {token}'
    "Authorization": f'{token}'
})
print_response(r)

# Getting artists near me
print(f'Getting artists near me...')
r = requests.get(f'{base_url}/api/search', params={
        'city': 'Charlotte, NC, USA',
    }, headers={
    "Authorization": f'{token}'
})
print_response(r)

artist_id = r.json()[0]["user"]["id"]
print(f'Going to send message & create conversation with artist id {artist_id} as logged in user')
r = requests.post(f'{base_url}/api/message/', headers={
    "Authorization": f'{token}',
}, data={
    "recipientId": artist_id,
    "text": "Hello, I would like to get a tattoo from you!",
})
print_response(r)

# print(f'Getting conversations...')
# r = requests.get(f'{base_url}/api/conversations/', headers={
#     "Authorization": f'{token}',
# })
# print_response(r)

first_artist_id = Profile.objects.first().user.id
print(f'Fetching artist profile with user id...')
r = requests.get(f'{base_url}/api/profile/', headers={
    "Authorization": f'{token}',
}, params={"id": first_artist_id}) # This is the user id. The param name is vague 
print_response(r)

# import os
# test_profile_pic = os.path.join(os.path.dirname(__file__), 'test_profile_pic.jpg')
# print(f'test_profile_pic: {test_profile_pic}')
# test_profile_pic = open(test_profile_pic, 'rb')
# print(f'Attempting to upload a profile picture for user test...')
# r = requests.post(f'{base_url}/api/user/edit/profilepic/', headers={
#     "Authorization": f'{token}',
# }, files={
#     'file': test_profile_pic,
# })

# print_response(r)
print(f'Logging in as artist...')
r = requests.post(f'{base_url}/auth/login/', data={
    "username": "testartist",
    "password": "securepassword",
})
print_response(r)
artist_token = r.json()['token']

print(f'Going to create a post as artist...')
r = requests.post(f'{base_url}/api/post/', headers={
    "Authorization": f'{artist_token}',
}, data={
    "text": "Hello, I am an artist!",
},
files={
    'file': open(os.path.join(os.path.dirname(__file__), 'test_profile_pic.jpg'), 'rb'),
})
print_response(r)
print(f'Going to like post as artist...')
post_id = r.json()['id']
r = requests.post(f'{base_url}/api/post/like/', headers={
    "Authorization": f'{artist_token}',
}, data={
    "postId": post_id,
})

print_response(r)

print(f'Going to comment on the post as artist...')
r = requests.post(f'{base_url}/api/post/comment/', headers={
    "Authorization": f'{artist_token}',
}, data={
    "postId": post_id,
    "text": "This post sucks!!!",
})
print_response(r)