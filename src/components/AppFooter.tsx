import React from 'react';
import { Linking, Text, View } from 'react-native';

export const AppFooter = () => {
  const year = new Date().getFullYear();
  const handleAuthorPress = async () => {
    await Linking.openURL('https://ashwanik.me');
  };

  return (
    <View className="items-center rounded-2xl border border-zinc-200 bg-white/80 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/90">
      <Text className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        Designed & Developed by{' '}
        <Text accessibilityRole="link" onPress={handleAuthorPress} className=" text-blue-600 dark:text-blue-400">
          Ashwani Kushwaha
        </Text>
      </Text>
      <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">© {year} All rights reserved.</Text>
    </View>
  );
};
