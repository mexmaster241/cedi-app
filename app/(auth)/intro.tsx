import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors } from '../constants/colors';

const ACCENT = '#0199ca';
const { width, height } = Dimensions.get('window');

const letters = 'cedi'.split('');

function AnimatedLetter({
  letter,
  opacity,
  translateY,
}: {
  letter: string;
  opacity: SharedValue<number>;
  translateY: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  return <Animated.Text style={[styles.letter, style]}>{letter}</Animated.Text>;
}

export default function IntroScreen() {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const letterOpacities = letters.map(() => useSharedValue(0));
  const letterTranslates = letters.map(() => useSharedValue(20));
  const underlineWidth = useSharedValue(0);
  const underlineOpacity = useSharedValue(0);
  const scanlineProgress = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    glowOpacity.value = withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) });
    glowScale.value = withTiming(1.2, { duration: 3000, easing: Easing.out(Easing.ease) });

    letters.forEach((_, i) => {
      const letterEasing = Easing.bezier(0.22, 1, 0.36, 1);
      letterOpacities[i].value = withDelay(
        i * 150,
        withTiming(1, { duration: 800, easing: letterEasing })
      );
      letterTranslates[i].value = withDelay(
        i * 150,
        withTiming(0, { duration: 800, easing: letterEasing })
      );
    });

    const underlineTiming = { duration: 1000, easing: Easing.inOut(Easing.ease) };
    underlineOpacity.value = withDelay(1000, withTiming(1, underlineTiming));
    underlineWidth.value = withDelay(1000, withTiming(1, underlineTiming));

    scanlineProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    const taglineEasing = Easing.bezier(0.22, 1, 0.36, 1);
    taglineOpacity.value = withDelay(1400, withTiming(1, { duration: 600, easing: taglineEasing }));
    taglineTranslateY.value = withDelay(1400, withTiming(0, { duration: 600, easing: taglineEasing }));
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    top: interpolate(scanlineProgress.value, [0, 1], [-height * 0.1, height * 1.1]),
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    width: interpolate(underlineWidth.value, [0, 1], [0, width - 80]),
    opacity: underlineOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background ambient glow - radial fade, more intense at center */}
      <Animated.View style={[styles.glowWrapper, glowStyle]} pointerEvents="none">
        <Svg width={width} height={height} style={styles.glowSvg}>
          <Defs>
            <RadialGradient
              id="glow"
              cx="50%"
              cy="50%"
              r="70%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
              <Stop offset="40%" stopColor={ACCENT} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={height} fill="url(#glow)" />
        </Svg>
      </Animated.View>

      {/* Tech scanline effect */}
      <Animated.View style={[styles.scanline, scanlineStyle]} pointerEvents="none" />

      <View style={styles.content}>
        {/* Cedi letters with staggered reveal */}
        <View style={styles.lettersRow}>
          {letters.map((letter, i) => (
            <AnimatedLetter
              key={i}
              letter={letter}
              opacity={letterOpacities[i]}
              translateY={letterTranslates[i]}
            />
          ))}
        </View>

        {/* Underline */}
        <View style={styles.underlineWrapper}>
          <Animated.View style={[styles.underlineInner, underlineStyle]}>
            <LinearGradient
              colors={['transparent', ACCENT, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.underlineGradient}
            />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.tagline, textAnimatedStyle]}>
          Todo en uno
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  glowWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    overflow: 'hidden',
  },
  glowSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lettersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  letter: {
    fontSize: 96,
    fontFamily: 'FunnelDisplay-500',
    letterSpacing: -2,
    color: '#fff',
    marginHorizontal: 2,
  },
  underlineWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  underlineInner: {
    height: 2,
    overflow: 'hidden',
  },
  underlineGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'ClashDisplay',
    color: colors.white,
    marginBottom: 30,
  },
});



