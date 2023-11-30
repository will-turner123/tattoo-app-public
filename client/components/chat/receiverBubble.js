import React from 'react'
import { View, Text } from 'react-native'


export const ReceiverBubble = (props) => {
    return (
        <View>
            <Text style={{
                backgroundColor: 'grey',
                color: 'white',
                padding: 10,
                borderRadius: 10,
                margin: 10,
                alignSelf: 'flex-start',
            }}>{props.message.text}</Text>
        </View>
    )
}