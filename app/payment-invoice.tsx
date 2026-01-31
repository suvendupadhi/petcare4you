import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  DollarSign,
  Download,
  Mail,
  Printer,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock data - Replace with API call
const mockInvoices = [
  {
    id: "INV-001",
    appointmentId: "APT-123",
    customerName: "Sarah Johnson",
    petName: "Max",
    service: "Full Grooming Package",
    date: "2024-01-15",
    amount: 75.0,
    serviceFee: 7.5,
    total: 82.5,
    status: "paid",
    paidAt: "2024-01-15T14:30:00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-002",
    appointmentId: "APT-124",
    customerName: "Mike Chen",
    petName: "Luna",
    service: "Basic Bath & Brush",
    date: "2024-01-16",
    amount: 45.0,
    serviceFee: 4.5,
    total: 49.5,
    status: "pending",
    paymentMethod: null,
  },
  {
    id: "INV-003",
    appointmentId: "APT-125",
    customerName: "Emily Davis",
    petName: "Charlie",
    service: "Nail Trim & Ear Cleaning",
    date: "2024-01-14",
    amount: 30.0,
    serviceFee: 3.0,
    total: 33.0,
    status: "paid",
    paidAt: "2024-01-14T11:20:00",
    paymentMethod: "Cash",
  },
  {
    id: "INV-004",
    appointmentId: "APT-126",
    customerName: "John Smith",
    petName: "Bella",
    service: "Full Grooming Package",
    date: "2024-01-13",
    amount: 75.0,
    serviceFee: 7.5,
    total: 82.5,
    status: "failed",
    paymentMethod: "Credit Card",
  },
];

const mockStats = {
  totalRevenue: 247.5,
  pendingPayments: 49.5,
  paidThisMonth: 198.0,
  transactionCount: 3,
};

import { paymentService, Payment, userService, User } from "@/services/petCareService";

