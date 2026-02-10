import React, { useState, useEffect } from 'react';
import { View, Image, Text, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoginForm from '../../components/forms/LoginForm';
import { SCREEN_NAMES } from '../../types';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleLoginSuccess = () => {
    console.log('Login success');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.innerContainer}>
          {/* Top Section - Image Background */}
          {/* Shrink image when keyboard is open to make space */}
          <View style={[styles.topImageContainer, { height: isKeyboardVisible ? '30%' : '60%' }]}>
            <Image
              source={require('../../../assets/images/login_bg.jpg')}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          </View>

          {/* Bottom Section - Form Area */}
          <View style={styles.formSection}>
            <LoginForm onSuccess={handleLoginSuccess} />

            <Text style={styles.footerText}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    flex: 1,
  },
  topImageContainer: {
    width: '100%',
    overflow: 'hidden',
    // Height is controlled inline
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  formSection: {
    flex: 1, // Take remaining space
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default LoginScreen;