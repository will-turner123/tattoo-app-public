import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native-paper';

export const MessageInput = ({sendMessage, loading}) => {
    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = () => {
        sendMessage(messageInput);
        setMessageInput('');

    }

    useEffect(() => {

    }, ([messageInput]))

    return (
        <TextInput
            label="Message"
            value={messageInput}
            onChangeText={text => setMessageInput(text)}
            right={
                <TextInput.Icon
                    name="send"
                    icon={loading ? 'loading' : 'send'}
                    onPress={() => handleSendMessage()} 
                    disabled={messageInput.length === 0 || loading}
                />
            }
            style={{
                backgroundColor: 'white',
                width: '100%'
            }}
        />
    );
};

