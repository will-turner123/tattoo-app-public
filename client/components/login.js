import React, { useState, useContext, useEffect } from "react";
import { Card, TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import { StyleSheet, View } from "react-native";
import Constants from 'expo-constants';
import { userState } from '../state/atoms/user';
import { feedbackState } from '../state/atoms/feedback'
import { useRecoilState } from 'recoil';
import { styles } from './styles';

const serverUrl = Constants.manifest.extra.SERVER_URL;


export const Login = ({ navigation }) => {
    // const { theme } = useTheme();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useRecoilState(userState);
    const [feedback, setFeedback] = useRecoilState(feedbackState);

    useEffect(() => {
        console.log('useEffect user', user)
    }, [user])


    const loginUser = async () => {
        try {
            const response = await axios.post(`${serverUrl}/auth/login/`, {
                    username: username,
                    password: password,
            })
            if ( response.status == 200 ) {
                const data = response.data;

                console.log('data', data)
    
                setUser({
                    token: data.token,
                    username: data.username,
                    email: data.email,
                    photoUrl: data.photoUrl,
                });
            }
          } catch (error) {

            if ( error.response?.data ) {
                console.log('opening feedback')
                setFeedback({
                    type: 'error',
                    message: error.response.data.error,
                    open: true,
                })
            } else {

                console.error('Login failed:', error);
            }
            }
        }

    const debugFill = () => {
        setUsername('test')
        setPassword('securepassword')
    }

    return (
        <View>
            <Card>
                <Card.Title title="Login" titleStyle={styles.title} />
                    <Card.Content>
                        <TextInput
                            label="Username"
                            name="username"
                            type="text"
                            onChangeText={setUsername}
                            value={username}
                            style={styles.input}
                        />
                        <TextInput
                            label="Password"
                            name="password"
                            type="password"
                            onChangeText={setPassword}
                            value={password}
                            style={styles.input}
                        />
                    </Card.Content>
                <Card.Actions style={styles.actions}>
                        <Button onPress={loginUser} mode="contained" style={styles.button}>
                            Login
                        </Button>
                        <Button onPress={debugFill} style={styles.button}>
                            Debug
                        </Button>
                </Card.Actions>
            </Card>
        </View>
    )
}
