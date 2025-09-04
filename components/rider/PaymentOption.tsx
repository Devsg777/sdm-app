import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Banknote, CreditCard, Smartphone } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface PaymentOptionProps {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

export const PaymentOption: React.FC<PaymentOptionProps> = ({
  title,
  subtitle,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const getIcon = () => {
    if (title.includes('Card')) {
      return <CreditCard size={24} color={colorScheme.primary} />;
    } else if (title.includes('Cash')) {
      return <Banknote size={24} color={colorScheme.primary} />;
    } else {
      return <Smartphone size={24} color={colorScheme.primary} />;
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <GlassCard
        style={[
          styles.card,
          isSelected && { 
            borderColor: colorScheme.primary, 
            borderWidth: 2,
            backgroundColor: 'rgba(0, 255, 0, 0.1)'
          }
        ]}
        intensity={isSelected ? 80 : 50}
      >
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            {subtitle}
          </Text>
        </View>
        
        <View style={[
          styles.radioButton,
          { borderColor: colorScheme.border },
          isSelected && { backgroundColor: colorScheme.primary }
        ]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});