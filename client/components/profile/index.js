import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View, ActivityIndicator } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { selectProfile, updateProfile } from '../../state/selectors/profiles';
import { userState } from "../../state/atoms/user";
import { feedbackState } from '../../state/atoms/feedback';

import axios from 'axios';
import Constants from 'expo-constants';

import { Profile } from './profile';
import { PostDetail } from './post';
import { getProfile } from './refresh';


const Stack = createStackNavigator();



// the "entry point" for profile stuff
export const ProfileNavigation = ({ navigation, route }) => {
    const profileId = route.params?.id;
    const profileUser = useRecoilValue(selectProfile(profileId));
    const setFeedback = useSetRecoilState(feedbackState);
    const user = useRecoilValue(userState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ( profileId ) {
            if ( profileUser ) {
                setLoading(false);
            }
            else {
                setFeedback({message: 'Unknown error', open: true})
                console.log('no info')
                const data = getProfile(profileId, user);
                // this shouldn't ever happen and should be handled by profile refresh
            }
        }
        else {
            setFeedback({open: true, message: 'No artist ID provided', type: 'error'})
            navigation.goback()
        }
    }, [user, profileId, profileUser])


    return (
            <View style={{flex: 1}}>
                {loading ? <ActivityIndicator/> : (
                    <Stack.Navigator 
                        initialRouteName="Profile" 
                    >
                        <Stack.Screen
                            name="Profile"
                            component={Profile}
                            initialParams={{ profileId: profileId }}
                        />
                        <Stack.Screen
                            name="PostDetail"
                            component={PostDetail}
                            lazy={true}
                        />
                    </Stack.Navigator>
                )}
            </View>
    )
}