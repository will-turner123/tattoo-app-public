import { useRecoilState, selectorFamily, useSetRecoilState } from 'recoil';
import { conversationState } from '../atoms/conversations';


// Selector to get conversation by ID
export const selectConversation = selectorFamily({
  key: 'selectConversation',
  get: (id) => ({ get }) => {
    const conversations = get(conversationState);
    return conversations.find(conversation => conversation.id === id);
  },
});

export const createConversation = selectorFamily({
  key: 'createConversation',
  set: (id) => ({ set, get }, newConversationData) => {
    const conversations = get(conversationState);
    set(conversationState, [...conversations, newConversationData]);
  },
});


export const selectConversationByOtherUserId = selectorFamily({
  key: 'selectConversationByOtherUserId',
  get: (id) => ({ get }) => {
    const conversations = get(conversationState);
    return conversations.find(conversation => conversation.otherUser.id === id);
  }
})

export const updateConversationByOtherUserId = selectorFamily({
  key: 'updateConversationByOtherUserId',
  set: (id) => ({ set, get }, newConversationData) => {
    const conversations = get(conversationState);
    set(conversationState, conversations.map(conversation =>
      conversation.otherUser.id === id ? { ...conversation, ...newConversationData } : conversation
    ));
  },
});

// Selector to update conversation by ID
export const updateConversation = selectorFamily({
  key: 'updateConversation',
  set: (id) => ({ set, get }, newConversationData) => {
    const conversations = get(conversationState);
    set(conversationState, conversations.map(conversation =>
      conversation.id === id ? { ...conversation, ...newConversationData } : conversation
    ));
  },
});