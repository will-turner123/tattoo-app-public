import { StyleSheet } from 'react-native';
import { theme }  from './theme';


// sample / demo global styles
export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      margin: 10,
      padding: 10,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.onSurface,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    title: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    subtitle: {
      color: theme.colors.secondary,
      fontSize: 16,
    },
    button: {
      marginTop: 10,
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      color: theme.colors.onPrimary,
    },
  });