import React from 'react'
import { View, Text } from 'react-native'

export const SenderBubble = (props) => {
    return (
        <View>
            <Text style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: 10,
                borderRadius: 10,
                margin: 10,
                alignSelf: 'flex-end',
            }}>{props.message.text}</Text>
        </View>
    )
}
