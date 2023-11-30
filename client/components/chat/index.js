import React, { useEffect, useState } from "react";
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
import { ActivityIndicator } from "react-native-paper";
import { useRecoilValue } from "recoil";
import { View } from "react-native";
import { ChatList } from "./chatList";
import { userState } from "../../state/atoms/user";
import { ActiveChat } from "./activeChat";


// This should be a separate, global component
const SplashScreen = () => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
            }}
        >
            <ActivityIndicator />
        </View>
    )
}


export const Chat = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const user = useRecoilValue(userState);

    useEffect(() => {
        if (user) {
            setLoading(false);
            navigation.navigate('ChatList')
        }
        else {
            navigation.navigate('Login')
        }

    }, [user])

    return (
        <Stack.Navigator initialRouteName="ChatList">
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen 
                name="ActiveChat" 
                component={ActiveChat}
            />
        </Stack.Navigator>
    )
}




