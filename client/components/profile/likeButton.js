import React, { useState, useEffect } from 'react';
import { IconButton } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import axios from 'axios';
import Constants from 'expo-constants';
import { userState } from '../../state/atoms/user';
import { feedbackState } from '../../state/atoms/feedback';
import { updatePostById } from '../../state/selectors/profiles';

const serverUrl = Constants.manifest.extra.SERVER_URL;

export const LikeButton = ({ post, profileId }) => {
    const user = useRecoilValue(userState);
    const setPost = useSetRecoilState(updatePostById({ profileId, postId: post.id }));
    const setFeedback = useSetRecoilState(feedbackState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // update component if isLiked changes
    }, [post.isLiked])

    const likePost = async () => {
        if (! loading ) {
            const mockData = {isLiked: !post.isLiked, likes: post.likes + (post.isLiked ? -1 : 1)}

            if ( ! user ) {
                setFeedback({ open: true, type: 'error', message: 'You must be logged in to like a post'})
                setLoading(false);
                return;
            }
            setPost(mockData); // should revisit and rely on local state for whether or not its liked to make it faster

            try {
                const response = await axios.post(`${serverUrl}/api/post/like/`, { postId: post.id }, {
                    headers: {
                        Authorization: `${user.token}`
                    },
                })
                
                const likes = response.data.likes;
                const liked = response.data.isLiked;            
                if ( mockData.isLiked !== liked || mockData.likes !== likes ) {
                    setPost({ isLiked: liked, likes: likes });
                }
            }
            catch (error) {
                setPost({ isLiked: !post.isLiked, likes: post.likes + (post.isLiked ? -1 : 1) }); // revert to previous state
                const likePlaceholder = post.isLiked ? 'unlike' : 'like';
                setFeedback({ open: true, type: 'error', message: `Could not ${likePlaceholder} post`});
            }
            finally {
                setLoading(false);
            }
        }
    
    }

    return (
        <IconButton
            icon={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            iconColor={post.isLiked ? 'red' : 'black'}
            disabled={loading}
            onPress={likePost}
        />
    )
}
