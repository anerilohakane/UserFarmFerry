import React from 'react';
import { View, ScrollView, Image, SafeAreaView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginForm from '../../components/forms/LoginForm';
import { SCREEN_NAMES } from '../../types';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    // AuthContext will set isAuthenticated=true and AppNavigator will
    // automatically swap AuthStack → AppStack. No manual reset needed here.
    console.log('Login success callback triggered - AuthContext should handle navigation');
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREEN_NAMES.FORGOT_PASSWORD);
  };

  const handleRegister = () => {
    navigation.navigate(SCREEN_NAMES.REGISTER);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo and Branding */}
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../../../assets/images/Icon2.jpeg')} style={{ width: 150, height: 150, resizeMode: 'contain' }} />
          </View>
          {/* Login Form */}
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen; 
// import { 
//   View, 
//   ScrollView, 
//   Image, 
//   SafeAreaView, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   Alert, 
//   ActivityIndicator 
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import LoginForm from '../../components/forms/LoginForm';
// import { SCREEN_NAMES } from '../../types';
// import { CONFIG } from '../../constants/config';

// const LoginScreen = ({ route }) => {
//   const navigation = useNavigation();
  
//   // Phone verification states
//   const [showPhoneVerification, setShowPhoneVerification] = useState(false);
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [isSendingOtp, setIsSendingOtp] = useState(false);

//   // Check if coming from registration with phone verification needed
//   useEffect(() => {
//     if (route?.params?.showPhoneVerification) {
//       setShowPhoneVerification(true);
//       setPhone(route.params.phone);
      
//       // Show success message
//       setTimeout(() => {
//         Alert.alert(
//           'Registration Successful',
//           route.params.message || 'Please verify your phone number to complete your account setup.'
//         );
//       }, 500);
//     }
//   }, [route?.params]);

//   const handleLoginSuccess = () => {
//     /*
//       After a successful login, AuthContext already flips
//       `isAuthenticated` to true which causes <AppNavigator /> to
//       switch from <AuthStack /> to <AppStack />. In order to ensure
//       that the Login screen is removed from the navigation history
//       (so the user can't go back to it) and the first screen of the
//       authenticated stack is shown immediately, we reset the root
//       navigation state to the `MainApp` stack that contains the tab
//       navigator (which itself will land the user on the Home tab).
//     */
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'MainApp' }],
//     });
//   };

//   const handleForgotPassword = () => {
//     navigation.navigate(SCREEN_NAMES.FORGOT_PASSWORD);
//   };

//   const handleRegister = () => {
//     navigation.navigate(SCREEN_NAMES.REGISTER);
//   };

//   const sendOTP = async () => {
//     setIsSendingOtp(true);
//     try {
//       const res = await fetch(`${CONFIG.API_BASE_URL}/auth/send-phone-verification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone }),
//       });
      
//       const data = await res.json();
      
//       if (res.ok) {
//         Alert.alert('OTP Sent', data.message || 'OTP sent successfully to your phone number.');
//         setOtpSent(true);
//       } else {
//         Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Send OTP error:', error);
//       Alert.alert('Error', 'Network error while sending OTP. Please check your connection.');
//     } finally {
//       setIsSendingOtp(false);
//     }
//   };

//   const verifyOTP = async () => {
//     if (!otp || otp.length < 4) {
//       Alert.alert('Error', 'Please enter the complete OTP.');
//       return;
//     }
    
//     setIsVerifying(true);
//     try {
//       const res = await fetch(`${CONFIG.API_BASE_URL}/auth/verify-phone-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone, otp }),
//       });
      
//       const data = await res.json();
      
//       if (res.ok) {
//         Alert.alert(
//           'Success', 
//           'Phone number verified successfully! Your account is now fully activated.',
//           [
//             { 
//               text: 'Continue', 
//               onPress: () => {
//                 setShowPhoneVerification(false);
//                 setOtpSent(false);
//                 setOtp('');
//                 // Clear navigation params
//                 navigation.setParams({
//                   showPhoneVerification: false,
//                   phone: null,
//                   message: null
//                 });
//               }
//             },
//           ]
//         );
//       } else {
//         Alert.alert('Verification Failed', data.message || 'Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Verify OTP error:', error);
//       Alert.alert('Error', 'Network error while verifying OTP. Please check your connection.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const resendOTP = async () => {
//     setIsSendingOtp(true);
//     try {
//       const res = await fetch(`${CONFIG.API_BASE_URL}/auth/send-phone-verification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone }),
//       });
      
