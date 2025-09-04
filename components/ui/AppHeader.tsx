import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { User } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AppHeaderProps {
  title: string;
  onMenuPress: () => void;
  showMenu?: boolean;
}

export function AppHeader({ title, onMenuPress, showMenu = true }: AppHeaderProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const { user } = useAuth();

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMenuPress();
  };



  return (
    <View style={[styles.header, { backgroundColor: 'transparent' }]}>
      {showMenu ? (
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)' }]}> 
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : user?.name ? (
              <Text style={[styles.avatarInitial, { color: colorScheme.text }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <User size={22} color={colorScheme.text} />
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.menuButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 6,
    borderBottomWidth: 0,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
    width: 44,
    marginLeft: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
});