import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Animated,
  Keyboard
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CONFIG } from '../../constants/config';
import { ShieldCheck, Key, RefreshCw, X, ArrowLeft } from 'lucide-react-native';

const OTPVerificationForm = ({
  phone,
  email = null,
  onVerificationSuccess,
  onVerificationFailure,
  onResendOTP,
  onBack,
  title = 'Verify Phone',
  subtitle = 'We\'ve sent a code to',
  buttonText = 'Verify & Continue',
  showBackButton = true,
  autoSendOTP = true,
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnOk, setModalOnOk] = useState(null);

  // Animations
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

  useEffect(() => {
    if (autoSendOTP && phone) {
      handleSendOTP();
    }
  }, [autoSendOTP, phone]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showModal = (title, message, onOk = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnOk(() => onOk);
    setModalVisible(true);
  };

  const handleSendOTP = async () => {
    if (!phone) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.SEND_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.data?.customerId) {
          setCustomerId(data.data.customerId);
        }
        setCountdown(60);
      } else {
        showModal('Error', data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      showModal('Connection Error', 'Could not access the server. Please check your internet connection.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) { // Assuming 6 usually, but keeping strictness low for flexibility or 4 digit cases
      showModal('Invalid Code', 'Please enter the complete verification code.');
      return;
    }

    setIsVerifying(true);
    Keyboard.dismiss();

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN_OTP}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, customerId }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onVerificationSuccess) {
          onVerificationSuccess(data, { phone, otp, customerId });
        }
      } else {
        const msg = data.message || 'Invalid OTP. Please try again.';
        if (onVerificationFailure) onVerificationFailure(msg);
        showModal('Verification Failed', msg);
      }
    } catch (error) {
      const msg = 'Network error while verifying OTP.';
      if (onVerificationFailure) onVerificationFailure(msg);
      showModal('Error', msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendClick = async () => {
    if (onResendOTP) {
      onResendOTP();
    } else {
      await handleSendOTP();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>

        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color="#004C46" />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle} <Text style={styles.phoneHighlight}>{phone}</Text>
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Enter Code</Text>
          <View style={styles.inputWrapper}>
            <Key size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="• • • • • •"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              autoFocus={false}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleVerifyOTP}
          disabled={isVerifying}
          style={[styles.button, isVerifying && styles.buttonDisabled]}
        >
          {isVerifying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{buttonText}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={handleResendClick}
            disabled={isSendingOtp || countdown > 0}
            style={styles.resendButton}
          >
            {isSendingOtp ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {showBackButton && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={16} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5', // emerald-50
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  phoneHighlight: {
    fontWeight: '600',
    color: '#10b981',
  },
  formGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 54,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 24, // Larger for OTP
    fontWeight: '600',
    color: '#1e293b',
    height: '100%',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#004C46',
    borderRadius: 12,
    height: 54,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#004C46',
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
  },
  resendContainer: {
    marginBottom: 24,
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    color: '#004C46',
    fontWeight: '600',
    fontSize: 14,
  },
  resendTextDisabled: {
    color: '#94a3b8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
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

export default OTPVerificationForm;
