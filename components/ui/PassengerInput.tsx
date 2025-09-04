import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { PassengerInfo } from '@/types';
import { User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassCard } from './GlassCard';

interface PassengerInputProps {
  index: number;
  passenger: PassengerInfo;
  onChange: (index: number, passenger: PassengerInfo) => void;
}

export const PassengerInput: React.FC<PassengerInputProps> = ({
  index,
  passenger,
  onChange,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const handleChange = (field: keyof PassengerInfo, value: string | number) => {
    onChange(index, { ...passenger, [field]: value });
  };
  
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <User size={20} color={colorScheme.primary} />
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Passenger {index + 1}
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              color: colorScheme.text,
              borderColor: colorScheme.border,
            }
          ]}
          placeholder="Full Name"
          placeholderTextColor={colorScheme.subtext}
          value={passenger.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        
        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              { 
                color: colorScheme.text,
                borderColor: colorScheme.border,
              }
            ]}
            placeholder="Age"
            placeholderTextColor={colorScheme.subtext}
            value={passenger.age ? passenger.age.toString() : ''}
            onChangeText={(text) => handleChange('age', parseInt(text) || 0)}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[
              styles.input,
              styles.halfInput,
              { 
                color: colorScheme.text,
                borderColor: colorScheme.border,
              }
            ]}
            placeholder="Phone Number"
            placeholderTextColor={colorScheme.subtext}
            value={passenger.phone}
            onChangeText={(text) => handleChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
});