import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, SafeAreaView, FlatList } from 'react-native';
import { TextInput, Avatar, IconButton, Text } from 'react-native-paper';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState } from '../../state/atoms/user'; 
import { updatePostById } from '../../state/selectors/profiles';
import { feedbackState } from '../../state/atoms/feedback';

const serverUrl = Constants.manifest.extra.SERVER_URL;


const CommentItem = ({ comment }) => {

    return ( 
        <View style={{
            flexDirection: 'row',
            marginVertical: 10,
            alignItems: 'flex-start'
        }}
        >
            <Avatar.Image 
                size={48} 
                source={{ uri: comment.user.photoUrl }} 
            />
            <View style={{
                flexDirection: 'column',
                marginLeft: 10,
                flexShrink: 1,
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                >
                    <Text variant="bodyMedium" style={{fontWeight: 600}}>{comment.user.username}</Text>
                    {/* <Text variant="labelMedium">{comment.createdAt && comment.createdAt}</Text> */}
                </View>
                <Text variant="bodyMedium">{comment.text}</Text>
            </View>
        </View>
    )
}

const CommentInput = ({ profileId, post }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useRecoilValue(userState);
    const setFeedback = useSetRecoilState(feedbackState);
    const setPost = useSetRecoilState(updatePostById({profileId, postId: post.id}));

    const submitComment = async () => {
        if (!loading) {
            try {
                if (! user ) {
                    setFeedback({open: true, message: "You must be logged in to comment on posts"})
                    setLoading(false);
                    return;
                }
                if ( input.length == 0 ) {
                    return;
                }
                setLoading(true);

                const response = await axios.post(`${serverUrl}/api/post/comment/`, { postId: post.id, text: input }, {
                    headers: {
                        Authorization: `${user.token}`
                    },
                })

                const newComment = await response.data;
                if ( response.status == 201 ) {
                    console.log(post)
                    const newPost = {
                        ...post,
                        comments: [newComment, ...post.comments] // might need to swap the order here depending on how theyre sorted
                    }
                    setPost(newPost)
                    setInput('');

                }
                else {
                    setFeedback({open: true, message: `Could not comment on post: ${response.error.status.message}`})
                }
                
            } catch (error) {
                console.log('unexpected error when making comment', error)
                setFeedback({open: true, message: "Could not comment on post"})
            }
            finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
    }, [post.comments, user])

    return (
        <View 
        style={{
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingBottom: 4,
            paddingHorizontal: 8,
        }}
        >
            <TextInput
                placeholder="Add a comment..."
                value={input}
                onChangeText={setInput}
                style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: 'gray',
                    borderRadius: 4,
                    padding: 8,
                    marginRight: 8,
                }}
            />
            <IconButton
                title="Post"
                onPress={submitComment}
                disabled={loading}
                icon={"send"}
                mode="contained"
            />
        </View>
    )
}

export const CommentList = ({ profileId, post }) => {
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // update on comments
    }, [post.comments])

    return (
        <KeyboardAvoidingView 
            behavior="padding"
            style={{ flex: 1 }} 
            contentContainerStyle={{
                flex: 1,
            }}
            keyboardVerticalOffset={(insets.top + insets.bottom)*3}
        >
            <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', padding: 24, flexShrink: 0}}>

                    <View style={{ flexDirection: 'row', alignItems: 'stretch', marginVertical: 4, justifyContent: 'center', flex: 1  }}>
                        {post.comments.length === 0 ? <Text variant="headlineSmall">No comments yet...</Text> : (
                            <FlatList
                                data={post.comments}
                                nestedScrollEnabled={true}
                                renderItem={({ item }) => (
                                    <CommentItem comment={item} />
                                )}
                                keyExtractor={item => item.id}
                            />
                        )}
                    </View>
                    <CommentInput profileId={profileId} post={post} />
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}