import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, RefreshControl, SafeAreaView, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState } from '../../state/atoms/user';
import { selectProfile, updateProfile } from '../../state/selectors/profiles';

const serverUrl = Constants.manifest.extra.SERVER_URL;

export const getProfile = async (profileId, user=false) => {
    const config = {
        params: {"id": profileId},
    }
    user ? config.headers =  {Authorization: user.token} : null
    const response = await axios.get(`${serverUrl}/api/profile/`, config)

    const data = response.data;
    return data;
}

export const ProfileRefresh = ({profileId, navigation, children }) => {
    const profileUser = useRecoilValue(selectProfile(profileId));
    const setProfile = useSetRecoilState(updateProfile(profileId));
    const user = useRecoilValue(userState);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        try {
            const newProfileData = getProfile(profileId, user)
            setProfile(newProfileData);
        } catch (error) {
            setFeedback({open: true, message: 'Could not get profile', type: 'error'})
        }
        finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (profileUser) {
            setLoading(false);
        }
        else {
            console.log('couldnt find profile by id', profileId)
            setFeedback({open: true, message: 'Could not find profile', type: 'error'})
        }
    }, [profileUser])


    return (
        <SafeAreaView style={{flex: 1}}>
            {!loading && (
                <ScrollView
                    nestedScrollEnabled={true}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    style={{flex: 1}}
                >
                    <View 
                        style={{
                            flex: 1,
                            alignItems: 'stretch',
                            justifyContent: 'space-around',
                            height: '100%',
                            width: '100%',
                            minHeight: '100%',
                        }}
                        >
                        {children}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    )
}