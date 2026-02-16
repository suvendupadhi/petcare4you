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
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  PawPrint,
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { authService } from "@/services/petCareService";
import { USER_ROLE } from "@/constants/status";

export default function LoginScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState<"owner" | "provider">("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      
      const expectedRole = userType === "owner" ? USER_ROLE.OWNER : USER_ROLE.PROVIDER;
      
      if (result.roleId !== expectedRole) {
        const roleName = result.roleId === USER_ROLE.OWNER ? "owner" : "provider";
        if (Platform.OS === 'web') {
          window.alert(`Warning: Logging in as ${roleName} instead of ${userType}`);
        } else {
          Alert.alert("Warning", `Logging in as ${roleName} instead of ${userType}`);
        }
      }

      if (result.roleId === USER_ROLE.OWNER) {
        router.push("/owner-dashboard");
      } else {
        router.push("/provider-dashboard");
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(`Login Failed: ${error.message || "Invalid credentials"}`);
      } else {
        Alert.alert("Login Failed", error.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (userType === "owner") {
      router.push("/register-owner");
    } else {
      router.push("/register-provider");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="bg-primary rounded-full p-3">
              <PawPrint className="text-primary-foreground" size={28} />
            </View>
            <View>
              <Text className="text-3xl font-bold text-foreground">
                PetCare
              </Text>
              <Text className="text-sm text-muted-foreground">Connect</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <ThemeToggle />
          </View>
        </View>

        {/* Developer Menu Button */}
         <View className="px-6 mb-4">
          <TouchableOpacity
            onPress={() => router.push("/dev-menu")}
            className="bg-accent border-2 border-primary/30 rounded-xl py-3 px-4 items-center justify-center"
          >
            <Text className="text-accent-foreground font-bold text-sm">
              🚀 Developer Menu
            </Text>
            <Text className="text-xs text-muted-foreground">
              (View All Screens)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View className="px-6 mb-8">
          <Text className="text-2xl font-bold text-foreground mb-2">
            Welcome Back!
          </Text>
          <Text className="text-base text-muted-foreground">
            Sign in to manage your pet care services
          </Text>
        </View>

        {/* User Type Toggle */}
        <View className="px-6 mb-8">
          <Text className="text-sm font-semibold text-foreground mb-3">
            I am a:
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setUserType("owner")}
              className={`flex-1 rounded-2xl border-2 p-4 ${
                userType === "owner"
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              <View className="items-center">
                <User
                  className={
                    userType === "owner"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                  size={32}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    userType === "owner"
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  Pet Owner
                </Text>
                <Text
                  className={`text-xs text-center mt-1 ${
                    userType === "owner"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Book pet care services
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUserType("provider")}
              className={`flex-1 rounded-2xl border-2 p-4 ${
                userType === "provider"
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              <View className="items-center">
                <Building2
                  className={
                    userType === "provider"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                  size={32}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    userType === "provider"
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  Service Provider
                </Text>
                <Text
                  className={`text-xs text-center mt-1 ${
                    userType === "provider"
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Manage your business
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form */}
        <View className="px-6 gap-4">
          {/* Email Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email
            </Text>
            <View className={`flex-row items-center bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
              <Mail className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-foreground text-base"
              />
            </View>
            {errors.email && <Text className="text-destructive text-xs mt-1 ml-1">{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Password
            </Text>
            <View className={`flex-row items-center bg-card border ${errors.password ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
              <Lock className="text-muted-foreground mr-3" size={20} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="flex-1 text-foreground text-base"
              />
            </View>
            {errors.password && <Text className="text-destructive text-xs mt-1 ml-1">{errors.password}</Text>}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={() => router.push("/forgot-password")}
            className="self-end"
          >
            <Text className="text-sm font-semibold text-primary">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70' : ''}`}
          >
            <Text className="text-primary-foreground font-bold text-base">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
            {!loading && <ArrowRight className="text-primary-foreground" size={20} />}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted-foreground text-sm px-4">OR</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Register Section */}
          <View className="bg-muted rounded-xl p-6 items-center">
            <Text className="text-foreground font-semibold text-base mb-2">
              New to PetCare Connect?
            </Text>
            <Text className="text-muted-foreground text-sm text-center mb-4">
              {userType === "owner"
                ? "Create an account to book pet care services"
                : "Register your business and start accepting bookings"}
            </Text>
            <TouchableOpacity
              onPress={handleRegister}
              className="bg-secondary border-2 border-border rounded-xl py-3 px-8"
            >
              <Text className="text-secondary-foreground font-bold text-base">
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 mt-8">
          <Text className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
