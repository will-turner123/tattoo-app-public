import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Surface, Text, Chip, Card, Avatar, Subheading, Button,ActivityIndicator } from 'react-native-paper';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectProfile, getPostsByProfileId, updateProfileByUserId, updateProfile } from '../../state/selectors/profiles';
import { userState } from "../../state/atoms/user";
import { feedbackState } from "../../state/atoms/feedback";

import { ProfileRefresh } from './refresh';


const Tab = createMaterialTopTabNavigator();
const serverUrl = Constants.manifest.extra.SERVER_URL;


const PricingCard = (props) => {
    const { title, pricing } = props;
    return (
        <Surface style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: "flex-start",
            padding: 12,
            borderRadius: 6,
            margin: 6,
        }}
        >
            <Text variant="labelLarge">{title}</Text>
            <Text variant="bodyLarge">{pricing} USD 🇺🇸</Text>
        </Surface>
    );
}


const PostGridItem = ({ navigation, post, profileId }) => {
    console.log('starting postgriditem', post)
    
    const navigateToPost = () => {
        navigation.navigate('PostDetail', { postId: post.id, profileId: profileId })
    }

    return (
        <View style={{
            flex: 1/3, // divide the width into thirds
            aspectRatio: 1, // keep the aspect ratio 1:1
            // margin: 1
        }}>
            <TouchableOpacity
                onPress={navigateToPost}
            >
                <Image 
                    source={{uri: post.photoUrl}} 
                    style={{
                        // ...styles.hw100,
                        height: '100%',
                        width: '100%',
                        resizeMode: 'cover',
                    }}
                />
            </TouchableOpacity>
        </View>
    );
}

const PostGrid = ({ navigation, route }) => {
    const profileId = route.params?.profileId
    const [loading, setLoading] = useState(true);
    const posts = useRecoilValue(getPostsByProfileId(profileId)); // we're already using user id on frontend in chat
                                                                  // ought to be consistent

    useEffect(() => {
        if (posts) {
            setLoading(false);
        }
        else {
            console.log('couldnt find posts by profileid', profileId)
        }
    }, [posts, loading])

    return (
        <SafeAreaView style={{flex: 1}}>
            <View
                style={{
                    marginTop: 2,
                    height: '100%',
                    width: '100%',  
                }}
            >
                {loading ? <ActivityIndicator /> : (
                        <View style={{flex: 1}}>
                            <FlatList
                                data={posts}
                                keyExtractor={item => item.id.toString()}
                                nestedScrollEnabled={true}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <PostGridItem 
                                        post={item} 
                                        profileId={profileId} // should probs be userId
                                        navigation={navigation}
                                    />
                                )}
                                numColumns={3}
                                style={{flex: 1}}
                            />
                        </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const ProfileInfo = ({ navigation, route }) => {
    const profileId = route.params?.profileId;
    const profileUser = useRecoilValue(selectProfile(profileId));

    const user = useRecoilValue(userState);
    const setFeedback = useSetRecoilState(feedbackState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('useEffect profile info and they have ', profileUser.min_pricing, profileUser.hourly_pricing, 'pricing')
        if (profileUser) {
            setLoading(false);
        }
        else {
            console.log('couldnt find profile by id', profileId)
            setFeedback({ open: true, type: 'error', message: 'Could not find profile'})
            navigation.goback();
        }
    }, [profileUser])

    return (
        <View style={{
            flex: 1,
            // flexDirection: 'column',
            // justifyContent: 'center',
            // alignItems: 'center',
            padding: 4,
        }}>
            {loading ? <ActivityIndicator /> : (
                <>  
                    {(profileUser.tags.length > 0) && (
                        <>
                            <Text variant="headlineSmall">
                                Specalties
                            </Text>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                            }}>
                                {profileUser.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        style={{
                                            margin: 2,
                                        }}
                                    >
                                        {tag}
                                    </Chip>
                                )
                                )}
                            </View>
                        </>
                    )}
                    {(profileUser.hourly_pricing > 0 || profileUser.min_pricing > 0) && (
                        <View style={{
                            flex: 8,
                            flexDirection: 'column',
                        }}
                        >
                            <Text variant="headlineSmall">
                                Pricing
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                                {profileUser.hourly_pricing > 0 && (
                                    <PricingCard
                                        title="Hourly"
                                        pricing={profileUser.hourly_pricing}
                                    />
                                )}
                                {profileUser.min_pricing > 0 && (
                                    <PricingCard
                                        title="Minimum"
                                        pricing={profileUser.min_pricing}
                                    />
                                )}
                            </View>

                        </View>
                     )}

                     {(profileUser.socials.length > 0) && (
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                            }}
                        >
                            <Text variant="headlineSmall">
                                Socials
                            </Text>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                            }}>
                                {profileUser.socials.map((social, index) => (
                                    <Chip
                                        key={index}
                                        style={{
                                            margin: 2,
                                        }}
                                    >
                                        {social.social_name}
                                    </Chip>
                                )
                                )}
                            </View>
                        </View>
                     )}
                </>
                )}
        </View>
    )
}

