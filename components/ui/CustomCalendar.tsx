import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CustomCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  minimumDate?: Date;
  title?: string;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  minimumDate = new Date(),
  title = 'Select Date'
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: prevMonthDate < minimumDate
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = date < minimumDate;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDate = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: nextMonthDate < minimumDate
      });
    }
    
    return days;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const handleDatePress = (dayInfo: any) => {
    if (dayInfo.isDisabled) return;
    
    onDateSelect(dayInfo.date);
    onClose();
  };
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.calendarContainer, { backgroundColor: colorScheme.card }]}>
          {/* Header */}
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarTitle, { color: colorScheme.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={20} color={colorScheme.text} />
            </TouchableOpacity>
            
            <Text style={[styles.monthYear, { color: colorScheme.text }]}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          {/* Day Names */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Text style={[styles.dayNameText, { color: colorScheme.subtext }]}>
                  {dayName}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((dayInfo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  dayInfo.isSelected && { backgroundColor: '#22C55E' },
                  dayInfo.isToday && !dayInfo.isSelected && { backgroundColor: colorScheme.success + '20' },
                  dayInfo.isDisabled && { opacity: 0.3 }
                ]}
                onPress={() => handleDatePress(dayInfo)}
                disabled={dayInfo.isDisabled}
              >
                <Text style={[
                  styles.dayText,
                  { color: dayInfo.isCurrentMonth ? colorScheme.text : colorScheme.subtext },
                  dayInfo.isSelected && { color: '#FFFFFF', fontWeight: 'bold' },
                  dayInfo.isToday && !dayInfo.isSelected && { color: '#22C55E', fontWeight: 'bold' }
                ]}>
                  {dayInfo.date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: screenWidth - 40,
    maxWidth: 350,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
  },
});