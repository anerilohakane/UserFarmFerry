import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Languages,
  Lock, LogOut,
  MapPin,
  MessageSquare,
  Package,
  Shield,
  ShoppingCart,
  Star,
  User,
  Zap
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

const shadowStyle = {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  elevation: 2, // Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
};

const SettingScreen = () => {
  const navigation = useNavigation();
  // State for toggles
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoNotify, setPromoNotify] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState(false);
  const [language, setLanguage] = useState('English');
  const [scheduledDelivery, setScheduledDelivery] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Account/Profile Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Account & Profile</Text>
          <TouchableOpacity
            onPress={() => {/* navigation to profile editing */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={20} color="#34d399" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Edit Profile</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigation to address manager */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={20} color="#2563eb" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Delivery Addresses</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigation to wishlist/favorites */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Heart size={20} color="#f43f5e" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Wishlist</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Orders and Shopping Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Orders & Shopping</Text>
          <TouchableOpacity
            onPress={() => {/* navigation to order history */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShoppingCart size={20} color="#f59e42" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Order History</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigation to scheduled deliveries */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={20} color="#7c3aed" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Scheduled Deliveries</Text>
            </View>
            <Switch
              value={scheduledDelivery}
              onValueChange={setScheduledDelivery}
              trackColor={{ false: '#d1d5db', true: '#34d399' }}
              thumbColor={scheduledDelivery ? '#fff' : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigation to track orders */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Package size={20} color="#34d399" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Track Orders</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Notifications</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Bell size={20} color="#0ea5e9" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Enable Notifications</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={notificationEnabled ? '#fff' : '#fff'}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock size={20} color="#16a34a" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Order Updates</Text>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{ false: '#d1d5db', true: '#16a34a' }}
              thumbColor={orderUpdates ? '#fff' : '#fff'}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Gift size={20} color="#f59e42" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Promotions & Offers</Text>
            </View>
            <Switch
              value={promoNotify}
              onValueChange={setPromoNotify}
              trackColor={{ false: '#d1d5db', true: '#f59e42' }}
              thumbColor={promoNotify ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Payment and Wallet Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Payments & Savings</Text>
          <TouchableOpacity
            onPress={() => {/* navigate to payment methods */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CreditCard size={20} color="#9333ea" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Payment Methods</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigate to wallet/transactions */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DollarSign size={20} color="#34d399" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Wallet & Transactions</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigate to loyalty program */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Star size={20} color="#fde68a" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Coupons & Rewards</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Preferences Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>App Settings</Text>
          <TouchableOpacity
            onPress={() => {/* navigation to change language */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Languages size={20} color="#f59e42" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Language</Text>
            </View>
            <Text style={{ color: '#6b7280' }}>{language}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Zap size={20} color="#f59e42" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Enable Voice Search</Text>
            </View>
            <Switch
              value={voiceSearch}
              onValueChange={setVoiceSearch}
              trackColor={{ false: '#d1d5db', true: '#f59e42' }}
              thumbColor={voiceSearch ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Security & Privacy Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Security & Privacy</Text>
          <TouchableOpacity
            onPress={() => {/* navigation to change password */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Lock size={20} color="#dc2626" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Change Password</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={20} color="#6366f1" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Enable Biometrics</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#d1d5db', true: '#6366f1' }}
              thumbColor={biometrics ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={shadowStyle}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#374151' }}>Support & Legal</Text>
          <TouchableOpacity
            onPress={() => {/* navigate to help/faqs */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HelpCircle size={20} color="#0ea5e9" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Help & FAQs</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigate to chat support */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MessageSquare size={20} color="#34d399" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Chat with Support</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* navigate to terms & privacy */}}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FileText size={20} color="#7c3aed" />
              <Text style={{ marginLeft: 14, fontSize: 16, color: '#1f2937' }}>Terms & Policies</Text>
            </View>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[
            shadowStyle,
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, backgroundColor: '#fee2e2' }
          ]}
          onPress={() => {/* Implement logout logic here */}}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#dc2626', marginLeft: 8 }}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default SettingScreen;
