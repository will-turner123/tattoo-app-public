import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Image } from 'react-native';
import { Card, Avatar, IconButton, ActivityIndicator, Text } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { feedbackState } from '../../state/atoms/feedback';
import { getPostById } from '../../state/selectors/profiles';
import { LikeButton } from './likeButton';
import { CommentList } from './comments';
import { ProfileRefresh } from './refresh';


export const PostDetail = ({ navigation, route }) => {
    const postId = route.params?.postId;
    const profileId = route.params?.profileId;
    const post = useRecoilValue(getPostById({ profileId, postId }));
    const setFeedback = useSetRecoilState(feedbackState);

    const [loading, setLoading] = useState(true);
    const snapPoints = useMemo(() => ['50%', '85%'], [])
    const commentBottomSheetRef = useRef();

    useEffect(() => {
        if (post) {
            setLoading(false);
        }
        else {
            setFeedback({ open: true, type: 'error', message: 'Could not find post'})
            navigation.goBack();
        }
    }, [post, loading]);

    const handlePresentModalPress = useCallback(() => {
        commentBottomSheetRef.current?.present();
    }, []);

    return (
        <BottomSheetModalProvider>
            <ProfileRefresh profileId={profileId}>
                    <Card 
                        mode="contained"
                        style={{ 
                            flex: 1,
                            }}
                        >
                        <Card.Title
                            title={post?.user.username || 'Loading...'}
                            titleStyle={{ fontWeight: 600, alignSelf: 'flex-start' }}
                            left={(props) => <Avatar.Image size={48} source={{uri: post.user?.photoUrl}} />}
                            style={{
                                flex: 1
                            }}
                        />
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                <View style={{
                                    flex: 2,
                                    height: 368,
                                }}>

                                        <Card.Cover
                                            source={{ uri: post.photoUrl }}
                                            style={{
                                                flex: 1,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </View>
                                <Card.Actions
                                    style={{
                                        paddingBottom: 1,
                                    }}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                    }}
                                    >
                                        <View 
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                            }}
                                        >
                                            <Text 
                                                variant="labelLarge"
                                            >
                                                {post.likes > 0 ? post.likes : "0"} likes
                                            </Text>
                                        </View>
                                        <View 
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <LikeButton post={post} profileId={profileId} />
                                            <IconButton
                                                icon="comment-outline"
                                                size={20}
                                                onPress={handlePresentModalPress}
                                            />
                                        </View>   
                                    </View>
                                </Card.Actions>
                                <Card.Content
                                    style={{
                                        flex: 1,
                                        marginBottom: 8,
                                    }}
                                >
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                    }}>
                                        <Text 
                                            variant="bodyMedium"
                                            style={{ fontWeight: 'bold' }}
                                        >
                                            {post.user.username} 
                                        </Text>
                                        <Text
                                            variant="bodyMedium"
                                        >
                                            {post.text}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </>
                        )}
                    </Card>
                    {/* {sheetOpen && ( */}

                <BottomSheetModal
                            ref={commentBottomSheetRef}
                            index={1}
                            snapPoints={snapPoints}
                            enablePanDownToClose={true}
                            // onDismiss={onDismiss} // think this breaks something
                        >
                            <CommentList post={post} profileId={profileId} />
                </BottomSheetModal>
            </ProfileRefresh>
        </BottomSheetModalProvider>
    );
};

