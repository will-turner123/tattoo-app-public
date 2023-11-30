import React, { useState, useEffect } from "react";
import { Avatar, Card, TextInput, Button, Text } from "react-native-paper";
import { View } from "react-native";
import { userState } from "../state/atoms/user";
import { useRecoilState } from "recoil";
import { styles } from "./styles";

export const Account = ({navigation, route}) => {
    const [user, setUser] = useRecoilState(userState);
    const [loading, setLoading] = useState(true);
    // const [profileUser, setProfileUser] = useState(false);

    const logout = () => {
        setUser(false);
    }

    useEffect(() => {
        console.log('useEffect user', user)
        if ( route.params?.user ) {
            if ( route.params.user.id == user.id) {
                setProfileUser(user)
                setLoading(false);
            } else {
                
            }


            setUser(route.params.user);
        }
    }, [user])

    return (
        <View style={styles.container}>
            <Card>
                <Card.Content>
                    <Avatar.Image size={24} source={{ uri: user.photoUrl }} />
                    <Text>{user.username}</Text>
                    <Text>{user.email}</Text>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={logout}>Logout</Button>
                </Card.Actions>
            </Card>
        </View>
    )
}