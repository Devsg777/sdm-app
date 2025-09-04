import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

// Subtle, performant EV-themed animated background
// - Uses a few animated gradient layers and floating particles
// - Pointer events disabled so it never blocks touches
// - Works in both light/dark themes by inheriting parent opacity

interface EVBackgroundProps {
  intensity?: number; // 0..1 opacity scaling
  speed?: number; // animation speed multiplier
  variant?: 'subtle' | 'dynamic';
}

const { width, height } = Dimensions.get('window');

export const EVBackground: React.FC<EVBackgroundProps> = ({ intensity = 0.6, speed = 1, variant = 'subtle' }) => {
  const rotateA = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateA, {
        toValue: 1,
        duration: 24000 / speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -20, duration: 6000 / speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 6000 / speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: 15, duration: 7000 / speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -15, duration: 7000 / speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [rotateA, translateY, translateX, speed]);

  const spin = rotateA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const Layer = ({ colors, opacity = 1, scale = 1.2 }: { colors: string[]; opacity?: number; scale?: number }) => (
    <Animated.View
      style={[
        styles.gradientLayer,
        {
          transform: [{ rotate: spin }, { translateY }, { translateX }, { scale }],
          opacity: intensity * opacity,
        },
      ]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill} />
    </Animated.View>
  );

  // Colors chosen to align with an EV/eco feel while preserving monochrome primary text
  // teal/green/blue accents are very low opacity and sit behind content
  const paletteSubtle = [
    ['rgba(16,185,129,0.30)', 'rgba(59,130,246,0.10)'], // emerald to blue
    ['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.00)'],
    ['rgba(59,130,246,0.12)', 'rgba(59,130,246,0.00)'],
  ];

  const paletteDynamic = [
    ['rgba(16,185,129,0.35)', 'rgba(59,130,246,0.18)'],
    ['rgba(16,185,129,0.18)', 'rgba(16,185,129,0.04)'],
    ['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.04)'],
  ];

  const palette = variant === 'dynamic' ? paletteDynamic : paletteSubtle;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Layer colors={palette[0]} opacity={1} scale={1.25} />
      <Layer colors={palette[1]} opacity={0.8} scale={1.05} />
      <Layer colors={palette[2]} opacity={0.7} scale={1.15} />

      {/* Floating particles (very few, very light for perf) */}
      {[...Array(8)].map((_, i) => {
        const offsetX = (i * (width / 8)) % width;
        const delay = (i % 4) * 1200;
        const particleY = new Animated.Value(0);
        useEffect(() => {
          const loop = Animated.loop(
            Animated.sequence([
              Animated.timing(particleY, { toValue: -20, duration: 6000 + delay, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
              Animated.timing(particleY, { toValue: 0, duration: 6000 + delay, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
          );
          loop.start();
          return () => loop.stop();
        }, [particleY]);
        return (
          <Animated.View
            key={`p-${i}`}
            style={[
              styles.particle,
              {
                transform: [{ translateY: particleY }],
                left: offsetX,
                top: (i % 2 === 0 ? height * 0.25 : height * 0.6) + (i * 8) % 20,
                opacity: intensity * 0.4,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0 as any,
    width: '100%',
    height: '100%',
  },
  gradientLayer: {
    position: 'absolute',
    width: width * 1.6,
    height: height * 1.6,
    left: -(width * 0.3),
    top: -(height * 0.3),
  },
  fill: { flex: 1 },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(16,185,129,0.35)',
  },
});

export default EVBackground;