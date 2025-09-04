import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Car,
    ChevronLeft,
    Clock,
    MapPin,
    Plane,
    Shield,
    Users
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Your City, Your Ride',
    subtitle: 'Book rides across your city with just a few taps. Choose from a variety of vehicles to suit your needs.',
    icons: [
      { Icon: MapPin, color: '#00CED1' },
      { Icon: Car, color: '#22C55E' },
    ],
  },
  {
    id: 2,
    title: 'Wide Range of Services',
    subtitle: 'From quick city rides to airport transfers and hourly rentals, we\'ve got all your transportation needs covered.',
    icons: [
      { Icon: Plane, color: '#9C27B0' },
      { Icon: Car, color: '#22C55E' },
      { Icon: Clock, color: '#FF9800' },
      { Icon: Shield, color: '#4CAF50' },
      { Icon: Users, color: '#E91E63' },
    ],
  },
  {
    id: 3,
    title: 'Seamless Payments & Tracking',
    subtitle: 'Enjoy cashless payments and real-time tracking. Know exactly where your ride is and when it will arrive.',
    mapIllustration: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedRole } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    if (selectedRole === 'rider') {
      router.replace('(rider-tabs)');
    } else {
      router.replace('(driver-tabs)');
    }
  };

  const renderPage = (page: typeof onboardingData[0]) => {
    return (
      <View style={styles.pageContainer}>
        <View style={styles.pageHeader}>
          <Text style={[styles.pageNumber, { color: colorScheme.subtext }]}>
            {page.id} of {onboardingData.length}
          </Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: '#00CED1' }]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.illustrationContainer}>
          {page.mapIllustration ? (
            <View style={styles.mapContainer}>
              <View style={[styles.mapCard, { backgroundColor: colorScheme.card }]}>
                <View style={styles.mapRoute}>
                  <View style={[styles.startPoint, { backgroundColor: '#4CAF50' }]} />
                  <View style={styles.routeLine} />
                  <View style={[styles.endPoint, { backgroundColor: '#F44336' }]} />
                </View>
                <View style={[styles.checkmark, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.iconsContainer}>
              {page.icons?.map((iconData, index) => (
                <View
                  key={index}
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: `${iconData.color}20` },
                    index === 0 && styles.firstIcon,
                    index === 1 && styles.secondIcon,
                    index === 2 && styles.thirdIcon,
                    index === 3 && styles.fourthIcon,
                    index === 4 && styles.fifthIcon,
                  ]}
                >
                  <iconData.Icon size={24} color={iconData.color} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            {page.title}
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            {page.subtitle}
          </Text>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              { 
                backgroundColor: currentPage === 0 ? 'transparent' : colorScheme.card,
                borderColor: colorScheme.border 
              }
            ]}
            disabled={currentPage === 0}
          >
            <ChevronLeft 
              size={20} 
              color={currentPage === 0 ? colorScheme.subtext : colorScheme.text}
              style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
            />
          </TouchableOpacity>

          <Button
            title={currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: '#00CED1' }]}
          />
        </View>

        {/* Page indicators */}
        <View style={styles.indicatorsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentPage ? '#22C55E' : '#BBF7D0',
                  width: 8,
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      {renderPage(onboardingData[currentPage])}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconsContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  firstIcon: {
    top: 20,
    left: 70,
  },
  secondIcon: {
    top: 70,
    right: 20,
  },
  thirdIcon: {
    bottom: 70,
    right: 40,
  },
  fourthIcon: {
    bottom: 20,
    left: 20,
  },
  fifthIcon: {
    top: 40,
    left: 20,
  },
  mapContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCard: {
    width: 160,
    height: 120,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapRoute: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  startPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 5,
    marginVertical: 8,
  },
  endPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkmark: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});