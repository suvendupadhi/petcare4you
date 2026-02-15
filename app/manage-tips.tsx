import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check, Info, Lightbulb } from 'lucide-react-native';
import { tipService, serviceTypeService, Tip, ServiceType } from '@/services/petCareService';

export default function ManageTipsScreen() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [formData, setFormData] = useState<Partial<Tip>>({
    title: '',
    content: '',
    serviceTypeId: undefined,
    userRoleId: undefined,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tipsData, serviceTypesData] = await Promise.all([
        tipService.getTips(undefined, true),
        serviceTypeService.getServiceTypes()
      ]);
      setTips(tipsData);
      setServiceTypes(serviceTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tip: Tip | null = null) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        title: tip.title,
        content: tip.content,
        serviceTypeId: tip.serviceTypeId,
        userRoleId: tip.userRoleId,
        isActive: tip.isActive
      });
    } else {
      setEditingTip(null);
      setFormData({
        title: '',
        content: '',
        serviceTypeId: undefined,
        userRoleId: undefined,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      if (Platform.OS === 'web') window.alert('Title and Content are required');
      else Alert.alert('Error', 'Title and Content are required');
      return;
    }

    try {
      if (editingTip) {
        await tipService.updateTip(editingTip.id, formData);
      } else {
        await tipService.createTip(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving tip:', error);
      if (Platform.OS === 'web') window.alert('Failed to save tip');
      else Alert.alert('Error', 'Failed to save tip');
    }
  };

  const handleDelete = async (id: number) => {
    const performDelete = async () => {
      try {
        await tipService.deleteTip(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting tip:', error);
        if (Platform.OS === 'web') window.alert('Failed to delete tip');
        else Alert.alert('Error', 'Failed to delete tip');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this tip?')) performDelete();
    } else {
      Alert.alert('Delete Tip', 'Are you sure you want to delete this tip?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6 flex-row items-center justify-between border-b border-border">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Manage Tips</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleOpenModal()}
          className="bg-primary p-2 rounded-full"
        >
          <Plus className="text-primary-foreground" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {loading ? (
          <View className="py-10 items-center">
            <Text className="text-muted-foreground">Loading tips...</Text>
          </View>
        ) : (
          <View className="gap-4 pb-10">
            {tips.map((tip) => (
              <View 
                key={tip.id} 
                className={`bg-card rounded-2xl border border-border p-4 ${!tip.isActive ? 'opacity-60' : ''}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row flex-wrap gap-2">
                    <View className="bg-primary/10 px-2 py-1 rounded-md">
                      <Text className="text-primary text-[10px] font-bold uppercase">
                        {serviceTypes.find(st => st.id === tip.serviceTypeId)?.name || 'General'}
                      </Text>
                    </View>
                    {tip.userRoleId && (
                      <View className="bg-accent px-2 py-1 rounded-md">
                        <Text className="text-accent-foreground text-[10px] font-bold uppercase">
                          {tip.userRoleId === 1 ? 'Owner' : 'Provider'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleOpenModal(tip)}>
                      <Edit2 className="text-muted-foreground" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(tip.id)}>
                      <Trash2 className="text-destructive" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-foreground font-bold text-base mb-1">{tip.title}</Text>
                <Text className="text-muted-foreground text-sm leading-5" numberOfLines={3}>
                  {tip.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Tip Editor Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">
                {editingTip ? 'Edit Tip' : 'New Tip'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X className="text-muted-foreground" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Title</Text>
                <TextInput
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter tip title"
                  placeholderTextColor="#9CA3AF"
                  className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
                />
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Content</Text>
                <TextInput
                  value={formData.content}
                  onChangeText={(text) => setFormData({ ...formData, content: text })}
                  placeholder="Enter tip content"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base h-32"
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-2">Target Role</Text>
                  <View className="bg-card border border-border rounded-xl overflow-hidden h-12 justify-center">
                    {/* Simplified selection for mobile demo */}
                    <TouchableOpacity 
                      className="px-4"
                      onPress={() => {
                        const roles = [undefined, 1, 2];
                        const currentIndex = roles.indexOf(formData.userRoleId);
                        const nextIndex = (currentIndex + 1) % roles.length;
                        setFormData({ ...formData, userRoleId: roles[nextIndex] });
                      }}
                    >
                      <Text className="text-foreground">
                        {formData.userRoleId === 1 ? 'Owners' : formData.userRoleId === 2 ? 'Providers' : 'All Roles'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground mb-2">Service Type</Text>
                  <View className="bg-card border border-border rounded-xl overflow-hidden h-12 justify-center">
                    <TouchableOpacity 
                      className="px-4"
                      onPress={() => {
                        const types = [undefined, ...serviceTypes.map(s => s.id)];
                        const currentIndex = types.indexOf(formData.serviceTypeId);
                        const nextIndex = (currentIndex + 1) % types.length;
                        setFormData({ ...formData, serviceTypeId: types[nextIndex] });
                      }}
                    >
                      <Text className="text-foreground" numberOfLines={1}>
                        {serviceTypes.find(s => s.id === formData.serviceTypeId)?.name || 'General'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-semibold text-foreground">Visible to users</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                />
              </View>

              <TouchableOpacity
                onPress={handleSave}
                className="bg-primary rounded-xl py-4 items-center justify-center mt-6"
              >
                <Text className="text-primary-foreground font-bold text-base">
                  {editingTip ? 'Update Tip' : 'Create Tip'}
                </Text>
              </TouchableOpacity>
              
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
