import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  mode: 'date' | 'time' | 'datetime';
  placeholder: string;
  minimumDate?: Date;
}

export const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  onDateChange,
  mode,
  placeholder,
  minimumDate,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempDate(selectedDate);
      } else {
        onDateChange(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(date || new Date());
    setShowPicker(false);
  };

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } else if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      // datetime mode
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const renderPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colorScheme.text }]}>
                  Select {mode === 'date' ? 'Date' : mode === 'time' ? 'Time' : 'Date & Time'}
                </Text>
              </View>
              
              <DateTimePicker
                value={tempDate}
                mode={mode === 'datetime' ? 'datetime' : mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                textColor={colorScheme.text}
                style={styles.picker}
              />
              
              <View style={styles.pickerButtons}>
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outlined"
                  style={styles.pickerButton}
                />
                <Button
                  title="Confirm"
                  onPress={handleConfirm}
                  style={styles.pickerButton}
                />
              </View>
            </GlassCard>
          </View>
        </Modal>
      );
    }

    return showPicker ? (
      <DateTimePicker
        value={tempDate}
        mode={mode === 'datetime' ? 'datetime' : mode}
        display="default"
        onChange={handleDateChange}
        minimumDate={minimumDate}
      />
    ) : null;
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dateTimeButton,
          { borderColor: colorScheme.border }
        ]}
        onPress={() => setShowPicker(true)}
      >
        {mode === 'date' ? (
          <Calendar size={20} color={colorScheme.primary} />
        ) : mode === 'time' ? (
          <Clock size={20} color={colorScheme.primary} />
        ) : (
          <Calendar size={20} color={colorScheme.primary} />
        )}
        <Text style={[
          styles.dateTimeText, 
          { color: date ? colorScheme.text : colorScheme.subtext }
        ]}>
          {date ? formatDate(date) : placeholder}
        </Text>
      </TouchableOpacity>
      
      {renderPicker()}
    </>
  );
};

const styles = StyleSheet.create({
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
  },
  pickerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  picker: {
    height: 200,
    marginBottom: 20,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});