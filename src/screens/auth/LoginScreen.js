import React from 'react';
import { View, ScrollView, Image, SafeAreaView, Text, KeyboardAvoidingView, Platform, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LoginForm from '../../components/forms/LoginForm';
import { SCREEN_NAMES } from '../../types';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    // AuthContext will set isAuthenticated=true and AppNavigator will
    // automatically swap AuthStack → AppStack.
    console.log('Login success');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Background - Clean & Subtle */}
      {/* Using a very subtle top-to-bottom gradient for a premium feel */}
      <LinearGradient
        colors={['#f0fdf4', '#ffffff', '#ffffff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentContainer}>

              {/* Logo Section - refined */}
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require('../../../assets/images/Icon2.jpeg')}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.brandName}>
                  FARM FERRY
                </Text>
                <Text style={styles.tagline}>
                  Freshness Delivered to Your Doorstep
                </Text>
              </View>

              {/* Login Form Component */}
              <View style={styles.formContainer}>
                <LoginForm
                  onSuccess={handleLoginSuccess}
                // onForgotPassword & onRegister are handled internally or not needed if OTP flow
                />
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500, // Limit width on tablets/web
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#166534', // Dark green
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
});

export default LoginScreen;