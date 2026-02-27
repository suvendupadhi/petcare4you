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
  Lock,
  Key,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/petCareService";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || "");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!token.trim()) {
      newErrors.token = "Token is required";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = "Min 8 chars, 1 upper, 1 lower, 1 number, 1 special";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.resetPassword({ email, token, newPassword });
      setSuccess(true);
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || "Password reset failed"}`);
      } else {
        Alert.alert("Error", error.message || "Password reset failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 px-6 justify-center items-center">
          <View className="bg-green-100 rounded-full p-6 mb-6">
            <CheckCircle2 className="text-green-600" size={48} />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center mb-4">
            Password Reset!
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-8 px-4">
            Your password has been successfully reset. You can now log in with
            your new password.
          </Text>

          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="w-full bg-primary rounded-xl py-4 items-center justify-center"
          >
            <Text className="text-primary-foreground font-bold text-base">
              Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-8 mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-8"
          >
            <ArrowLeft className="text-muted-foreground" size={20} />
            <Text className="text-muted-foreground font-medium">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 mb-8">
            <View className="bg-primary rounded-full p-3">
              <PawPrint className="text-primary-foreground" size={28} />
            </View>
            <View>
              <Text className="text-3xl font-bold text-foreground">PetCare4You</Text>
              <Text className="text-sm text-muted-foreground">Connect</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-foreground mb-2">
            Reset Password
          </Text>
          <Text className="text-base text-muted-foreground">
            Create a new secure password for your account.
          </Text>
        </View>

        <View className="px-6 gap-4">
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="Confirm your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className={`bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 text-foreground text-base`}
            />
            {errors.email && <Text className="text-destructive text-xs mt-1 ml-1">{errors.email}</Text>}
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Reset Token
            </Text>
            <View className={`flex-row items-center bg-card border ${errors.token ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
              <Key className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={token}
                onChangeText={(text) => {
                  setToken(text);
                  if (errors.token) setErrors({ ...errors, token: '' });
                }}
                placeholder="Enter token from email"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-foreground text-base"
              />
            </View>
            {errors.token && <Text className="text-destructive text-xs mt-1 ml-1">{errors.token}</Text>}
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              New Password
            </Text>
            <View className={`flex-row items-center bg-card border ${errors.newPassword ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
              <Lock className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="flex-1 text-foreground text-base"
              />
            </View>
            {errors.newPassword && <Text className="text-destructive text-xs mt-1 ml-1">{errors.newPassword}</Text>}
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Confirm New Password
            </Text>
            <View className={`flex-row items-center bg-card border ${errors.confirmPassword ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
              <Lock className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="flex-1 text-foreground text-base"
              />
            </View>
            {errors.confirmPassword && <Text className="text-destructive text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 mt-4 ${
              loading ? "opacity-70" : ""
            }`}
          >
            <Text className="text-primary-foreground font-bold text-base">
              {loading ? "Resetting..." : "Reset Password"}
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
