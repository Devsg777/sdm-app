import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const getContainerStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colorScheme.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };

    // Check if custom backgroundColor is provided in style (supports array)
    const customBgColor = (() => {
      const stylesArray = Array.isArray(style) ? style : [style];
      for (const s of stylesArray) {
        if (s && typeof s === 'object' && 'backgroundColor' in s && (s as any).backgroundColor) {
          return (s as any).backgroundColor as string;
        }
      }
      return null;
    })();

    switch (variant) {
      case 'outlined':
      case 'ghost':
        return {
          ...baseStyle,
          color: colorScheme.primary,
        };
      default:
        // Use white text for custom dark backgrounds, otherwise use theme default
        if (customBgColor === '#000000' || customBgColor === 'black') {
          return {
            ...baseStyle,
            color: '#FFFFFF',
          };
        }
        return {
          ...baseStyle,
          color: theme === 'dark' ? colors.dark.background : colors.light.background,
        };
    }
  };

  const renderContent = () => (
    <>
      {leftIcon && <>{leftIcon}</>}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'filled' 
            ? (theme === 'dark' ? colors.dark.background : colors.light.background) 
            : colorScheme.primary
          } 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
      {rightIcon && <>{rightIcon}</>}
    </>
  );

  if (variant === 'filled') {
    // Check if custom backgroundColor is provided in style (supports array)
    const customBgColor = (() => {
      const stylesArray = Array.isArray(style) ? style : [style];
      for (const s of stylesArray) {
        if (s && typeof s === 'object' && 'backgroundColor' in s && (s as any).backgroundColor) {
          return (s as any).backgroundColor as string;
        }
      }
      return null;
    })();
    
    if (customBgColor) {
      // Use solid color background instead of gradient
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          style={[getContainerStyle(), style]}
          activeOpacity={0.8}
          {...props}
        >
          {renderContent()}
        </TouchableOpacity>
      );
    }
    
    // Strip backgroundColor from style array/obj to let gradient show
    const styleWithoutBg = (() => {
      if (!style) return { backgroundColor: 'transparent' };
      const stylesArray = Array.isArray(style) ? style : [style];
      const cleaned = stylesArray.map((s) => {
        if (s && typeof s === 'object' && 'backgroundColor' in s) {
          const { backgroundColor, ...rest } = s as any;
          return rest as any;
        }
        return s as any;
      });
      return cleaned;
    })();

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getContainerStyle(), { backgroundColor: 'transparent' }, styleWithoutBg]}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={[
            theme === 'dark' ? colors.dark.primary : colors.light.primary,
            theme === 'dark' ? 'rgba(34,197,94,0.85)' : 'rgba(34,197,94,0.75)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheen}
          />
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const sizeStyles = {
  small: {
    height: 36,
    paddingHorizontal: 12,
  },
  medium: {
    height: 48,
    paddingHorizontal: 16,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
  },
};

const textSizeStyles = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});