import { DefaultTheme, DarkTheme } from 'react-native-paper';
// probs better way to do this

const PrimaryColor = '#20C520';
const SecondaryColor = '#132C33';
const BackgroundColor = '#F5F5F5';
const SurfaceColor = '#FFFFFF';
const ErrorColor = '#D32F2F';
const OnPrimaryColor = '#FFFFFF';
const OnSecondaryColor = '#FFFFFF';
const OnBackgroundColor = '#000000';
const OnSurfaceColor = '#000000';
const OnErrorColor = '#FFFFFF';

const DarkPrimaryColor = '#388E3C';
const DarkSecondaryColor = '#00574B';
const DarkBackgroundColor = '#303030';
const DarkSurfaceColor = '#424242';
const DarkErrorColor = '#CF6679';
const DarkOnPrimaryColor = '#FFFFFF';
const DarkOnSecondaryColor = '#FFFFFF';
const DarkOnBackgroundColor = '#FFFFFF';
const DarkOnSurfaceColor = '#FFFFFF';
const DarkOnErrorColor = '#000000';

export const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: PrimaryColor,
    secondary: SecondaryColor,
    background: BackgroundColor,
    surface: SurfaceColor,
    error: ErrorColor,
    onPrimary: OnPrimaryColor,
    onSecondary: OnSecondaryColor,
    onBackground: OnBackgroundColor,
    onSurface: OnSurfaceColor,
    onError: OnErrorColor,
  },
  animation: {
    scale: 1.0,
  },
};

// export const darkTheme = {
//   ...DarkTheme,
//   roundness: 2,
//   colors: {
//     ...DarkTheme.colors,
//     primary: DarkPrimaryColor,
//     secondary: DarkSecondaryColor,
//     background: DarkBackgroundColor,
//     surface: DarkSurfaceColor,
//     error: DarkErrorColor,
//     onPrimary: DarkOnPrimaryColor,
//     onSecondary: DarkOnSecondaryColor,
//     onBackground: DarkOnBackgroundColor,
//     onSurface: DarkOnSurfaceColor,
//     onError: DarkOnErrorColor,
//   },
//   animation: {
//     scale: 1.0,
//   },
// };