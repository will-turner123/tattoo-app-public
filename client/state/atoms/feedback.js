import { atom } from 'recoil';

export const feedbackState = atom({
    key: 'feedbackState',
    default: { type: 'default', message: '', open: false },
  });