import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, LatLng } from 'react-native-maps';
import { View, TouchableOpacity } from 'react-native';
import { Searchbar as PaperSearchbar, IconButton, Avatar, Card, TextInput, Button, Text, useTheme, List, ActivityIndicator } from "react-native-paper";
import { safeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomSheet from "@gorhom/bottom-sheet";
import axios from 'axios';
import { feedbackState } from '../state/atoms/feedback';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ProfileNavigation } from './profile';
import { createStackNavigator } from '@react-navigation/stack';
import { profileState } from '../state/atoms/profiles';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';


const serverUrl = Constants.manifest.extra.SERVER_URL;

const Stack = createStackNavigator();

const Searchbar = ({ navigation, setCity, setLocation, getArtistsInRegion, city, searchQuery, setSearchQuery }) => {
    const mapApiKey = Constants.manifest.extra.MAP_API_KEY;
    const ref = useRef();
    const onChangeSearch = (query) => { 
        setSearchQuery(query) 
    }

    const searchCity = async (description) => {
        if (description === '') return;
        setCity(searchQuery);
        const location = await Location.geocodeAsync(description);
        await AsyncStorage.setItem('city', description);
        await AsyncStorage.setItem('location', JSON.stringify(location[0]));
        if (location.length > 0) setLocation(location[0]);
        setCity(description);
        setSearchQuery(description);
        
    }

    // autocomplete = https://github.com/FaridSafi/react-native-google-places-autocomplete
    
    return (
        <View 
            style={{
                position: 'absolute', 
                top: '5%',
                width: '100%',
                padding: 10,
                zIndex: 1
            }}
        >
            <GooglePlacesAutocomplete
                const ref={ref}
                placeholder='Search'
                minLength={2}
                enablePoweredByContainer={false}
                debounce={500}
                // keyboardShouldPersistTaps='never'
                onPress={(data, details = null) => {
                    console.log('we were pressed', data)

                    let place = data.description
                    console.log('setting search query to', place);
                    console.log('searchQuery', searchQuery)
                    searchCity(place);
                }}
                
                query={{
                    key: mapApiKey,
                    language: 'en',
                    types: '(cities)',
                }}

                textInputProps={{
                    InputComp: PaperSearchbar,
                    placeholder: "Search for a city",
                    onChangeText: onChangeSearch,
                    value: searchQuery,
                    style: {flex: 1, width: '100%'},
                }}
            />
        </View>
    );
}

