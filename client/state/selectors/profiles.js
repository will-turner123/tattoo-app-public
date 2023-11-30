import { profileState } from '../atoms/profiles';
import { selectorFamily } from 'recoil';

// Selector to get conversation by ID
export const selectProfile = selectorFamily({
  key: 'selectArtist',
  get: (id) => ({ get }) => {
    const profiles = get(profileState);
    return profiles.find(profile => profile.id === id); // wouldn't it be more efficient to have ids as keys?
  },
});

export const selectProfileByUserId = selectorFamily({
  key: 'selectArtistByUserId',
  get: (userId) => ({ get }) => {
    const profiles = get(profileState);
    return profiles.find(profile => profile.user.id === userId); 
  },
});

// Selector to update conversation by ID
export const updateProfile = selectorFamily({
  key: 'updateArtist',
  set: (id) => ({ set, get }, newArtistData) => {
    const profiles = get(profileState);
    set(profileState, profiles.map(profile =>
      profile.id === id ? { ...profile, ...newArtistData } : profile
    ));
  },
});

export const updateProfileByUserId = selectorFamily({
  key: 'updateArtistByUserId',
  set: (userId) => ({ set, get }, newProfile) => {
    const profiles = get(profileState);
    set(profileState, profiles.map(profile =>
      profile.user.id === userId ? { ...profile, ...newProfile } : profile
    ));
  }
});

export const getPostsByProfileId = selectorFamily({
  key: 'postsByProfileId',
  get: (id) => ({ get }) => {
    const profiles = get(profileState);
    return profiles.find(profile => profile.id === id).posts;
  }
});


export const getPostById = selectorFamily({
  key: 'getPostById',
  get: ({ profileId, postId }) => ({ get }) => {
    console.log('starting getPostById')

    const profiles = get(profileState);
    const profile = profiles.find(profile => profile.id === profileId);
    console.log('ingetpostbyid profiles', profiles)
    console.log('profile: ', profile)
    if ( profile ) {
      console.log('we do have a profile', profile)
      console.log('tryna find post with id: ', postId)
      console.log('profile.posts.find', profile.posts.find(post => post.id === postId))
      return profile.posts.find(post => post.id === postId);
    }
    console.log('we do not have a profile')
    return 'not found'
  }
});

export const updatePostById = selectorFamily({
  key: 'updatePostById',
  set: ({ profileId, postId }) => ({ set, get }, newPostData) => {
    const profiles = get(profileState);
    const profile = profiles.find(profile => profile.id === profileId);
    if ( profile ) {
      const post = profile.posts.find(post => post.id === postId);
      const updatedPost = { ...post, ...newPostData };
      set(profileState, profiles.map(profile =>
        profile.id === profileId ? { ...profile, 
          posts: profile.posts.map(
            post => post.id === postId ? updatedPost : post) 
          } : profile
      ));
    }
  }
});