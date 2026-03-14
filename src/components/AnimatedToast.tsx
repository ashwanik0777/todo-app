import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';

type AnimatedToastProps = {
  visible: boolean;
  message: string;
  onHidden: () => void;
};

export const AnimatedToast = ({ visible, message, onHidden }: AnimatedToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!visible || !message) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 140,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
      ]).start(onHidden);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [visible, message, onHidden, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ opacity, transform: [{ translateY }] }}
      className="absolute bottom-8 left-4 right-4 rounded-2xl border border-emerald-500/20 bg-emerald-600 px-4 py-3 shadow-md"
    >
      <View className="flex-row items-center gap-2">
        <Sparkles size={18} color="#ffffff" />
        <Text className="flex-1 text-sm font-semibold text-white">{message}</Text>
      </View>
    </Animated.View>
  );
};
