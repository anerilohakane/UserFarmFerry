// // import React, { useState } from 'react';
// // import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
// // import { useAuth } from '../../context/AuthContext';
// // import { useNavigation } from '@react-navigation/native';
// // import { SCREEN_NAMES } from '../../types';
// // import { CONFIG } from '../../constants/config';

// // const LoginForm = ({ onSuccess, onForgotPassword, onRegister }) => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [showPhoneVerification, setShowPhoneVerification] = useState(false);
// //   const [phoneOTP, setPhoneOTP] = useState('');
// //   const [isVerifying, setIsVerifying] = useState(false);
// //   const [customerData, setCustomerData] = useState(null);
// //   const { login } = useAuth();
// //   const navigation = useNavigation();

// //   const handleSubmit = async () => {
// //     setIsLoading(true);
// //     try {
// //       const result = await login(email, password);

// //       if (result.success) {
// //         onSuccess?.();
// //       } else if (result.requiresPhoneVerification) {
// //         setCustomerData(result.customer);
// //         setShowPhoneVerification(true);
// //         Alert.alert(
// //           'Phone Verification Required',
// //           result.message || 'Please verify your phone number with the OTP sent to your mobile.',
// //           [{ text: 'OK' }]
// //         );
// //       }
// //     } catch (error) {
// //       Alert.alert(
// //         'Login Failed',
// //         error.response?.data?.message || 'An unexpected error occurred. Please try again.'
// //       );
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleVerifyPhone = async () => {
// //     if (!phoneOTP) {
// //       Alert.alert('Error', 'Please enter the OTP sent to your phone.');
// //       return;
// //     }

// //     setIsVerifying(true);
// //     try {
// //       const response = await fetch(`${CONFIG.API_BASE_URL}/auth/verify-phone-otp`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           phone: customerData?.phone,
// //           otp: phoneOTP
// //         })
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert(
// //           'Success', 
// //           'Phone number verified successfully! Please try logging in again.',
// //           [
// //             {
// //               text: 'OK',
// //               onPress: () => {
// //                 setShowPhoneVerification(false);
// //                 setPhoneOTP('');
// //                 setCustomerData(null);
// //               }
// //             }
// //           ]
// //         );
// //       } else {
// //         Alert.alert('Verification Failed', data.message || 'Invalid OTP. Please try again.');
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to verify phone number. Please try again.');
// //     } finally {
// //       setIsVerifying(false);
// //     }
// //   };

// //   const handleResendOTP = async () => {
// //     try {
// //       const response = await fetch(`${CONFIG.API_BASE_URL}/auth/send-phone-verification`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ phone: customerData?.phone })
// //       });

// //       if (response.ok) {
// //         Alert.alert('Success', 'New OTP has been sent to your phone.');
// //       } else {
// //         Alert.alert('Error', 'Failed to resend OTP. Please try again.');
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to resend OTP. Please try again.');
// //     }
// //   };

// //   if (showPhoneVerification) {
// //     return (
// //       <View style={{ width: '100%' }}>
// //         <View style={{ marginBottom: 24 }}>
// //           <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
// //             Verify Phone Number
// //           </Text>
// //           <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
// //             We've sent a verification code to
// //           </Text>
// //           <Text style={{ textAlign: 'center', fontWeight: '600', color: '#333' }}>
// //             {customerData?.phone}
// //           </Text>
// //         </View>

// //         <View style={{ marginBottom: 16 }}>
// //           <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
// //             Enter OTP *
// //           </Text>
// //           <TextInput
// //             style={{
// //               borderWidth: 1,
// //               borderColor: '#d1d5db',
// //               borderRadius: 8,
// //               padding: 12,
// //               backgroundColor: 'white',
// //               textAlign: 'center',
// //               fontSize: 18,
// //               letterSpacing: 2,
// //             }}
// //             placeholder="Enter 6-digit code"
// //             placeholderTextColor="#9ca3af"
// //             value={phoneOTP}
// //             onChangeText={setPhoneOTP}
// //             keyboardType="numeric"
// //             maxLength={6}
// //           />
// //         </View>

// //         <TouchableOpacity
// //           style={{
// //             backgroundColor: '#2563eb',
// //             borderRadius: 8,
// //             padding: 16,
// //             alignItems: 'center',
// //             justifyContent: 'center',
// //             width: '100%',
// //             marginBottom: 16,
// //           }}
// //           onPress={handleVerifyPhone}
// //           disabled={isVerifying}
// //         >
// //           <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
// //             {isVerifying ? 'Verifying...' : 'Verify & Continue'}
// //           </Text>
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { CONFIG } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_NAMES } from '../../types';

const LoginForm = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnOk, setModalOnOk] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const { sendCustomerOTP, loginWithOTP, ...authRest } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    console.log('LoginForm: Auth Context Keys:', Object.keys({ sendCustomerOTP, loginWithOTP, ...authRest }));
    console.log('LoginForm: sendCustomerOTP type:', typeof sendCustomerOTP);
  }, [sendCustomerOTP]);

  // Phone number validation
  const validatePhone = (phoneNumber) => {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length === 0) {
      setPhoneError('');
      return true;
    }

    if (cleanPhone.length < 10) {
      setPhoneError('Phone number must be 10 digits');
      return false;
    }

    if (cleanPhone.length === 10) {
      setPhoneError('');
      return true;
    }

    return false;
  };

  // Handle phone input change
  const handlePhoneChange = (text) => {
    // Only allow digits
    const cleanText = text.replace(/\D/g, '');

    // Limit to 10 digits
    if (cleanText.length <= 10) {
      setPhone(cleanText);
      validatePhone(cleanText);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    console.log('LoginForm: handleSendOtp triggered for phone:', phone);
    if (!phone) {
      console.log('LoginForm: No phone entered');
      setModalTitle('Error');
      setModalMessage('Please enter your phone number');
      setModalVisible(true);
      return;
    }

    if (phone.length !== 10) {
      console.log('LoginForm: Invalid phone length:', phone.length);
      setModalTitle('Error');
      setModalMessage('Phone number must be exactly 10 digits');
      setModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      console.log('LoginForm: Calling sendCustomerOTP...');
      // Use method from AuthContext instead of direct fetch
      const result = await sendCustomerOTP(phone);
      console.log('LoginForm: sendCustomerOTP result:', result);

      if (result.success) {
        setModalTitle('Success');
        setModalMessage(result.message || 'OTP sent to your phone.');
        setModalOnOk(() => () => setShowOtpInput(true));
        setModalVisible(true);
      } else {
        setModalTitle('Error');
        setModalMessage(result.message || 'Failed to send OTP.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('LoginForm: Catch error:', error);
      setModalTitle('Error');
      setModalMessage(error.message || 'Something went wrong. Please try again.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Login
  const handleVerifyOtp = async () => {
    if (!otp) {
      setModalTitle('Error');
      setModalMessage('Please enter the OTP');
      setModalVisible(true);
      return;
    }

    if (otp.length !== 6) {
      setModalTitle('Error');
      setModalMessage('OTP must be 6 digits');
      setModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithOTP(phone, otp);

      if (result.success) {
        setModalTitle('Success');
        setModalMessage('Logged in successfully!');
        setModalOnOk(() => () => {
          onSuccess?.(result);
        });
        setModalVisible(true);
      }
    } catch (error) {
      setModalTitle('Login Failed');
      setModalMessage(error.message || 'Failed to verify OTP. Please try again.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 20,
            width: '80%',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
              {modalTitle}
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#10b981',
                borderRadius: 8,
                padding: 12,
                width: '50%',
                alignItems: 'center',
              }}
              onPress={() => {
                setModalVisible(false);
                if (modalOnOk) modalOnOk();
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!showOtpInput ? (
        <>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Welcome Back
            </Text>
            <Text style={{ textAlign: 'center', color: '#666' }}>
              Sign in with your phone number
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              Phone Number *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: phoneError ? '#ef4444' : '#d1d5db',
                borderRadius: 8,
                padding: 12,
                backgroundColor: 'white',
              }}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                {phoneError}
              </Text>
            ) : null}
            {phone.length > 0 && phone.length === 10 ? (
              <Text style={{ color: '#10b981', fontSize: 12, marginTop: 4 }}>
                ✓ Valid phone number
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: phone.length === 10 ? '#059669' : '#9ca3af',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
            onPress={handleSendOtp}
            disabled={isLoading || phone.length !== 10}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Verify Phone Number
            </Text>
            <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
              We've sent a verification code to
            </Text>
            <Text style={{ textAlign: 'center', fontWeight: '600', color: '#333' }}>
              {phone}
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              Enter OTP *
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                backgroundColor: 'white',
                textAlign: 'center',
                fontSize: 18,
                letterSpacing: 2,
              }}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#9ca3af"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#10b981",
              borderRadius: 8,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: 16,
            }}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#666', fontSize: 14 }}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleSendOtp}>
              <Text style={{ color: '#10b981', fontWeight: '500', fontSize: 14 }}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowOtpInput(false);
              setOtp('');
            }}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: '#10b981', fontSize: 14 }}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default LoginForm;