import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { QuickCaptureSheet } from '@/shared/quick-capture/QuickCaptureSheet';

export default function QuickCaptureRoute() {
  const [visible, setVisible] = useState(true);

  function handleClose() {
    setVisible(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <ThemedView style={styles.bg}>
      <QuickCaptureSheet visible={visible} onClose={handleClose} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
});