//       if (res.ok) {
//         Alert.alert('OTP Resent', 'A new OTP has been sent to your phone number.');
//       } else {
//         Alert.alert('Error', 'Failed to resend OTP.');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to resend OTP. Please try again.');
//     } finally {
//       setIsSendingOtp(false);
//     }
//   };

//   const handleSkipVerification = () => {
//     setShowPhoneVerification(false);
//     setOtpSent(false);
//     setOtp('');
//     // Clear navigation params
//     navigation.setParams({
//       showPhoneVerification: false,
//       phone: null,
//       message: null
//     });
//   };

//   // Phone Verification Component
//   const PhoneVerificationComponent = () => (
//     <View className="px-6 py-8">
//       <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">Phone Verification</Text>
//       <Text className="text-gray-500 text-center mb-2">
//         Verify your phone number to complete registration
//       </Text>
//       <Text className="text-gray-700 font-semibold text-center mb-8">
//         {phone}
//       </Text>

//       {!otpSent ? (
//         <View>
//           <Text className="text-gray-600 text-center mb-8">
//             Click the button below to send a verification code to your phone number.
//           </Text>
          
//           <TouchableOpacity
//             onPress={sendOTP}
//             disabled={isSendingOtp}
//             className="bg-blue-600 py-4 rounded-xl items-center shadow-md mb-6"
//             activeOpacity={0.8}
//           >
//             {isSendingOtp ? (
//               <View className="flex-row items-center">
//                 <ActivityIndicator size="small" color="#fff" />
//                 <Text className="text-white font-bold text-lg ml-3">Sending OTP...</Text>
//               </View>
//             ) : (
//               <Text className="text-white font-bold text-lg">Send OTP</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View>
//           <Text className="text-gray-600 text-center mb-6">
//             Enter the verification code sent to your phone
//           </Text>
          
//           <View className="mb-6">
//             <Text className="text-gray-700 mb-2">Verification Code</Text>
//             <TextInput
//               placeholder="Enter OTP"
//               value={otp}
//               onChangeText={setOtp}
//               keyboardType="number-pad"
//               maxLength={6}
//               className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center text-lg tracking-widest shadow-sm"
//             />
//           </View>
          
//           <TouchableOpacity
//             onPress={verifyOTP}
//             disabled={isVerifying}
//             className="bg-green-600 py-4 rounded-xl items-center shadow-md mb-4"
//             activeOpacity={0.8}
//           >
//             {isVerifying ? (
//               <View className="flex-row items-center">
//                 <ActivityIndicator size="small" color="#fff" />
//                 <Text className="text-white font-bold text-lg ml-3">Verifying...</Text>
//               </View>
//             ) : (
//               <Text className="text-white font-bold text-lg">Verify OTP</Text>
//             )}
//           </TouchableOpacity>

//           <View className="flex-row justify-center items-center mb-4">
//             <Text className="text-gray-500 mr-1">Didn't receive the code?</Text>
//             <TouchableOpacity onPress={resendOTP} disabled={isSendingOtp}>
//               <Text className="text-blue-600 font-bold">Resend OTP</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       <TouchableOpacity
//         onPress={handleSkipVerification}
//         className="py-3 items-center"
//       >
//         <Text className="text-gray-600 font-medium">Skip for Now</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <ScrollView 
//         className="flex-1"
//         contentContainerStyle={{ flexGrow: 1 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="flex-1 justify-center">
//           {/* Logo - Always show */}
//           <View style={{ alignItems: 'center' }}>
//             <Image 
//               source={require('../../../assets/images/Icon2.jpeg')} 
//               style={{ width: 150, height: 150, resizeMode: 'contain' }} 
//             />
//           </View>
          
//           {/* Conditional rendering based on phone verification state */}
//           {showPhoneVerification ? (
//             <PhoneVerificationComponent />
//           ) : (
//             /* Login Form */
//             <LoginForm
//               onSuccess={handleLoginSuccess}
//               onForgotPassword={handleForgotPassword}
//               onRegister={handleRegister}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default LoginScreen;