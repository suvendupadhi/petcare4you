import { useStripe } from "@stripe/stripe-react-native";
import { Alert } from "react-native";
import { stripeService } from "@/services/petCareService";

export const usePaymentGateway = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const processPayment = async (paymentId: number, onSuccess: () => void) => {
    try {
      const { clientSecret } = await stripeService.createPaymentIntent(paymentId);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'PetCare Services',
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Error', presentError.message);
        }
      } else {
        Alert.alert('Success', 'Your payment was successful!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment');
    }
  };

  return { processPayment };
};
