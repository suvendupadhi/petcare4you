import { Stack } from 'expo-router';
import '@/global.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeWrapper } from '@/components/StripeWrapper';
import { DismissKeyboard } from '@/components/DismissKeyboard';
import { cssInterop } from 'react-native-css-interop';
import * as Icons from 'lucide-react-native';

// Register Lucide icons with NativeWind/CSS Interop
Object.keys(Icons).forEach((key) => {
  const Icon = (Icons as any)[key];
  if (Icon && typeof Icon === 'function') {
    cssInterop(Icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          size: true,
        },
      },
    });
  }
});

export default function RootLayout() {
  return (
    <StripeWrapper>
      <ThemeProvider>
        <SafeAreaProvider>
          <DismissKeyboard>
            <Stack screenOptions={{ headerShown: false }} />
          </DismissKeyboard>
        </SafeAreaProvider>
      </ThemeProvider>
    </StripeWrapper>
  );
}
