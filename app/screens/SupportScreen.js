import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import api from '../services/api';

const SupportScreen = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      // Try to fetch FAQ from backend (delivery associate endpoint reused for demo)
      const res = await api.get('/delivery-associates/support/faqs');
      setFaqs(res.data.faqs || []);
    } catch {
      setFaqs([
        { question: 'How do I contact support?', answer: 'Use the form below or email support@farmferry.com.' },
        { question: 'How do I reset my password?', answer: 'Go to Profile > Change Password.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    setSending(true);
    try {
      // Placeholder: POST to a support endpoint (not implemented for customers)
      await api.post('/delivery-associates/support/contact', { message: question });
      Alert.alert('Success', 'Your support request has been sent!');
      setQuestion('');
    } catch {
      Alert.alert('Error', 'Failed to send support request. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Help & Support</Text>
      <Text className="text-gray-500 mb-6">Browse FAQs or send us your question below.</Text>
      <Text className="text-lg font-semibold text-gray-700 mb-2">FAQs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#059669" className="mb-4" />
      ) : (
        <FlatList
          data={faqs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="mb-4">
              <Text className="font-semibold text-gray-900">Q: {item.question}</Text>
              <Text className="text-gray-700">A: {item.answer}</Text>
            </View>
          )}
        />
      )}
      <Text className="text-lg font-semibold text-gray-700 mb-2 mt-6">Contact Support</Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 mb-2"
        placeholder="Type your question or issue here..."
        value={question}
        onChangeText={setQuestion}
        editable={!sending}
        multiline
      />
      <TouchableOpacity
        className="bg-green-600 py-3 rounded-xl items-center mb-8"
        onPress={handleSend}
        disabled={sending || !question.trim()}
      >
        <Text className="text-white font-semibold text-base">{sending ? 'Sending...' : 'Send to Support'}</Text>
      </TouchableOpacity>
      <Text className="text-xs text-gray-400 text-center">Or email us at support@farmferry.com</Text>
    </ScrollView>
  );
};

export default SupportScreen;
