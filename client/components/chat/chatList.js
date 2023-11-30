import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, ActivityIndicator, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { List, Avatar, Text } from 'react-native-paper';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '../../state/atoms/user';
import { conversationState } from '../../state/atoms/conversations';
import Constants from 'expo-constants';
import axios from 'axios';

const serverUrl = Constants.manifest.extra.SERVER_URL;

export const ChatList = ({ navigation }) => {
    // const { theme } = useTheme();
    const user = useRecoilValue(userState);
    const [conversations, setConversations] = useRecoilState(conversationState);
    const [ refreshing, setRefreshing ] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!conversations) {
            setLoading(true); 
            getConversationList()
            setLoading(false);
        }
        else {
            setLoading(false);
        }
    }, [conversations])

    async function getConversationList() {
        console.log('making request')
        const response = await axios.get(`${serverUrl}/api/conversations/`, {
            headers: {
                "Authorization": `${user.token}`
            },
        })
        .catch((error) => {
            if ( error.response?.data ) {
                console.log('opening feedback')
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
        });

        const data = response.data
        setConversations(data)
        setLoading(false)
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getConversationList().then(() => setRefreshing(false));
    }, []);

    return (
        <SafeAreaView>
            <View
                style={{
                    backgroundColor: 'white',
                }}
            >
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={{
                    height: '100%',
                    width: '100%',
                }}
            >
                {loading ? (
                    <ActivityIndicator animating={true} />
                ) : (
                    <>
                        {conversations && conversations.map((conversation) => {
                            return (
                                <TouchableOpacity 
                                    key={conversation.id}
                                    onPress={() => navigation.navigate('ActiveChat', { otherUserId: conversation.otherUser.id })}
                                >
                                    <List.Item
                                        key={conversation.id}
                                        title={conversation.otherUser.username}
                                        right={props => <Text {...props} variant="bodySmall">{conversation.messages.length > 0 ? conversation.messages[0].createdAt : ""}</Text>}
                                        description={conversation.messages.length > 0 ? conversation.messages[0].text : ""} // p sure there's a better way to do this
                                        left={props => <Avatar.Image {...props} source={{ uri: conversation.otherUser.photoUrl }}/>}
                                    />
                                </TouchableOpacity>
                            )
                        })}
                    </>
                )    
                }
            </ScrollView>
            </View>
        </SafeAreaView>
    )
}