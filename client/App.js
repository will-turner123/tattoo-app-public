import 'react-native-gesture-handler';
import * as React from 'react';
import theme from './components/theme';
import { PaperProvider } from 'react-native-paper';
import { Routes } from './routes';
import { RecoilRoot } from 'recoil';



export default function App() {
  // const theme = useTheme();

  return (
    <RecoilRoot>
        <PaperProvider theme={theme}>
          <Routes/>
        </PaperProvider>
    </RecoilRoot>
  );
}
