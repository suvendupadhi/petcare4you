import { Alert, Platform } from "react-native";

export const usePaymentGateway = () => {
  const processPayment = async (paymentId: number, onSuccess: () => void) => {
    if (Platform.OS === 'web') {
      // Mock for web or redirect to a Stripe checkout page
      if (window.confirm("Stripe Web integration required. In a real app, this would redirect to Stripe Checkout or use stripe-js. Mark as paid for testing?")) {
        Alert.alert('Success', 'Mock payment successful!');
        onSuccess();
      }
    }
  };

  return { processPayment };
};
