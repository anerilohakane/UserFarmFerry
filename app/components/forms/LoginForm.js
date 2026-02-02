import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Animated, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { Phone, ArrowRight, RefreshCw, X } from 'lucide-react-native';

const LoginForm = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnOk, setModalOnOk] = useState(null);
  const [error, setError] = useState('');

  const { sendCustomerOTP, loginWithOTP } = useAuth();

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validatePhone = (text) => {
    const cleanText = text.replace(/\D/g, '');
    setPhone(cleanText);
    if (cleanText.length > 0 && cleanText.length < 10) {
      setError('Phone number must be 10 digits');
    } else {
      setError('');
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendCustomerOTP(phone);
      if (result.success) {
        setShowOtpInput(true);
        // Optional: show a small toast or just transition smoothly
      } else {
        showModal('Error', result.message || 'Failed to send OTP.');
      }
    } catch (err) {
      showModal('Error', err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showModal('Invalid Code', 'Please enter the 6-digit code sent to your phone.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithOTP(phone, otp);
      if (result.success) {
        onSuccess?.(result);
      } else {
        showModal('Login Failed', result.message || 'Verification failed.');
      }
    } catch (err) {
      showModal('Error', err.message || 'Failed to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = (title, message, onOk = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnOk(() => onOk);
    setModalVisible(true);
  };

  const resetForm = () => {
    setShowOtpInput(false);
    setOtp('');
    setError('');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {showOtpInput ? 'Verification' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {showOtpInput
              ? `Enter the code sent to +91 ${phone}`
              : 'Sign in to access your farm fresh account'}
          </Text>
        </View>

        {/* Form State specific content */}
        {!showOtpInput ? (
          /* Phone Input Section */
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
              <Phone size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor="#A0A0A0"
                value={phone}
                onChangeText={validatePhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (phone.length !== 10 || isLoading) && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={phone.length !== 10 || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Continue'}
              </Text>
              {!isLoading && <ArrowRight size={20} color="white" style={styles.buttonIcon} />}
            </TouchableOpacity>
          </View>
        ) : (
          /* OTP Input Section */
          <View style={styles.formGroup}>
            <View style={styles.otpHeader}>
              <Text style={styles.label}>Enter OTP</Text>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.changeNumberText}>Change Number</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.otpInput}
              placeholder="• • • • • •"
              placeholderTextColor="#cbd5e1"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              autoFocus={true}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
                <Text style={[styles.resendLink, isLoading && { opacity: 0.5 }]}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </BlurView>

      {/* Modern Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                if (modalOnOk) modalOnOk();
              }}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  blurContainer: {
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.9)', // Fallback for Android if blur doesn't work perfectly, also cleaner white look
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  formGroup: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6,
    height: 54,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#1e293b',
    height: '100%',
    fontWeight: '500',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 10,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#10b981', // Emerald 500
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeNumberText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#64748b',
    fontSize: 14,
  },
  resendLink: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginForm;