import { Alert } from "react-native";
import { stripeService } from "@/services/petCareService";
import Constants, { ExecutionEnvironment } from 'expo-constants';

let useStripe: any = null;
try {
  const StripeModule = require('@stripe/stripe-react-native');
  useStripe = StripeModule.useStripe;
} catch (e) {
  // Module not found
}

export const usePaymentGateway = () => {
  const stripe = useStripe ? useStripe() : null;
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const processPayment = async (paymentId: number, onSuccess: () => void) => {
    if (isExpoGo || !stripe) {
      Alert.alert(
        'Stripe Not Supported',
        'Stripe is not supported in Expo Go. Please use a development build to test payments on a physical device.'
      );
      return;
    }

    try {
      const { clientSecret } = await stripeService.createPaymentIntent(paymentId);

      const { error: initError } = await stripe.initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'PetCare Services',
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      const { error: presentError } = await stripe.presentPaymentSheet();

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
