import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Image, TouchableOpacity } from 'react-native';

const { width, height } = Dimensions.get('window');

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation States
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  const titleTranslateY = useRef(new Animated.Value(15)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  
  const lineScale = useRef(new Animated.Value(0)).current;
  
  // Tap prompt fade in
  const promptOpacity = useRef(new Animated.Value(0)).current;
  
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ATMOSPHERIC GLOW
    Animated.loop(
      Animated.parallel([
        Animated.timing(glowScale, {
          toValue: 1.05,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ])
    ).start();

    // LOGO REVEAL
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // TEXT REVEAL
    Animated.parallel([
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 700,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // LINE EXPANSION
    Animated.timing(lineScale, {
      toValue: 1,
      duration: 800,
      delay: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // FADE IN THE TAP PROMPT (after everything else)
    Animated.timing(promptOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleProceed = () => {
    // Fade out before proceeding
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(promptOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleProceed}
      activeOpacity={1}
    >
      {/* Deep Navy Background */}
      <View style={styles.background} />

      {/* MAIN CONTENT */}
      <View style={styles.content}>
        
        {/* ATMOSPHERIC GLOW */}
        <Animated.View 
          style={[
            styles.atmosphericGlow,
            { 
              transform: [{ scale: glowScale }],
              opacity: glowOpacity
            }
          ]} 
        />

        {/* LOGO */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}
        >
          <Image 
            source={require("../../assets/StudySync_logo1.png")} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </Animated.View>

        {/* TITLE SECTION */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }]
            }
          ]}
        >
          <Text style={styles.title}>StudySync</Text>
          
          <Animated.View 
            style={[
              styles.accentLine,
              { transform: [{ scaleX: lineScale }] }
            ]} 
          />
        </Animated.View>

        {/* TAP PROMPT */}
        <Animated.View style={[styles.promptContainer, { opacity: promptOpacity }]}>
          <Text style={styles.promptText}>Tap anywhere to continue</Text>
        </Animated.View>
      </View>

      {/* Subtle footer */}
      <Text style={styles.footer}>v 1.0.0</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0F1C',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  atmosphericGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2563EB',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 25,
    top: -20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 130,
    height: 130,
    zIndex: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },
  accentLine: {
    width: 50,
    height: 3,
    backgroundColor: '#F97316',
    borderRadius: 2,
    transformOrigin: 'center',
  },
  promptContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  promptText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 35,
    color: '#475569',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
});