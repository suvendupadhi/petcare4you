import React from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';

let StripeProvider: any = null;
try {
  const StripeModule = require('@stripe/stripe-react-native');
  StripeProvider = StripeModule.StripeProvider;
} catch (e) {
  // Module not found or failed to load
}

export const StripeWrapper = ({ children }: { children: React.ReactNode }) => {
  // Stripe React Native is not supported in Expo Go.
  // We check if we are in Expo Go and bypass the provider to avoid crashes.
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGo || !StripeProvider) {
    return <>{children}</>;
  }

  return (
    <StripeProvider publishableKey="pk_test_your_key_here">
      {children}
    </StripeProvider>
  );
};
