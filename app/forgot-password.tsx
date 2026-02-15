import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PawPrint,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { authService } from "@/services/petCareService";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please enter your email');
      } else {
        Alert.alert("Error", "Please enter your email");
      }
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || "Something went wrong"}`);
      } else {
        Alert.alert("Error", error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 justify-center items-center">
          <View className="bg-primary/10 rounded-full p-6 mb-6">
            <Mail className="text-primary" size={48} />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center mb-4">
            Check your email
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-8 px-4">
            We've sent a password reset link to{" "}
            <Text className="font-semibold text-foreground">{email}</Text>. Please
            check your inbox and follow the instructions.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/reset-password", params: { email } })}
            className="w-full bg-primary rounded-xl py-4 items-center justify-center mb-4"
          >
            <Text className="text-primary-foreground font-bold text-base">
              I have a token / Next Step
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-full bg-secondary border border-border rounded-xl py-4 items-center justify-center"
          >
            <Text className="text-secondary-foreground font-bold text-base">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-6 pt-8 mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-8"
          >
            <ArrowLeft className="text-muted-foreground" size={20} />
            <Text className="text-muted-foreground font-medium">Back to Login</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 mb-8">
            <View className="bg-primary rounded-full p-3">
              <PawPrint className="text-primary-foreground" size={28} />
            </View>
            <View>
              <Text className="text-3xl font-bold text-foreground">PetCare</Text>
              <Text className="text-sm text-muted-foreground">Connect</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-2">
            Forgot Password?
          </Text>
          <Text className="text-base text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        <View className="px-6 gap-6">
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email Address
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
              <Mail className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-foreground text-base"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 ${
              loading ? "opacity-70" : ""
            }`}
          >
            <Text className="text-primary-foreground font-bold text-base">
              {loading ? "Sending..." : "Send Reset Link"}
            </Text>
            {!loading && (
              <ArrowRight className="text-primary-foreground" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
