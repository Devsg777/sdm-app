import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const colorScheme = isDark ? colors.dark : colors.light;
  
  // Initialize hooks at top level for all platforms
  const offset = useSharedValue(isDark ? 22 : 0);
  
  React.useEffect(() => {
    offset.value = withSpring(isDark ? 22 : 0);
  }, [isDark, offset]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  // Use regular animation for web to avoid layout animation issues
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: isDark ? colorScheme.card : colorScheme.card }
        ]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <View style={[
          styles.toggle,
          { 
            backgroundColor: colorScheme.primary,
            transform: [{ translateX: isDark ? 22 : 0 }]
          }
        ]}>
          {isDark ? (
            <Moon size={16} color={colorScheme.background} />
          ) : (
            <Sun size={16} color={colorScheme.background} />
          )}
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? colorScheme.card : colorScheme.card }
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.toggle,
          { backgroundColor: colorScheme.primary },
          animatedStyle
        ]}
      >
        {isDark ? (
          <Moon size={16} color={colorScheme.background} />
        ) : (
          <Sun size={16} color={colorScheme.background} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});