const MapPage = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [city, setCity] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [artists, setArtists] = useRecoilState(profileState);
    const snapPoints = useMemo(() => ['12.5%', '25%', '50%', '85%'], []);
    const setFeedback = useSetRecoilState(feedbackState);
    const bottomsheetRef = useRef();

    const handleSheetChanges = useCallback((index) => {
        if ( index === 3 ) {
            // should animate background color of searchbar
        }
    }, []);

    const [currentPosition, setCurrentPosition] = useState({
         region: {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.4,
            longitudeDelta: 0.3,
         } 
    })

    const clearArtists = () => {
        setArtists([]);
    }

    const clearAsyncStorage = async () => {
        console.log('clearing storage')
        try {
            AsyncStorage.clear();
        }
        catch (err) {
            console.log('error clearing storage. does it exist?', err)
        }
    }


    const insets = useSafeAreaInsets()

    useEffect(() => {
        const getCity = (async () => {
            try {
                let city = await AsyncStorage.getItem('city');
                let location = await AsyncStorage.getItem('location');
        
                if (city === null || location === null) {
                    console.log('making sure we have permission to use location')
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    
                    // thinking we have an onboarding screen that asks for location permission
                    if (status !== 'granted') {
                        setFeedback({open: true, message: 'Permission to access location was denied', type: 'error'})
                        return;
                    }
    
                    // get last known position (less accurate but faster)
                    location = await Location.getLastKnownPositionAsync({});
                    console.log('users location is ', location)
                    // bad code rn with location and setcurrentposition
    
                    const reverseGeocodedLocation = await Location.reverseGeocodeAsync(location.coords);
                    console.log('reverse geocoded location', reverseGeocodedLocation)
                    city = reverseGeocodedLocation[0].city; // should consider cities with the same name. ought to use city & state
                    console.log('city', city)

                    await AsyncStorage.setItem('city', city);
                    await AsyncStorage.setItem('location', JSON.stringify({latitude: location.coords.latitude, longitude: location.coords.longitude}));
                }
                else {
                    console.log('city and location already exist in storage')
                    location = JSON.parse(location);
                }

                setLocation(location);
                setCity(city);

                setCurrentPosition({ region: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.4,
                    longitudeDelta: 0.3,
                }})
                console.log('set city & location to storage', city, location)
            }
            catch (err) {
                console.log('error getting city from storage', err)
            }
        })

        const fetchLocationAndArtists = (async () => {
            setLoading(true);
            getArtistsInRegion();
            setCurrentPosition({ region: {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.4,
                longitudeDelta: 0.3,
            }})
            setLoading(false);
        })

        if (city === null || location === null) {
            getCity();
        }
        else {
            // getCity updates city/location causing this to be updated on re-render
            // also, search just simply has to be updated on re-render
            fetchLocationAndArtists();
        }
        setSearchQuery(city);
    }, [city, location])



    const navigateToProfile = (artistId) => {
        // navigation.navigate('OtherUserProfile', { id: artistId })
        navigation.navigate('ProfileNavigation', { id: artistId })
    }

    const getArtistsInRegion = async () => {
        const url = `${serverUrl}/api/search`;

        try {
            const response = await axios.get(url, {
                params: {
                    city: city,
                },
            });
    
            const updatedArtists = response.data;
            const artistMap = new Map();

            for (const artist of artists) {
                artistMap.set(artist.id, artist);
            }

            for (const artist of updatedArtists) {
                artistMap.set(artist.id, artist);
            }

            setArtists(Array.from(artistMap.values()));
        } catch (err) {
            let message = "Something went wrong. Please try refreshing";
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else {
                console.error('getting artists error', err);
            }
            setFeedback({ open: true, message: message });
        }
    }


    return (
        <View 
            style={{
                height: "100%",
                width: "100%",
            }}
        >
        <Searchbar
            navigation={navigation}
            setCity={setCity}
            setLocation={setLocation}
            getArtistsInRegion={getArtistsInRegion}
            city={city}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
        />
            <MapView
                region={currentPosition.region}
                provider={PROVIDER_GOOGLE}
                style={{ 
                    height: "100%", 
                    width: "100%",
                    marginBottom: insets.bottom*2,
                }}
            >
                <>
                {!loading && artists.filter(artist => artist.city === city).map(artist => (
                    <Marker
                        key={artist.id}
                        coordinate={{latitude: artist.lat, longitude: artist.long}}
                        title={artist.user.username}
                    />
                    )
                )}
                </>
            </MapView>
            <BottomSheet
                ref={bottomsheetRef}
                index={1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
            >
                <View style={{height: "100%", width: "100%", backgroundColor: "white"}}>
                        <>
                        {loading && artists ? (
                            <ActivityIndicator animating={true} />
                        ) : (
                            artists.filter(artist => artist.city === city).map((artist) => (
                                <TouchableOpacity
                                    key={artist.id}
                                    onPress={() => navigateToProfile(artist.id)}
                                >
                                    <List.Item
                                        title={artist.user.username}
                                        description={artist.user.bio}
                                        left={props => <Avatar.Image {...props} source={{uri: artist.user.photoUrl}} />}
                                    />
                                </TouchableOpacity>
                            ))
                        )}

                            <Button onPress={() => getArtistsInRegion()}>Refresh tmp debug</Button>
                            <Button onPress={() => clearAsyncStorage()}>Clear AsyncStorage</Button>
                            <Button onPress={() => clearArtists()}>Clear Artists</Button>
                        </>
                </View>
            </BottomSheet>
        </View>
    )

}



export const MapRoute = () => {
    return (
        <Stack.Navigator initialRouteName="MapPage">
            <Stack.Screen 
                name="MapPage" 
                component={MapPage} 
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen 
                name="ProfileNavigation"
                component={ProfileNavigation}
                lazy={true} 
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    )
}