import { ServiceCard } from '@/components/rider/ServiceCard';
import { StatsBar } from '@/components/rider/StatsBar';
import { AppHeader } from '@/components/ui/AppHeader';
import { DrawerMenu } from '@/components/ui/DrawerMenu';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ServicesScreen() {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDrawerVisible(true);
  };
  
  return (
    <>
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        <AppHeader 
          title="Services" 
          onMenuPress={handleMenuPress}
        />
        
        <LinearGradient
          colors={[
            theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
            theme === 'dark' ? '#121212' : '#ffffff',
          ]}
          style={styles.gradientContainer}
        >
          {/* Fixed header section */}
          <View style={[styles.headerSection, { backgroundColor: theme === 'dark' ? '#121212' : '#f0f0f0' }]}>
            <Text style={[styles.title, { color: colorScheme.text }]}>
              Choose Your Ride
            </Text>
            
            <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
              Premium services tailored for your needs
            </Text>
            
            <StatsBar />
          </View>
          
          {/* Scrollable services section */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.servicesContainer}>
              <ServiceCard
                type="city"
                title="City Ride"
                description="Quick and safe rides within the city with GPS tracking"
                price="8/km"
                duration="30 min"
                features={["Instant Booking", "GPS Tracking", "Safe & Secure"]}
              />
              
              <ServiceCard
                type="airport"
                title="Airport Taxi"
                description="Comfortable rides to and from the airport with flight tracking"
                price="299"
                duration="45 min"
                features={["24/7 Available", "Flight Tracking", "Meet & Greet"]}
              />
              
              <ServiceCard
                type="outstation"
                title="Outstation"
                description="Long distance travel made comfortable with experienced drivers"
                price="12/km"
                duration="Full Day"
                features={["AC Vehicle", "Experienced Driver", "Fuel Included"]}
              />
              
              <ServiceCard
                type="hourly"
                title="Hourly Rental"
                description="Rent a car by the hour for multiple stops with flexible timing"
                price="150/hr"
                duration="Flexible"
                features={["Multiple Stops", "Wait Time Included", "Flexible Hours"]}
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </View>

      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  servicesContainer: {
    marginTop: 0,
    marginBottom: 16,
  },
});