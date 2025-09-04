import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  intensity?: number; // blur intensity
  tint?: 'default' | 'light' | 'dark' | 'accent';
  elevated?: boolean; // outer shadow glow
  edge?: 'subtle' | 'accent' | 'none'; // inner highlight edge
  style?: any;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 70,
  tint = 'default',
  elevated = true,
  edge = 'subtle',
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const getTintColor = () => {
    switch (tint) {
      case 'light':
        return 'rgba(255, 255, 255, 0.7)';
      case 'dark':
        return 'rgba(18, 18, 18, 0.6)';
      case 'accent':
        return theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.10)';
      default:
        return theme === 'dark' ? 'rgba(22, 22, 22, 0.6)' : 'rgba(255, 255, 255, 0.7)';
    }
  };

  const outerShadow = elevated ? (theme === 'dark' ? styles.shadowDark : styles.shadowLight) : null;

  // Web fallback (no blur on some browsers)
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: getTintColor(),
            borderColor: 'rgba(255,255,255,0.25)',
          },
          outerShadow,
          style,
        ]}
        {...props}
      >
        {/* Inner edge highlight */}
        {edge !== 'none' && (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.edgeLayer]}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.35)',
                'rgba(255,255,255,0.12)',
                'rgba(0,0,0,0.05)',
                'rgba(0,0,0,0.12)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.edgeGradient}
            />
            {edge === 'accent' && (
              <LinearGradient
                colors={['rgba(34,197,94,0.25)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.accentEdge}
              />
            )}
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={theme === 'dark' ? 'dark' : 'light'}
      style={[
        styles.container,
        { borderColor: 'rgba(255,255,255,0.25)' },
        outerShadow,
        style,
      ]}
      {...props}
    >
      {/* Subtle glass gradient wash */}
      <LinearGradient
        colors={[getTintColor(), 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Inner edge highlights for glassy depth */}
      {edge !== 'none' && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.edgeLayer]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.35)',
              'rgba(255,255,255,0.12)',
              'rgba(0,0,0,0.05)',
              'rgba(0,0,0,0.12)'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.edgeGradient}
          />
          {edge === 'accent' && (
            <LinearGradient
              colors={['rgba(34,197,94,0.25)', 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.accentEdge}
            />
          )}
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  edgeLayer: {
    borderRadius: 20,
  },
  edgeGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  accentEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  shadowLight: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  shadowDark: {
    shadowColor: 'rgba(0, 0, 0, 0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
});