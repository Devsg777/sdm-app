import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colorScheme.success }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>{label}</Text>
    </View>
  );
};

export const StatsBar: React.FC = () => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <View style={[styles.container]}>
      <StatItem value="50K+" label="Customers" />
      <StatItem value="4.8" label="Average Rating" />
      <StatItem value="24/7" label="Available" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 0,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853', // This will be overridden in the component
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
});