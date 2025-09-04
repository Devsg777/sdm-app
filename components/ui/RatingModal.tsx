import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitRating: (rating: number, review?: string) => void;
}

export function RatingModal({ visible, onClose, onSubmitRating }: RatingModalProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarPress = (starRating: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRating(starRating);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onSubmitRating(rating, review.trim() || undefined);
    
    // Reset form
    setRating(0);
    setReview('');
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    // Reset form
    setRating(0);
    setReview('');
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Rate your experience';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <GlassCard style={[styles.modalContent, { backgroundColor: colorScheme.surface }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colorScheme.text }]}>
                Rate Your Ride
              </Text>
              <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
                <X size={20} color={colorScheme.subtext} />
              </TouchableOpacity>
            </View>

            {/* Driver Info */}
            <View style={styles.driverSection}>
              <View style={[styles.driverAvatar, { backgroundColor: '#FFB74D' }]}>
                <Text style={styles.driverInitial}>S</Text>
              </View>
              <Text style={[styles.driverName, { color: colorScheme.text }]}>
                How was your ride with Sarah?
              </Text>
            </View>

            {/* Star Rating */}
            <View style={styles.ratingSection}>
              <Text style={[styles.ratingTitle, { color: colorScheme.text }]}>
                {getRatingText()}
              </Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    onPressIn={() => setHoveredRating(star)}
                    onPressOut={() => setHoveredRating(0)}
                    style={styles.starButton}
                  >
                    <Star
                      size={36}
                      color={star <= (hoveredRating || rating) ? '#FFD700' : '#E0E0E0'}
                      fill={star <= (hoveredRating || rating) ? '#FFD700' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review Input */}
            {rating > 0 && (
              <View style={styles.reviewSection}>
                <Text style={[styles.reviewLabel, { color: colorScheme.text }]}>
                  Share your feedback (optional)
                </Text>
                <TextInput
                  style={[
                    styles.reviewInput,
                    {
                      borderColor: colorScheme.border,
                      backgroundColor: colorScheme.background,
                      color: colorScheme.text,
                    },
                  ]}
                  placeholder="Tell us about your experience..."
                  placeholderTextColor={colorScheme.subtext}
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={[styles.characterCount, { color: colorScheme.subtext }]}>
                  {review.length}/200
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {rating > 0 ? (
                <Button
                  title="Submit Rating"
                  onPress={handleSubmit}
                  style={[styles.submitButton, { backgroundColor: colorScheme.primary }]}
                />
              ) : (
                <Text style={[styles.instruction, { color: colorScheme.subtext }]}>
                  Tap a star to rate your experience
                </Text>
              )}
              
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colorScheme.subtext }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tips Section */}
            {rating >= 4 && (
              <View style={styles.tipsSection}>
                <Text style={[styles.tipsTitle, { color: colorScheme.text }]}>
                  🎉 Great experience!
                </Text>
                <Text style={[styles.tipsText, { color: colorScheme.subtext }]}>
                  Consider adding a tip to show appreciation
                </Text>
                <View style={styles.tipButtons}>
                  {[10, 20, 30].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[styles.tipButton, { borderColor: colorScheme.border }]}
                    >
                      <Text style={[styles.tipButtonText, { color: colorScheme.text }]}>
                        ₹{amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    padding: 24,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  driverInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  driverName: {
    fontSize: 16,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    paddingVertical: 14,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
  },
  tipsSection: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  tipButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  tipButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});