export const Profile = ({ navigation, route }) => {
    const profileId = route.params?.profileId;

    const user = useRecoilValue(userState);
    const profileUser = useRecoilValue(selectProfile(profileId));
    const setProfileUser = useSetRecoilState(updateProfile(profileId));
    const setFeedback = useSetRecoilState(feedbackState);
    const [loading, setLoading] = useState(true);

    const messageUserHandler = () => {
        if ( user ) { // There is a bug where
            // if the user is not logged in, is redirected to login,
            // and then logs in and presses the message,
            // there is no back navigator for chat/no way to make
            // chatList appear. 
            // 
            // Also, if chat state has not been initialized,
            // this will break
            navigation.navigate('Chat', {
                screen: 'ActiveChat',
                params: { otherUserId: profileUser.user.id },
            });
        }
        else {
            setFeedback({open: true, message: 'You must be logged in to send a message', type: 'error'})
            navigation.navigate('Login')
        }
    };

    const saveUserHandler = async () => {
        if ( user ) { 
            const newSaved = !profileUser.saved;
            setProfileUser({...profileUser, saved: newSaved})
            const response = await axios.post(`${serverUrl}/api/profile/save/`, { profile_id: profileId, }, {
                headers: {
                    Authorization: `${user.token}`
                }, 
            })
            console.log('response from save user', response)
            if (response.status === 201) {
                const saved = response.data.saved;
                if (saved !== newSaved) setProfileUser({...profileUser, saved: saved});
            }
            else {
                setFeedback({open: true, message: 'Could not save user', type: 'error'})
            }
        }
        else {
            setFeedback({open: true, message: 'You must be logged in to save a user', type: 'error'})
            navigation.navigate('Login')
        }
    };
    

    useEffect(() => {
        if (profileUser) {
            setLoading(false);
        }
        else {
            setFeedback({open: true, message: 'Could not find profile', type: 'error'})
            navigation.goBack()
        }
    }, [profileUser])

    return (
        <ProfileRefresh
            profileId={profileId}
        >
            <Card style={{
                    flex: 1,
                }}
            >
                {!loading && (
                    <>
                        <Card.Title
                            title={<Text style={{fontWeight: 'bold'}}>{profileUser.user.username}</Text>}
                            subtitle={<Subheading>{profileUser.user.bio}</Subheading>}
                            left={(props) => <Avatar.Image {...props} size={50} source={{ uri: profileUser.user.photoUrl }} />}
                        />
                        <Card.Content style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 16,
                        }}>
                            <Button
                                icon="send"
                                mode="contained"
                                style={{flex: 1, marginHorizontal: 4}}
                                onPress={messageUserHandler}
                            >
                                Message
                            </Button>

                            <Button
                                icon="heart"
                                mode="contained"
                                style={{flex: 1, marginHorizontal: 4, color: profileUser.saved ? 'red' : 'black'}}
                                onPress={saveUserHandler}
                            >
                                {profileUser.saved ? "Saved" : "Save"}
                            </Button>
                        </Card.Content>

                        <View style={{ width: '100%', height: '100%'}}>
                            {loading ? <ActivityIndicator/> : (
                            <Tab.Navigator 
                                initialRouteName="Posts"
                                screenOptions={({ route }) => ({
                                    swipeEnabled: route.name !== 'Posts' // Disables swipes for first item in tab navigator to allow 
                                                                        // Smooth backswiping to previous screen
                                })}         
                            >
                                    <>
                                    <Tab.Screen 
                                        name="Posts"
                                        component={PostGrid}
                                        initialParams={{ profileId: profileId }}
                                        lazy={true}
                                    />
                                    <Tab.Screen
                                        name="Info"
                                        component={ProfileInfo}
                                        initialParams={{ profileId: profileId }}
                                        lazy={true}
                                    />
                                    </>
                            </Tab.Navigator>
                            )}
                        </View>
                    </>
                )}
            </Card>
        </ProfileRefresh>
    )
}