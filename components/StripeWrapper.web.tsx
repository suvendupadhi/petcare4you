import React from 'react';

// Stripe React Native doesn't support Web. 
// For a production web app, you would use @stripe/stripe-js here.
export const StripeWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
