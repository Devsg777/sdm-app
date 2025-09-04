import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Calendar, CreditCard, Download, Filter } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BillingItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
}

const mockBillingHistory: BillingItem[] = [
  {
    id: '1',
    date: '2025-01-08',
    description: 'Airport Transfer - Downtown to JFK',
    amount: 45.50,
    status: 'paid',
    paymentMethod: 'Credit Card ****1234',
  },
  {
    id: '2',
    date: '2025-01-07',
    description: 'City Ride - Mall to Home',
    amount: 18.75,
    status: 'paid',
    paymentMethod: 'PayPal',
  },
  {
    id: '3',
    date: '2025-01-06',
    description: 'Outstation Trip - City to Beach Resort',
    amount: 125.00,
    status: 'pending',
    paymentMethod: 'Credit Card ****5678',
  },
  {
    id: '4',
    date: '2025-01-05',
    description: 'Hourly Rental - 4 hours',
    amount: 80.00,
    status: 'paid',
    paymentMethod: 'Debit Card ****9012',
  },
  {
    id: '5',
    date: '2025-01-04',
    description: 'City Ride - Office to Restaurant',
    amount: 22.30,
    status: 'failed',
    paymentMethod: 'Credit Card ****1234',
  },
];

export default function BillingHistoryScreen() {
  // const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colorScheme.success;
      case 'pending':
        return colorScheme.warning;
      case 'failed':
        return colorScheme.error;
      default:
        return colorScheme.subtext;
    }
  };
  
  const totalAmount = mockBillingHistory
    .filter(item => item.status === 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          title: 'Billing History',
          headerBackTitle: '',
          headerRight: () => (
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={24} color={colorScheme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GlassCard style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colorScheme.text }]}>
            Total Spent This Month
          </Text>
          <Text style={[styles.summaryAmount, { color: colorScheme.primary }]}>
            ${totalAmount.toFixed(2)}
          </Text>
          <Text style={[styles.summarySubtext, { color: colorScheme.subtext }]}>
            {mockBillingHistory.filter(item => item.status === 'paid').length} completed trips
          </Text>
        </GlassCard>
        
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colorScheme.text }]}>
            Transaction History
          </Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Download size={20} color={colorScheme.primary} />
            <Text style={[styles.downloadText, { color: colorScheme.primary }]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
        
        {mockBillingHistory.map((item) => (
          <GlassCard key={item.id} style={styles.billingItem}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemDescription, { color: colorScheme.text }]}>
                  {item.description}
                </Text>
                <View style={styles.itemMeta}>
                  <Calendar size={14} color={colorScheme.subtext} />
                  <Text style={[styles.itemDate, { color: colorScheme.subtext }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.itemMeta}>
                  <CreditCard size={14} color={colorScheme.subtext} />
                  <Text style={[styles.itemPayment, { color: colorScheme.subtext }]}>
                    {item.paymentMethod}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemAmount}>
                <Text style={[styles.amount, { color: colorScheme.text }]}>
                  ₹{item.amount.toFixed(2)}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  filterButton: {
    padding: 8,
  },
  summaryCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  billingItem: {
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemDate: {
    marginLeft: 6,
    fontSize: 12,
  },
  itemPayment: {
    marginLeft: 6,
    fontSize: 12,
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});