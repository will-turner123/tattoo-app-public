import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Text, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState } from '../../state/atoms/user';
import { selectProfileByUserId } from '../../state/selectors/profiles';
import { MessageInput } from './messageInput';
import { feedbackState } from '../../state/atoms/feedback';
import { SenderBubble } from './senderBubble';
import { ReceiverBubble } from './receiverBubble';
import { conversationState } from '../../state/atoms/conversations';

import axios from 'axios';
import Constants from 'expo-constants';
import { selectConversationByOtherUserId, updateConversationByOtherUserId, createConversation } from '../../state/selectors/conversations';
import { ActivityIndicator } from 'react-native-paper';

const serverUrl = Constants.manifest.extra.SERVER_URL;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
        justifyContent: 'space-around',
        padding: 24,
    },
    innerChatContainer: {
        justifyContent : 'flex-end',
        height: '100%',
        width: '100%',
    }
});


const createConversationIfNotExists = (otherUserId) => {
    console.log('creating chat if it doesnt exist')
    const setAllConversations = useSetRecoilState(conversationState);
    const conversation = useRecoilValue(selectConversationByOtherUserId(otherUserId));
    const otherUser = useRecoilValue(selectProfileByUserId(otherUserId));

    if ( !conversation ) {
        console.log('it does not exist')
        if ( otherUser ) {
            const newConversation = {
                otherUser: otherUser.user,
                messages: [],
            }
            console.log('we do have an otherUser', otherUser)
            console.log('new conversation', newConversation)
            setAllConversations(oldConversations => [...oldConversations, newConversation]);
        }
        else {
            console.error('no other user found', otherUserId)
            return false
        }
    }
    else {
        console.log('it does exist', conversation)
    }
    return true
}

export const ActiveChat = ({navigation, route}) => {
    const otherUserId = route.params.otherUserId;
    !createConversationIfNotExists(otherUserId) ? navigation.goBack() : null;
    const conversation = useRecoilValue(selectConversationByOtherUserId(otherUserId));
    const otherUser = useRecoilValue(selectProfileByUserId(otherUserId)) // redundant
    const setConversation = useSetRecoilState(updateConversationByOtherUserId(otherUserId));
    const setFeedback = useSetRecoilState(feedbackState);
    const user = useRecoilValue(userState);

    const [ loading, setLoading ] = useState(true);


    useEffect(() => {
        if ( !conversation ) {
            if (! otherUser ) {
                setFeedback({
                    type: 'error',
                    message: 'User not found',
                    open: true,
                })
            }
            console.log('this shouldnt have happened!')
            navigation.goBack();
        }
        else {
            console.log('we ')
            setLoading(false);
            console.log('no longer loading. conversation messages')

        }
    }, [conversation])

    const sendMessage = async (messageInput) => {
        setLoading(true);
        try {
            console.log('we are sending a message of ', messageInput, 'to', conversation.otherUser.id)
            const response = await axios.post(`${serverUrl}/api/message/`, {
                recipientId: conversation.otherUser.id,
                text: messageInput,
            }, {
                headers: {
                    "Authorization": `${user.token}`
                },
            })

            setConversation({
                    ...conversation,
                    messages: [response.data.message, ...conversation.messages] // put the new message at the front of array for proper sorting
                }
            )

            console.log('updated conversation after sending message...', conversation)
        }
        catch (error) {
            if ( error.response?.data ) {
                console.log('opening feedback')
                console.log('error', error.response)
                setFeedback({
                    message: error.response.data.error,
                    open: true,
                })
            }
            else {
                console.log('unknown error', error)
                setFeedback({
                    type: 'error',
                    message: 'Unknown error',
                    open: true,
                })
            }
        }
        finally {
            setLoading(false);
            return messageInput;
        }
    }

    return (
        <SafeAreaView>
            <View
                style={{
                    height: '100%',
                    width: '100%',
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'position' : 'height'} // TODO: implement expo-device's Device.modelName
                    style={styles.container}
                    contentContainerStyle={{
                        height: '100%',
                        width: '100%',
                    }}
                >
                    <View
                        style={styles.innerChatContainer}
                    >
                        {loading ? <ActivityIndicator animating={true} /> : (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            {conversation.messages &&
                                <FlatList
                                    data={conversation.messages}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({item}) => (
                                        item.senderId === conversation.otherUser.id ?
                                        <ReceiverBubble key={item.id} message={item} /> :
                                        <SenderBubble key={item.id} message={item} />
                                    )}
                                    inverted
                                />
                            }
                        </TouchableWithoutFeedback>
                        )}
                        <MessageInput
                            sendMessage={sendMessage}
                            loading={loading}
                        />
                    </View>
            </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}