export default function PaymentInvoiceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Payment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    paidThisMonth: 0,
    transactionCount: 0,
  });
  const [filterStatus, setFilterStatus] = useState<
    "all" | "Paid" | "Pending" | "Failed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);

      const data = currentUser.userType === 'provider' 
        ? await paymentService.getProviderPayments()
        : await paymentService.getOwnerPayments();

      const totalRevenue = data
        .filter(p => p.status.toLowerCase() === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const pendingPayments = data
        .filter(p => p.status.toLowerCase() === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      setInvoices(data);
      setStats({
        totalRevenue,
        pendingPayments,
        paidThisMonth: totalRevenue, // Simplification
        transactionCount: data.length
      });
    } catch (error) {
      console.error('Error loading payment data:', error);
      if (Platform.OS === 'web') {
        window.alert("Failed to load payment data");
      } else {
        Alert.alert("Error", "Failed to load payment data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement PDF generation and download
    if (Platform.OS === 'web') {
      window.alert(`Downloading invoice ${invoiceId}...`);
    } else {
      Alert.alert("Download Invoice", `Downloading invoice ${invoiceId}...`);
    }
  };

  const handleEmailInvoice = (invoiceId: string, customerEmail: string) => {
    // TODO: Implement email invoice functionality
    if (Platform.OS === 'web') {
      window.alert(`Sending invoice ${invoiceId} to customer...`);
    } else {
      Alert.alert("Email Invoice", `Sending invoice ${invoiceId} to customer...`);
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    // TODO: Implement print functionality
    if (Platform.OS === 'web') {
      window.alert(`Preparing invoice ${invoiceId} for printing...`);
    } else {
      Alert.alert(
        "Print Invoice",
        `Preparing invoice ${invoiceId} for printing...`
      );
    }
  };

  const handleProcessPayment = (invoiceId: string) => {
    // TODO: Integrate payment gateway (Stripe, PayPal, etc.)
    if (Platform.OS === 'web') {
      if (window.confirm("Payment gateway integration required. This will connect to your payment processor. Continue?")) {
        console.log("Payment processing...");
      }
    } else {
      Alert.alert(
        "Process Payment",
        "Payment gateway integration required. This will connect to your payment processor.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => console.log("Payment processing..."),
          },
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-50";
      case "pending":
        return "bg-yellow-50";
      case "failed":
        return "bg-red-50";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return Clock;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      filterStatus === "all" || invoice.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      (user?.userType === 'provider' 
        ? invoice.appointment?.owner?.firstName.toLowerCase().includes(searchQuery.toLowerCase())
        : invoice.appointment?.provider?.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      invoice.id.toString().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="p-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-foreground">
                Payments & Invoices
              </Text>
              <Text className="text-sm text-muted-foreground">
                {user?.userType === 'provider' ? 'Manage your earnings' : 'View your payment history'}
              </Text>
            </View>
          </View>
          <ThemeToggle />
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <DollarSign className="text-green-600 mb-2" size={24} />
              <Text className="text-2xl font-bold text-foreground">
                ${stats.totalRevenue.toFixed(2)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {user?.userType === 'provider' ? 'Total Revenue' : 'Total Spent'}
              </Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <Clock className="text-yellow-600 mb-2" size={24} />
              <Text className="text-2xl font-bold text-foreground">
                ${stats.pendingPayments.toFixed(2)}
              </Text>
              <Text className="text-xs text-muted-foreground">Pending</Text>
            </View>
          </View>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <CheckCircle className="text-blue-600 mb-2" size={24} />
              <Text className="text-2xl font-bold text-foreground">
                ${stats.paidThisMonth.toFixed(2)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {user?.userType === 'provider' ? 'Paid This Month' : 'Spent This Month'}
              </Text>
            </View>
            <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
              <CreditCard className="text-purple-600 mb-2" size={24} />
              <Text className="text-2xl font-bold text-foreground">
                {stats.transactionCount}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Transactions
              </Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="px-6 mb-4">
          <View className="flex-row gap-2">
            {["all", "Paid", "Pending", "Failed"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-full ${
                  filterStatus === status ? "bg-primary" : "bg-secondary"
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    filterStatus === status
                      ? "text-primary-foreground"
                      : "text-secondary-foreground"
                  }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Invoice List */}
        <View className="px-6 gap-4">
          {filteredInvoices.length === 0 ? (
            <View className="items-center py-12">
              <DollarSign className="text-muted-foreground mb-4" size={48} />
              <Text className="text-lg font-semibold text-foreground">
                No Invoices Found
              </Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                {filterStatus === "all"
                  ? "You have no invoices yet."
                  : `No ${filterStatus} invoices.`}
              </Text>
            </View>
          ) : (
            filteredInvoices.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status);
              return (
                <View
                  key={invoice.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  {/* Status Banner */}
                  <View
                    className={`${getStatusBgColor(invoice.status)} px-4 py-2 flex-row items-center gap-2`}
                  >
                    <StatusIcon
                      className={getStatusColor(invoice.status)}
                      size={16}
                    />
                    <Text
                      className={`text-sm font-semibold capitalize ${getStatusColor(invoice.status)}`}
                    >
                      {invoice.status}
                    </Text>
                    <Text className="text-xs text-muted-foreground ml-auto">
                      {invoice.id}
                    </Text>
                  </View>

                  <View className="p-4">
                    {/* Customer/Provider Info */}
                    <View className="mb-3">
                      <Text className="text-lg font-bold text-foreground">
                        {user?.userType === 'provider' 
                          ? `${invoice.appointment?.owner?.firstName} ${invoice.appointment?.owner?.lastName}`
                          : invoice.appointment?.provider?.companyName}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Pet: {invoice.appointment?.petName}
                      </Text>
                    </View>

                    {/* Service & Date */}
                    <View className="mb-3">
                      <Text className="text-sm font-medium text-foreground">
                        {invoice.appointment?.petType} Service
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {new Date(invoice.paymentDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </View>

                    {/* Payment Breakdown */}
                    <View className="bg-muted rounded-xl p-3 mb-3">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-muted-foreground">
                          Service Amount
                        </Text>
                        <Text className="text-sm font-medium text-foreground">
                          ${(invoice.amount || 0).toFixed(2)}
                        </Text>
                      </View>
                      <View className="border-t border-border pt-2 flex-row justify-between">
                        <Text className="text-base font-bold text-foreground">
                          Total
                        </Text>
                        <Text className="text-base font-bold text-primary">
                          ${(invoice.amount || 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Payment Info */}
                    {invoice.status === "paid" && (
                      <View className="mb-3">
                        <Text className="text-xs text-green-600">
                          ✓ Paid on{" "}
                          {new Date(invoice.paidAt).toLocaleDateString()} via{" "}
                          {invoice.paymentMethod}
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                      {invoice.status === "pending" && (
                        <TouchableOpacity
                          onPress={() => handleProcessPayment(invoice.id)}
                          className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
                        >
                          <CreditCard
                            className="text-primary-foreground"
                            size={18}
                          />
                          <Text className="text-sm font-semibold text-primary-foreground">
                            Process Payment
                          </Text>
                        </TouchableOpacity>
                      )}

                      {invoice.status === "paid" && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleDownloadInvoice(invoice.id)}
                            className="flex-1 bg-secondary rounded-xl py-3 flex-row items-center justify-center gap-2"
                          >
                            <Download
                              className="text-secondary-foreground"
                              size={18}
                            />
                            <Text className="text-sm font-semibold text-secondary-foreground">
                              Download
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() =>
                              handleEmailInvoice(
                                invoice.id,
                                "customer@email.com"
                              )
                            }
                            className="bg-secondary rounded-xl p-3"
                          >
                            <Mail
                              className="text-secondary-foreground"
                              size={18}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handlePrintInvoice(invoice.id)}
                            className="bg-secondary rounded-xl p-3"
                          >
                            <Printer
                              className="text-secondary-foreground"
                              size={18}
                            />
                          </TouchableOpacity>
                        </>
                      )}

                      {invoice.status === "failed" && (
                        <TouchableOpacity
                          onPress={() => handleProcessPayment(invoice.id)}
                          className="flex-1 bg-red-600 rounded-xl py-3 flex-row items-center justify-center gap-2"
                        >
                          <CreditCard className="text-white" size={18} />
                          <Text className="text-sm font-semibold text-white">
                            Retry Payment
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Payment Gateway Info */}
        <View className="mx-6 mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <View className="flex-row items-start gap-3">
            <CreditCard className="text-blue-600 mt-1" size={20} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-900 mb-1">
                Payment Gateway Integration
              </Text>
              <Text className="text-xs text-blue-700">
                Connect your preferred payment processor (Stripe, PayPal,
                Square) to accept online payments securely.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}