import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const StripeWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StripeProvider publishableKey="pk_test_your_key_here">
      {children}
    </StripeProvider>
  );
};
