import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChevronDown, X, MessageCircle, Mail, CheckCircle } from 'lucide-react-native';

const FarmFerryFAQ = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSupportPress = () => {
    setIsSupportModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsSupportModalVisible(false);
    // Reset form when closing
    setSupportForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleFormSubmit = () => {
    // Handle form submission logic here
    console.log('Support form submitted:', supportForm);

    // Close the support modal and show success modal
    setIsSupportModalVisible(false);
    setIsSuccessModalVisible(true);

    // Reset form
    setSupportForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  const faqData = {
    categories: [
      { id: 'ordering', name: 'Ordering & Products' },
      { id: 'delivery', name: 'Delivery & Tracking' },
      { id: 'payments', name: 'Payments & Pricing' },
      { id: 'account', name: 'Account & Technical' },
      { id: 'returns', name: 'Returns & Refunds' }
    ],
    items: [
      {
        id: 1,
        question: 'How do I place an order on FarmFerry?',
        answer: 'To place an order, simply browse our categories, add products to your cart, and proceed to checkout. You will need to create an account or sign in to complete your purchase.',
        category: 'ordering'
      },
      {
        id: 2,
        question: 'What are FarmFerry\'s delivery hours?',
        answer: 'We deliver from 8 AM to 10 PM daily, including weekends. Same-day delivery is available.',
        category: 'delivery'
      },
      {
        id: 3,
        question: 'What payment methods do you accept?',
        answer: 'We accept credit/debit cards, UPI, net banking, and cash on delivery. All online payments are securely processed.',
        category: 'payments'
      },
      {
        id: 4,
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking link via SMS and email. You can also track it from your account dashboard.',
        category: 'delivery'
      },
      {
        id: 5,
        question: 'What if I receive damaged or spoiled produce?',
        answer: 'We take quality seriouse. If you receive damaged items, please contact us within 24 hours with photos for a full refund or replacement.',
        category: 'returns'
      },
      {
        id: 6,
        question: 'Are there any delivery fees?',
        answer: 'Delivery is free for orders above ₹499. For orders below this amount, a ₹20 delivery fee applies.',
        category: 'payments'
      },
      {
        id: 7,
        question: 'Can I modify my order after placing it?',
        answer: 'No, you cannot modify your order after placing it.',
        category: 'ordering'
      },
      {
        id: 8,
        question: 'Do you offer organic products?',
        answer: 'Yes, we have a dedicated "Organic" section with certified organic fruits, vegetables, and other grocery items. Look for the organic badge on products.',
        category: 'ordering'
      }
    ]
  };

  const filteredFAQs = useMemo(() => {
    return faqData.items.filter(item =>
      activeCategory === 'all' || item.category === activeCategory
    );
  }, [activeCategory]);

  const ChevronIcon = ({ isOpen }) => (
    <ChevronDown
      size={20}
      color="#004C46"
      style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
    />
  );

  return (
    <>
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="mt-14 px-5 pb-10">
          {/* Header */}
          <View className="items-center mb-6 py-4">
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Frequently Asked Questions
            </Text>
            <Text className="text-base text-gray-600 text-center">
              Answers to common questions about FarmFerry
            </Text>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-4 py-2 rounded-lg ${activeCategory === 'all' ? 'bg-[#004C46]' : 'bg-gray-100'
                  }`}
                onPress={() => setActiveCategory('all')}
              >
                <Text className={`text-sm font-medium ${activeCategory === 'all' ? 'text-white' : 'text-gray-900'
                  }`}>
                  All FAQs
                </Text>
              </TouchableOpacity>
              {faqData.categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-4 py-2 rounded-lg ${activeCategory === category.id ? 'bg-[#004C46]' : 'bg-gray-100'
                    }`}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <Text className={`text-sm font-medium ${activeCategory === category.id ? 'text-white' : 'text-gray-900'
                    }`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* FAQ Items */}
          <View className="mb-6">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(item => (
                <View key={item.id} className="bg-white rounded-lg mb-3 border border-gray-200">
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-4"
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text className="flex-1 text-base text-gray-900 mr-3 leading-5">
                      {item.question}
                    </Text>
                    <ChevronIcon isOpen={openItems[item.id]} />
                  </TouchableOpacity>
                  {openItems[item.id] && (
                    <View className="bg-gray-50 p-4 border-t border-gray-200">
                      <Text className="text-sm text-gray-700 leading-5">
                        {item.answer}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View className="items-center py-10">
                <Text className="text-4xl mb-3">😕</Text>
                <Text className="text-lg text-gray-900 mb-2">No FAQs found</Text>
                <Text className="text-base text-gray-600">Try a different category</Text>
              </View>
            )}
          </View>

          {/* Support CTA */}
          <View className="bg-gray-50 rounded-lg p-5 border border-gray-200 items-center">
            <Text className="text-xl text-gray-900 mb-2 text-center">
              Still have questions?
            </Text>
            <Text className="text-base text-gray-600 mb-4 text-center">
              Our support team is here to help you
            </Text>
            <View className="w-full gap-3">
              <TouchableOpacity
                className="bg-[#004C46] py-3 px-5 rounded-lg items-center"
                onPress={handleSupportPress}
              >
                <Text className="text-base text-white font-medium">
                  Contact Support
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity className="bg-transparent py-3 px-5 rounded-lg items-center border border-green-600">
                <Text className="text-base text-green-600 font-medium">
                  Live Chat
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Support Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSupportModalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl mx-5 w-11/12 max-w-md">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
                <View className="flex-row items-center">
                  <MessageCircle size={24} color="#004C46" />
                  <Text className="text-xl font-bold text-gray-900 ml-3">
                    Contact Support
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="p-1"
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView className="max-h-97 p-6">
                <View className="space-y-4">
                  <Text className="text-base text-gray-600 mb-4">
                    Fill out the form below and our support team will get back to you within 24 hours.
                  </Text>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                      placeholder="Enter your full name"
                      value={supportForm.name}
                      onChangeText={(text) => setSupportForm(prev => ({ ...prev, name: text }))}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={supportForm.email}
                      onChangeText={(text) => setSupportForm(prev => ({ ...prev, email: text }))}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Subject</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                      placeholder="What is this regarding?"
                      value={supportForm.subject}
                      onChangeText={(text) => setSupportForm(prev => ({ ...prev, subject: text }))}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Message</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 text-base h-32"
                      placeholder="Describe your issue in detail..."
                      multiline
                      textAlignVertical="top"
                      value={supportForm.message}
                      onChangeText={(text) => setSupportForm(prev => ({ ...prev, message: text }))}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View className="flex-row gap-3 p-6 border-t border-gray-200">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg border border-gray-300"
                  onPress={handleCloseModal}
                >
                  <Text className="text-center text-base font-medium text-gray-700">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg bg-[#004C46]"
                  onPress={handleFormSubmit}
                >
                  <Text className="text-center text-base font-medium text-white">
                    Send Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSuccessModalVisible}
        onRequestClose={handleCloseSuccessModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl mx-5 w-11/12 max-w-sm p-6 items-center">
            {/* Success Icon */}
            <View className="bg-green-50 rounded-full p-4 mb-4">
              <CheckCircle size={48} color="#004C46" />
            </View>

            {/* Success Message */}
            <Text className="text-xl font-bold text-gray-900 text-center mb-3">
              Message Sent!
            </Text>

            <Text className="text-base text-gray-600 text-center mb-2">
              Thank you for contacting us.
            </Text>

            <Text className="text-base text-gray-600 text-center mb-6">
              Our support team will get back to you within 24 hours.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              className="w-full py-3 rounded-lg bg-[#004C46]"
              onPress={handleCloseSuccessModal}
            >
              <Text className="text-center text-base font-medium text-white">
                Got It
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default FarmFerryFAQ;