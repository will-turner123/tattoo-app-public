import { atom } from 'recoil';

export const userState = atom({
    key: 'userState',
    default: false,
    // user looks like { id: 1, bio: string, photoUrl: string, etc}
});
