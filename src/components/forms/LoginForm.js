import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Animated, Keyboard, ActivityIndicator } from 'react-native';
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
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setPhone(numericText);

    if (numericText.length === 10) {
      setError('');
      Keyboard.dismiss(); // Auto-dismiss keyboard when 10 digits are entered
    } else if (numericText.length > 0 && numericText.length < 10) {
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

  const renderOtpBlocks = () => {
    const blocks = [];
    for (let i = 0; i < 6; i++) {
      blocks.push(
        <View key={i} style={[styles.otpBlock, otp.length === i && styles.otpBlockActive, otp.length > i && styles.otpBlockFilled]}>
          <Text style={styles.otpText}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return blocks;
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
    <View style={styles.container}>
      {/* Welcome Text - Only show when NOT in OTP mode */}
      {!showOtpInput && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subText}>Login to access fresh farm products</Text>
        </View>
      )}

      {/* Phone input section */}
      {!showOtpInput ? (
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
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Continue</Text>
                <ArrowRight size={20} color="white" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // OTP input section
        <Animated.View style={[styles.formGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.otpHeader}>
            <Text style={styles.label}>Enter Verification Code</Text>
            <TouchableOpacity onPress={() => setShowOtpInput(false)}>
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.otpSubText}>Sent to +91 {phone}</Text>

          <View style={styles.otpContainer}>
            {/* Hidden Input for handling typing */}
            <TextInput
              style={styles.hiddenOtpInput}
              value={otp}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                setOtp(clean);
                if (clean.length === 6) Keyboard.dismiss();
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
              caretHidden={true}
            />
            {/* Visible Blocks */}
            <View style={styles.otpBlocksContainer} pointerEvents="none">
              {renderOtpBlocks()}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, (otp.length !== 6 || isLoading) && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Modal ... */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                if (modalOnOk) modalOnOk();
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#004C46',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#004C46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  changeNumberText: {
    color: '#004C46',
    fontSize: 12,
    fontWeight: '600',
  },
  otpSubText: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 20,
  },
  otpContainer: {
    position: 'relative',
    height: 50,
    justifyContent: 'center',
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0, // Hide it but keep it interactable
    zIndex: 2,
  },
  otpBlocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBlock: {
    width: 45,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBlockActive: {
    borderColor: '#004C46',
    backgroundColor: '#ffffff',
  },
  otpBlockFilled: {
    borderColor: '#004C46',
    backgroundColor: '#eff6ff',
  },
  otpText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#6b7280',
    fontSize: 13,
  },
  resendLink: {
    color: '#004C46',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#004C46',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LoginForm;