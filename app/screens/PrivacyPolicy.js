import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';

const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🔒</Text>
          </View>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Last updated: September 2025</Text>
          </View>
        </View>

        {/* Introduction Section */}
        <View style={styles.introSection}>
          <Text style={styles.introParagraph}>
            FarmFerry Private Limited ("FarmFerry," "Company," "we," "us," or "our") is committed to protecting the privacy and security of your personal information. Your trust is of utmost importance to us.
          </Text>
          <Text style={styles.introParagraph}>
            This Privacy Policy explains how we collect, use, process, and disclose information about you when you access or use our website www.farmferry.in, mobile application, or other affiliated services.
          </Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Questions? </Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@farmferry.in')}>
              <Text style={styles.contactLink}>info@farmferry.in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Applicability and Scope */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>📋</Text>
            </View>
            <Text style={styles.sectionTitle}>Applicability and Scope</Text>
          </View>
          <Text style={styles.paragraph}>
            This Privacy Policy applies to all information collected by FarmFerry through its Services, including data provided directly by you, collected automatically, or obtained from third parties.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>This policy does not apply to:</Text>
            <View style={styles.highlightItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.highlightText}>
                Information collected by third-party sellers who may have their own privacy policies
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.highlightText}>
                Information you provide to third-party websites or services linked from our Services
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            By accessing or using our Services, you agree to this Privacy Policy and consent to our collection, use, disclosure, retention, and protection of your personal information as described herein.
          </Text>
        </View>

        {/* Permissible Age */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>Permissible Age</Text>
          </View>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              The Services are not intended for users under the age of 18. If you are a minor, you may use the Services only under the supervision of an adult parent or legal guardian.
            </Text>
          </View>
        </View>

        {/* Information Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>📊</Text>
            </View>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
          </View>
          <Text style={styles.paragraph}>
            FarmFerry collects various types of information to provide and improve our Services:
          </Text>

          {/* Information You Provide */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <View style={styles.subSectionDot} />
              <Text style={styles.subSectionTitle}>Information You Provide to Us</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Account Information</Text>
                <Text style={styles.infoCardText}>Name, email, phone number, address, password, date of birth</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Order Information</Text>
                <Text style={styles.infoCardText}>Product details, delivery addresses, payment information</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Communications</Text>
                <Text style={styles.infoCardText}>Feedback, queries, complaints, customer support interactions</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Transactional Information</Text>
                <Text style={styles.infoCardText}>Payment details (encrypted using PCI-compliant gateways)</Text>
              </View>
            </View>
          </View>

          {/* Information Collected Automatically */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <View style={styles.subSectionDot} />
              <Text style={styles.subSectionTitle}>Information Collected Automatically</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Usage Information</Text>
                <Text style={styles.infoCardText}>Pages visited, search queries, products viewed, time spent</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Device Information</Text>
                <Text style={styles.infoCardText}>IP address, device type, OS, browser type, unique identifiers</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Location Information</Text>
                <Text style={styles.infoCardText}>Real-time GPS data (with your consent) for delivery tracking</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Cookies & Tracking</Text>
                <Text style={styles.infoCardText}>Cookies, web beacons, pixel tags for enhanced experience</Text>
              </View>
            </View>
          </View>

          {/* Third Party Information */}
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <View style={styles.subSectionDot} />
              <Text style={styles.subSectionTitle}>Information from Third Parties</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Social Media</Text>
                <Text style={styles.infoCardText}>Profile info when signing in via Google or Facebook</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCardItem}>
                <Text style={styles.infoCardLabel}>Analytics Providers</Text>
                <Text style={styles.infoCardText}>Data from partners like Google Analytics</Text>
              </View>
            </View>
          </View>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>⚙️</Text>
            </View>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          </View>
          <View style={styles.usageGrid}>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>📦</Text>
              <Text style={styles.usageCardTitle}>Provide Services</Text>
              <Text style={styles.usageCardText}>Process orders, facilitate deliveries, manage your account</Text>
            </View>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>✨</Text>
              <Text style={styles.usageCardTitle}>Personalize Experience</Text>
              <Text style={styles.usageCardText}>Tailored recommendations and promotions</Text>
            </View>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>🔧</Text>
              <Text style={styles.usageCardTitle}>Improve Services</Text>
              <Text style={styles.usageCardText}>Analyze patterns and enhance functionality</Text>
            </View>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>💬</Text>
              <Text style={styles.usageCardTitle}>Communicate</Text>
              <Text style={styles.usageCardText}>Order updates and customer support</Text>
            </View>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>📢</Text>
              <Text style={styles.usageCardTitle}>Marketing</Text>
              <Text style={styles.usageCardText}>Promotional offers and newsletters</Text>
            </View>
            <View style={styles.usageCard}>
              <Text style={styles.usageCardIcon}>🛡️</Text>
              <Text style={styles.usageCardTitle}>Fraud Prevention</Text>
              <Text style={styles.usageCardText}>Detect and prevent fraudulent activities</Text>
            </View>
          </View>
        </View>

        {/* How We Share Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>🤝</Text>
            </View>
            <Text style={styles.sectionTitle}>How We Share Your Information</Text>
          </View>
          <View style={styles.sharingItem}>
            <View style={styles.sharingIconContainer}>
              <Text style={styles.sharingIcon}>🏪</Text>
            </View>
            <View style={styles.sharingContent}>
              <Text style={styles.sharingTitle}>With Third Party Sellers</Text>
              <Text style={styles.sharingText}>To process orders placed on our platform</Text>
            </View>
          </View>
          <View style={styles.sharingItem}>
            <View style={styles.sharingIconContainer}>
              <Text style={styles.sharingIcon}>🚚</Text>
            </View>
            <View style={styles.sharingContent}>
              <Text style={styles.sharingTitle}>With Service Providers</Text>
              <Text style={styles.sharingText}>Delivery partners, payment processors, cloud hosting</Text>
            </View>
          </View>
          <View style={styles.sharingItem}>
            <View style={styles.sharingIconContainer}>
              <Text style={styles.sharingIcon}>⚖️</Text>
            </View>
            <View style={styles.sharingContent}>
              <Text style={styles.sharingTitle}>For Legal Purposes</Text>
              <Text style={styles.sharingText}>Comply with legal obligations and government requests</Text>
            </View>
          </View>
          <View style={styles.sharingItem}>
            <View style={styles.sharingIconContainer}>
              <Text style={styles.sharingIcon}>🏢</Text>
            </View>
            <View style={styles.sharingContent}>
              <Text style={styles.sharingTitle}>Business Transfers</Text>
              <Text style={styles.sharingText}>In case of merger, acquisition, or sale of assets</Text>
            </View>
          </View>
          <View style={styles.importantNote}>
            <Text style={styles.importantNoteIcon}>ℹ️</Text>
            <Text style={styles.importantNoteText}>
              We do not sell your personal information to third parties for monetary gain.
            </Text>
          </View>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>👑</Text>
            </View>
            <Text style={styles.sectionTitle}>Your Rights</Text>
          </View>
          <Text style={styles.paragraph}>
            Subject to applicable Indian laws, including the Digital Personal Data Protection Act, 2023:
          </Text>
          <View style={styles.rightsGrid}>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>👁️</Text>
              <Text style={styles.rightCardTitle}>Access</Text>
              <Text style={styles.rightCardText}>Request a copy of your data</Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>✏️</Text>
              <Text style={styles.rightCardTitle}>Correction</Text>
              <Text style={styles.rightCardText}>Fix inaccurate information</Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>🗑️</Text>
              <Text style={styles.rightCardTitle}>Deletion</Text>
              <Text style={styles.rightCardText}>Request data removal</Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>⏸️</Text>
              <Text style={styles.rightCardTitle}>Restriction</Text>
              <Text style={styles.rightCardText}>Limit data processing</Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>🚫</Text>
              <Text style={styles.rightCardTitle}>Objection</Text>
              <Text style={styles.rightCardText}>Object to marketing uses</Text>
            </View>
            <View style={styles.rightCard}>
              <Text style={styles.rightCardIcon}>📤</Text>
              <Text style={styles.rightCardTitle}>Portability</Text>
              <Text style={styles.rightCardText}>Export your data</Text>
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>🔐</Text>
            </View>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.securityBox}>
            <Text style={styles.securityText}>
              We implement industry-standard physical, electronic, and managerial safeguards to protect your information, including encryption for payment data and secure servers.
            </Text>
          </View>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              You are responsible for safeguarding your account credentials. Do not share your username or password with anyone.
            </Text>
          </View>
        </View>

        {/* Third-Party Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Text style={styles.sectionIcon}>🔗</Text>
            </View>
            <Text style={styles.sectionTitle}>Third-Party Links</Text>
          </View>
          <Text style={styles.paragraph}>
            Our Services may contain links to third-party websites or services. We are not responsible for their privacy practices or content. Please review their privacy policies before sharing information.
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactSectionHeader}>
            <Text style={styles.contactSectionIcon}>📧</Text>
            <Text style={styles.contactSectionTitle}>Contact Us</Text>
          </View>
          <Text style={styles.contactDescription}>
            For questions or concerns about this Privacy Policy or our data practices:
          </Text>
          <View style={styles.contactCard}>
            <View style={styles.contactDetail}>
              <Text style={styles.contactDetailLabel}>Email</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:info@farmferry.in')}>
                <Text style={styles.contactDetailValue}>info@farmferry.in</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactDetail}>
              <Text style={styles.contactDetailLabel}>Address</Text>
              <Text style={styles.contactDetailValue}>
                Sr. No 32/4, 3rd Floor Audumbar Nivya{'\n'}
                Near Canara Bank, Narhegaon{'\n'}
                Pune - 411041, India
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactDetail}>
              <Text style={styles.contactDetailLabel}>Response Time</Text>
              <Text style={styles.contactDetailValue}>Within 24-48 hours</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 34, // Added top margin
  },
  innerContainer: {
    padding: 12, // Reduced from 16 to make container smaller
    paddingBottom: 32, // Reduced from 40 to maintain consistency
  },
  
  // Header
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#ECFDF5',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerIconText: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  
  // Introduction Section
  introSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  introParagraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  contactLabel: {
    fontSize: 15,
    color: '#047857',
    fontWeight: '600',
  },
  contactLink: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#047857',
    flex: 1,
  },
  
  // Paragraph
  paragraph: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  
  // Highlight Box
  highlightBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginLeft: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
    marginTop: 8,
    marginRight: 10,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  
  // Warning Box
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    marginVertical: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Sub Section
  subSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subSectionDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 10,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#059669',
  },
  
  // Info Card
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardItem: {
    paddingVertical: 10,
  },
  infoCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  
  // Usage Grid
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  usageCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  usageCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  usageCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 6,
    textAlign: 'center',
  },
  usageCardText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Sharing
  sharingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  sharingIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sharingIcon: {
    fontSize: 18,
  },
  sharingContent: {
    flex: 1,
  },
  sharingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  sharingText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Important Note
  importantNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  importantNoteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  importantNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Rights Grid
  rightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rightCard: {
    width: '48%',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rightCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  rightCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  rightCardText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
  },
  
  // Security Box
  securityBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  
  // Contact Section
  contactSection: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  contactSectionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  contactSectionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  contactSectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactDescription: {
    fontSize: 15,
    color: '#D1FAE5',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  contactDetail: {
    paddingVertical: 12,
  },
  contactDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  contactDetailValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
});

export default PrivacyPolicy;