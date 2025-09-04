import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  CreditCard,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Shield,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function SupportScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const supportOptions = [
    {
      id: '1',
      title: 'Call Support',
      description: '24/7 phone support',
      icon: <Phone size={24} color="#22C55E" />,
      backgroundColor: '#22C55E20',
      action: () => handleCallSupport(),
    },
    {
      id: '2',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: <MessageCircle size={24} color="#3B82F6" />,
      backgroundColor: '#3B82F620',
      action: () => handleLiveChat(),
    },
    {
      id: '3',
      title: 'Email Support',
      description: 'Send us an email',
      icon: <Mail size={24} color="#8B5CF6" />,
      backgroundColor: '#8B5CF620',
      action: () => handleEmailSupport(),
    },
  ];

  const helpTopics = [
    {
      id: '1',
      title: 'Account & Profile',
      icon: <User size={24} color={colorScheme.primary} />,
      action: () => handleHelpTopic('account'),
    },
    {
      id: '2',
      title: 'Booking & Rides',
      icon: <MessageCircle size={24} color={colorScheme.primary} />,
      action: () => handleHelpTopic('booking'),
    },
    {
      id: '3',
      title: 'Payments & Billing',
      icon: <CreditCard size={24} color={colorScheme.primary} />,
      action: () => handleHelpTopic('payments'),
    },
    {
      id: '4',
      title: 'Safety & Security',
      icon: <Shield size={24} color={colorScheme.primary} />,
      action: () => handleHelpTopic('safety'),
    },
  ];

  const faqData = [
    {
      id: '1',
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride by going to your active booking and tapping the "Cancel Ride" button. Please note that cancellation fees may apply depending on the timing of your cancellation.',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, digital wallets like Apple Pay and Google Pay, UPI payments, and cash payments in select locations.',
    },
    {
      id: '3',
      question: 'How is the fare calculated?',
      answer: 'Fares are calculated based on distance, time, demand, and local rates. You can see the estimated fare before booking your ride. Additional charges may apply for tolls, airport fees, or surge pricing.',
    },
    {
      id: '4',
      question: 'What if I forget something in the car?',
      answer: 'Contact support immediately through the app or call our lost and found hotline. We will help you connect with your driver to retrieve your items. Please provide details about the item and your trip.',
    },
    {
      id: '5',
      question: 'How do I change my pickup location?',
      answer: 'You can change your pickup location before the driver arrives by tapping on the pickup address in your booking screen and selecting a new location.',
    },
    {
      id: '6',
      question: 'What should I do if my driver is late?',
      answer: 'If your driver is running late, you can track their location in real-time through the app. If they are significantly delayed, you can contact them directly or cancel the ride without penalty.',
    },
    {
      id: '7',
      question: 'How do I report a safety concern?',
      answer: 'Your safety is our priority. You can report safety concerns through the app\'s safety center, call our emergency hotline, or use the in-app emergency button during your ride.',
    },
    {
      id: '8',
      question: 'Can I schedule a ride in advance?',
      answer: 'Yes, you can schedule rides up to 30 days in advance. Simply select "Schedule for later" when booking and choose your preferred date and time.',
    },
  ];

  const handleCallSupport = () => {
    const phoneNumber = '+1-800-SUPPORT';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleLiveChat = () => {
    // In a real app, this would open a chat interface
    Alert.alert('Live Chat', 'Live chat feature will be available soon!');
  };

  const handleEmailSupport = () => {
    const email = 'support@cabapp.com';
    const subject = 'Support Request';
    Linking.openURL(`mailto:${email}?subject=${subject}`).catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const handleHelpTopic = (topic: string) => {
    // In a real app, this would navigate to specific help sections
    Alert.alert('Help Topic', `Opening ${topic} help section...`);
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Support',
      'Call emergency support line?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL('tel:+1-911-EMERGENCY')
        }
      ]
    );
  };

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SupportOption = ({ option }: { option: typeof supportOptions[0] }) => (
    <TouchableOpacity onPress={option.action}>
      <GlassCard style={styles.optionCard}>
        <View style={styles.optionContent}>
          <View style={[styles.optionIcon, { backgroundColor: option.backgroundColor }]}>
            {option.icon}
          </View>
          <View style={styles.optionText}>
            <Text style={[styles.optionTitle, { color: colorScheme.text }]}>
              {option.title}
            </Text>
            <Text style={[styles.optionDescription, { color: colorScheme.subtext }]}>
              {option.description}
            </Text>
          </View>
          <ChevronRight size={20} color={colorScheme.subtext} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const HelpTopic = ({ topic }: { topic: typeof helpTopics[0] }) => (
    <TouchableOpacity style={styles.helpTopicContainer} onPress={topic.action}>
      <GlassCard style={styles.helpTopicCard}>
        <View style={styles.helpTopicContent}>
          <View style={[styles.helpTopicIcon, { backgroundColor: colorScheme.primary + '20' }]}>
            {topic.icon}
          </View>
          <Text style={[styles.helpTopicTitle, { color: colorScheme.text }]}>
            {topic.title}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const FAQItem = ({ item }: { item: typeof faqData[0] }) => (
    <TouchableOpacity
      style={[styles.faqItem, { backgroundColor: colorScheme.card }]}
      onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colorScheme.text }]}>
          {item.question}
        </Text>
        <ChevronRight 
          size={20} 
          color={colorScheme.subtext}
          style={[
            styles.faqChevron,
            expandedFAQ === item.id && styles.faqChevronExpanded
          ]}
        />
      </View>
      {expandedFAQ === item.id && (
        <Text style={[styles.faqAnswer, { color: colorScheme.subtext }]}>
          {item.answer}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[
        colorScheme.background,
        colorScheme.background,
      ]}
      style={styles.container}
    >
      {/* Header */}
     

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Get in Touch Section */}
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          Get in Touch
        </Text>
        
        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <SupportOption key={option.id} option={option} />
          ))}
        </View>

        {/* Browse Help Topics Section */}
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          Browse Help Topics
        </Text>
        
        <View style={styles.helpTopicsGrid}>
          {helpTopics.map((topic) => (
            <HelpTopic key={topic.id} topic={topic} />
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          Frequently Asked Questions
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colorScheme.card, borderColor: colorScheme.border }]}>
          <Search size={20} color={colorScheme.subtext} />
          <TextInput
            style={[styles.searchInput, { color: colorScheme.text }]}
            placeholder="Search for help..."
            placeholderTextColor={colorScheme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FAQ Items */}
        <View style={styles.faqContainer}>
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colorScheme.subtext }]}>
                No results found for &quot;{searchQuery}&quot;
              </Text>
            </View>
          )}
        </View>

        {/* Emergency Support */}
        <TouchableOpacity onPress={handleEmergencyCall}>
          <GlassCard style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Phone size={24} color={colors.light.error} />
              <Text style={[styles.emergencyTitle, { color: colors.light.error }]}>
                Emergency Support
              </Text>
            </View>
            <Text style={[styles.emergencyText, { color: colorScheme.text }]}>
              Call +1 911 24/7 Emergency Line
            </Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
    position: 'absolute',
    right: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
  helpTopicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  helpTopicContainer: {
    width: (screenWidth - 52) / 2, // Account for padding and gap
  },
  helpTopicCard: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
  },
  helpTopicContent: {
    alignItems: 'center',
  },
  helpTopicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTopicTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  faqContainer: {
    gap: 8,
    marginBottom: 24,
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emergencyCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});