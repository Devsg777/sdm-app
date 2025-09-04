import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from './Button';

interface SchedulePickerProps {
  date?: Date;
  onDateTimeChange: (date: Date) => void;
  placeholder: string;
  minimumDate?: Date;
}

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  date,
  onDateTimeChange,
  placeholder,
  minimumDate = new Date(),
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(date || new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(date || new Date());
  const [dateMode, setDateMode] = useState<'quick' | 'calendar'>('quick');

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateOnly = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    // Combine selected date and time
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.getHours());
    combinedDateTime.setMinutes(selectedTime.getMinutes());
    
    onDateTimeChange(combinedDateTime);
    setShowPicker(false);
  };

  const handleQuickDateSelect = (type: 'today' | 'tomorrow') => {
    const newDate = new Date();
    if (type === 'tomorrow') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  // const handleTimeSelect = (hour: number, minute: number) => {
  //   const newTime = new Date();
  //   newTime.setHours(hour, minute, 0, 0);
  //   setSelectedTime(newTime);
  // };

  const adjustTime = (type: 'hour' | 'minute' | 'ampm', direction: 'up' | 'down') => {
    const newTime = new Date(selectedTime);
    
    if (type === 'hour') {
      const currentHour = newTime.getHours();
      if (direction === 'up') {
        newTime.setHours((currentHour + 1) % 24);
      } else {
        newTime.setHours(currentHour === 0 ? 23 : currentHour - 1);
      }
    } else if (type === 'minute') {
      const currentMinute = newTime.getMinutes();
      if (direction === 'up') {
        newTime.setMinutes((currentMinute + 15) % 60);
      } else {
        newTime.setMinutes(currentMinute === 0 ? 45 : currentMinute - 15);
      }
    } else if (type === 'ampm') {
      const currentHour = newTime.getHours();
      if (currentHour >= 12) {
        newTime.setHours(currentHour - 12);
      } else {
        newTime.setHours(currentHour + 12);
      }
    }
    
    setSelectedTime(newTime);
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isPast = currentDate < minimumDate;
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // const timeSlots = [
  //   { hour: 6, minute: 0, label: '06' },
  //   { hour: 7, minute: 0, label: '07' },
  //   { hour: 8, minute: 0, label: '08' },
  //   { hour: 9, minute: 0, label: '09' },
  //   { hour: 10, minute: 0, label: '10' },
  //   { hour: 15, minute: 0, label: '15' },
  //   { hour: 20, minute: 0, label: '20' },
  // ];

  const ScheduleModal = () => (
    <Modal
      visible={showPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colorScheme.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colorScheme.text }]}>
              Schedule
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={styles.closeButton}
            >
              <X size={24} color={colorScheme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                Select date
              </Text>
              
              <View style={styles.quickDateContainer}>
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { 
                      backgroundColor: dateMode === 'quick' && selectedDate.toDateString() === new Date().toDateString() 
                        ? colorScheme.surface 
                        : 'transparent',
                      borderColor: colorScheme.border
                    }
                  ]}
                  onPress={() => {
                    setDateMode('quick');
                    handleQuickDateSelect('today');
                  }}
                >
                  <Text style={[styles.quickDateText, { color: colorScheme.text }]}>
                    Today
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { 
                      backgroundColor: dateMode === 'quick' && selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString() 
                        ? colorScheme.surface 
                        : 'transparent',
                      borderColor: colorScheme.border
                    }
                  ]}
                  onPress={() => {
                    setDateMode('quick');
                    handleQuickDateSelect('tomorrow');
                  }}
                >
                  <Text style={[styles.quickDateText, { color: colorScheme.text }]}>
                    Tomorrow
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.quickDateButton,
                    { 
                      backgroundColor: dateMode === 'calendar' ? colorScheme.surface : 'transparent',
                      borderColor: colorScheme.border
                    }
                  ]}
                  onPress={() => setDateMode('calendar')}
                >
                  <Text style={[styles.quickDateText, { color: colorScheme.text }]}>
                    Select Date
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Calendar View */}
              {dateMode === 'calendar' && (
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth('prev')}>
                      <Text style={[styles.navButton, { color: colorScheme.text }]}>‹</Text>
                    </TouchableOpacity>
                    <Text style={[styles.monthYear, { color: colorScheme.text }]}>
                      {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth('next')}>
                      <Text style={[styles.navButton, { color: colorScheme.text }]}>›</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.weekDaysContainer}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <Text key={day} style={[styles.weekDay, { color: colorScheme.subtext }]}>
                        {day}
                      </Text>
                    ))}
                  </View>
                  
                  <View style={styles.calendarGrid}>
                    {generateCalendarDays().map((dayInfo, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          {
                            backgroundColor: dayInfo.isSelected ? colorScheme.primary : 'transparent',
                          }
                        ]}
                        onPress={() => !dayInfo.isPast && setSelectedDate(dayInfo.date)}
                        disabled={dayInfo.isPast}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            {
                              color: dayInfo.isPast 
                                ? colorScheme.subtext 
                                : dayInfo.isSelected 
                                  ? '#fff' 
                                  : dayInfo.isCurrentMonth 
                                    ? colorScheme.text 
                                    : colorScheme.subtext
                            }
                          ]}
                        >
                          {dayInfo.day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                Select time
              </Text>
              
              <View style={styles.timePickerContainer}>
                <View style={styles.timePickerRow}>
                  {/* Hour Picker */}
                  <View style={styles.timeColumn}>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('hour', 'up')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▲</Text>
                    </TouchableOpacity>
                    <View style={[styles.timeDisplay, { backgroundColor: colorScheme.primary }]}>
                      <Text style={[styles.timeDisplayText, { color: '#fff' }]}>
                        {(selectedTime.getHours() % 12 || 12).toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('hour', 'down')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Minute Picker */}
                  <View style={styles.timeColumn}>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('minute', 'up')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▲</Text>
                    </TouchableOpacity>
                    <View style={[styles.timeDisplay, { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }]}>
                      <Text style={[styles.timeDisplayText, { color: colorScheme.text }]}>
                        {selectedTime.getMinutes().toString().padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('minute', 'down')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* AM/PM Picker */}
                  <View style={styles.timeColumn}>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('ampm', 'up')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▲</Text>
                    </TouchableOpacity>
                    <View style={[styles.timeDisplay, { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }]}>
                      <Text style={[styles.timeDisplayText, { color: colorScheme.text }]}>
                        {selectedTime.getHours() >= 12 ? 'PM' : 'AM'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.timeArrow}
                      onPress={() => adjustTime('ampm', 'down')}
                    >
                      <Text style={[styles.arrowText, { color: colorScheme.primary }]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <Button
              title={formatDateOnly(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes()))}
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.scheduleButton,
          { 
            borderColor: colorScheme.border,
            backgroundColor: colorScheme.surface
          }
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Calendar size={20} color={colorScheme.primary} />
        <Text style={[
          styles.scheduleText, 
          { color: date ? colorScheme.text : colorScheme.subtext }
        ]}>
          {date ? formatDateTime(date) : placeholder}
        </Text>
      </TouchableOpacity>
      
      <ScheduleModal />
    </>
  );
};

const styles = StyleSheet.create({
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  scheduleText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickDateButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calendarContainer: {
    marginTop: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timePickerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 8,
  },
  timeArrow: {
    padding: 8,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeDisplay: {
    width: 50,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  recommendationContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: 8,
  },
});