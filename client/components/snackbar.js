import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { feedbackState } from '../state/atoms/feedback';
import { View } from 'react-native';
import { Snackbar as SnackbarElement } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

export const Snackbar = ({ children }) => {
    const [snackbar, setSnackbar] = useRecoilState(feedbackState);
    const [open, setOpen] = useState(false);
    const insets = useSafeAreaInsets()

    const screenHeight = Dimensions.get('window').height;
    const componentHeight = (screenHeight - insets.top) * 0.2;

    useEffect(() => {
        if (snackbar.open) {
            setOpen(true);
        }
    }, [snackbar, open]);

    const handleClose = () => {
        setOpen(false);
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <View
            style={{
                height: componentHeight,
                width: '100%',
                position: 'absolute',
                zIndex: 100,
            }}
            >
            <SnackbarElement
                // visible={open}
                visible={true}
                onDismiss={handleClose}
                action={{
                    label: 'Close',
                    onPress: () => {
                        handleClose();
                    },
                }}
            >
                {snackbar.message}
            </SnackbarElement>
            {children}
        </View>
    );
}