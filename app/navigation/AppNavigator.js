//import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { SCREEN_NAMES } from '../types';

// Auth Screens
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ResetPasswordWithOTPScreen from '../screens/auth/ResetPasswordWithOTPScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main App Screens
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductListScreen from '../screens/ProductListScreen';
import SubcategoriesScreen from '../screens/SubcategoriesScreen';
import MainTabNavigator from './MainTabNavigator';
import ProductStackNavigator from './ProductsStackNavigator';

// Extra Feature Screens (Add/Edit/Profile)
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import DeleteAddressScreen from '../screens/DeleteAddressScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LogoScreen from '../screens/LogoScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import RateReviewScreen from '../screens/RateReviewScreen';
import SupportScreen from '../screens/SupportScreen';

// Loading Screen
import AddAddressScreen from '../screens/AddAddressScreen';
import LoadingScreen from '../screens/LoadingScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PaymentStatusScreen from '../screens/PaymentStatusScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import RazorpayTestScreen from '../screens/RazorpayTestScreen';
import OrderSummaryScreen from '../screens/orderSummary';


const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name={SCREEN_NAMES.LOGIN}
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.REGISTER}
      component={RegisterScreen}
      options={{ headerShown: true, title: 'Register' }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.PHONE_VERIFICATION}
      component={PhoneVerificationScreen}
      options={{ headerShown: true, title: 'Verify Phone' }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.FORGOT_PASSWORD}
      component={ForgotPasswordScreen}
      options={{ headerShown: true, title: 'Forgot Password' }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.RESET_PASSWORD}
      component={ResetPasswordScreen}
      options={{ headerShown: true, title: 'Reset Password' }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.RESET_PASSWORD_WITH_OTP}
      component={ResetPasswordWithOTPScreen}
      options={{ headerShown: true, title: 'Reset Password with OTP' }}
    />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="MainApp"
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductStack"
      component={ProductStackNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OrderDetails"
      component={OrderDetailsScreen}
      options={{ headerShown: true, title: 'Order Details' }}
    />
    <Stack.Screen
      name="DeleteAddress"
      component={DeleteAddressScreen}
      options={{ headerShown: true, title: 'Delete Address' }}
    />
    <Stack.Screen
      name={SCREEN_NAMES.PRODUCT_DETAILS}
      component={ProductDetailsScreen}
      options={{ headerShown: true }}
    />
    {/* <Stack.Screen
      name="Checkout"
      component={CheckoutScreen}
      options={{ headerShown: true, title: 'Add Address' }}
    /> */}
    <Stack.Screen
      name="OrderSummary"
      component={OrderSummaryScreen}
      options={{ headerShown: true, title: 'Order Summary' }}
    />
    <Stack.Screen
      name="PaymentStatus"
      component={PaymentStatusScreen}
      options={{ headerShown: false }}
    />
    {/* <Stack.Screen
      name={SCREEN_NAMES.ADD_ADDRESS}
      component={AddAddressScreen}
      options={{ headerShown: true, title: 'Add Address' }}
    /> */}
    <Stack.Screen
      name={SCREEN_NAMES.EDIT_PROFILE}
      component={EditProfileScreen}
      options={{ headerShown: true, title: 'Edit Profile' }}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: true, title: 'Change Password' }}
    />
    <Stack.Screen
      name="PaymentMethods"
      component={PaymentMethodsScreen}
      options={{ headerShown: true, title: 'Payment Methods' }}
    />
    <Stack.Screen
      name="RateReview"
      component={RateReviewScreen}
      options={{ headerShown: true, title: 'Rate & Review' }}
    />
    <Stack.Screen
      name="MyReviews"
      component={MyReviewsScreen}
      options={{ headerShown: false }}
    />
    {/* <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: true, title: 'Settings' }}
    /> */}
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={{ headerShown: true, title: 'Help & Support' }}
    />
    <Stack.Screen
      name="NotificationsScreen"
      component={NotificationsScreen}
      options={{ headerShown: true, title: 'Notifications' }}
    />
    <Stack.Screen
      name="LogoScreen"
      component={LogoScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddAddress"
      component={AddAddressScreen}
      options={{ headerShown: false, title: 'Add Address' }}
    />
    <Stack.Screen
      name="Orders"
      component={OrdersScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Subcategories"
      component={SubcategoriesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductList"
      component={ProductListScreen}
      options={{ headerShown: true, title: 'All Categories' }}
    />
    <Stack.Screen
      name="RazorpayTest"
      component={RazorpayTestScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <AppStack key="app" /> : <AuthStack key="auth" />;
};

export default AppNavigator;
