import { atom } from 'recoil';

// TODO: rename this to something like profile

export const profileState = atom({
    key: 'profileState',
    default: [],
    // profile looks like { id: 1, user: {user fields here id, bio, photoUrl, etc}, posts: {post fields here id, text, photoUrl, etc}}}
});