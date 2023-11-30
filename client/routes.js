import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Login } from './components/login';
import { Account } from './components/account';
import { MapRoute } from './components/map';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecoilValue } from 'recoil';
import { userState } from './state/atoms/user';
import { feedbackState } from './state/atoms/feedback';
import { Snackbar } from './components/snackbar';
import { Chat } from './components/chat';
import { SafeAreaView } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator();



const SplashScreen = () => {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

const Homescreen = ({ navigation }) => {
    return (
      <View>
        <Text>This is the home screen</Text>
      </View>
    )
  }
  
  const Otherscreen = () => {
    return (
      <View>
        <Text>This is the other screen</Text>
      </View>
    )
  }
  

export const Routes = (props) => {
    const [loading, setLoading] = useState(true);
    const user = useRecoilValue(userState) // defaulst to false
    const feedback = useRecoilValue(feedbackState);


    return (
      <>
      { feedback.open && (<Snackbar/> ) }
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Map">
            <Tab.Screen 
              name="Map" 
              component={MapRoute}
              
              options={{
                tabBarLabel: 'Map',
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="map" color={color} size={26} />
                ),
                headerShown: false,
              }}
            />
            { user ? (
              <>
                <Tab.Screen
                    name="Account"
                    component={Account}
                    options={{
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" color={color} size={26} />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Chat"
                    component={Chat}
                    options={{
                        tabBarLabel: 'Chat',
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account" color={color} size={26} />
                        ),
                    }}
                />
              </>
            ) : (
            <Tab.Screen
              name="Login"
              component={Login}
              headerShown={false}
              options={{
                tabBarLabel: 'Login',
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="login" color={color} size={26} />
                ),
              }}
            />
            ) 
            }
          </Tab.Navigator>
        </NavigationContainer>
    </>
    );
};