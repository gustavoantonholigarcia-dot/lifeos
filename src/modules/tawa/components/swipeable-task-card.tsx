import * as Haptics from 'expo-haptics';
import { Loader, Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { ActionSheetIOS, Alert, Platform, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

import { TaskCard } from './task-card';
import { STATUS_LABELS, type StatusTarefa, type Tarefa } from '../types';

type Props = {
  tarefa: Tarefa;
  onPress?: () => void;
  onAvancar: (novoStatus: StatusTarefa) => void;
  onDeletar: () => void;
};

export function SwipeableTaskCard({ tarefa, onPress, onAvancar, onDeletar }: Props) {
  const swipeRef = useRef<SwipeableMethods>(null);

  function toggleConcluido() {
    onAvancar(tarefa.status === 'concluido' ? 'a_fazer' : 'concluido');
  }

  function toggleEmAndamento() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // a_fazer / concluido → em_andamento
    // em_andamento → a_fazer
    const novo: StatusTarefa =
      tarefa.status === 'em_andamento' ? 'a_fazer' : 'em_andamento';
    onAvancar(novo);
    swipeRef.current?.close();
  }

  function abrirMenu() {
    const opcoes: Array<{
      label: string;
      action: () => void;
      destructive?: boolean;
      cancel?: boolean;
    }> = [
      {
        label: tarefa.status === 'a_fazer' ? '◯ A fazer · atual' : '◯ A fazer',
        action: () => onAvancar('a_fazer'),
      },
      {
        label:
          tarefa.status === 'em_andamento' ? '◐ Em andamento · atual' : '◐ Em andamento',
        action: () => onAvancar('em_andamento'),
      },
      {
        label: tarefa.status === 'concluido' ? '✓ Concluído · atual' : '✓ Concluído',
        action: () => onAvancar('concluido'),
      },
      { label: 'Editar', action: () => onPress?.() },
      { label: 'Deletar', action: confirmarDeletar, destructive: true },
      { label: 'Cancelar', action: () => {}, cancel: true },
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: opcoes.map((o) => o.label),
          destructiveButtonIndex: opcoes.findIndex((o) => o.destructive),
          cancelButtonIndex: opcoes.findIndex((o) => o.cancel),
          title: tarefa.titulo,
          message: `Status atual: ${STATUS_LABELS[tarefa.status]}`,
          userInterfaceStyle: 'dark',
        },
        (idx) => {
          opcoes[idx]?.action();
        },
      );
    } else {
      Alert.alert(
        tarefa.titulo,
        `Status atual: ${STATUS_LABELS[tarefa.status]}`,
        opcoes.map((o) => ({
          text: o.label,
          style: o.destructive ? 'destructive' : o.cancel ? 'cancel' : 'default',
          onPress: o.action,
        })),
      );
    }
  }

  function confirmarDeletar() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Deletar tarefa?', tarefa.titulo, [
      { text: 'Cancelar', style: 'cancel', onPress: () => swipeRef.current?.close() },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => onDeletar(),
      },
    ]);
  }

  const ehEmAndamento = tarefa.status === 'em_andamento';

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      leftThreshold={70}
      rightThreshold={70}
      renderLeftActions={(_progress, translation) => (
        <LeftAction translation={translation} ehEmAndamento={ehEmAndamento} />
      )}
      renderRightActions={(_progress, translation) => (
        <RightAction translation={translation} />
      )}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          // arrastou pra direita visualmente → toggle em_andamento
          toggleEmAndamento();
        } else if (direction === 'right') {
          confirmarDeletar();
        }
      }}>
      <TaskCard
        tarefa={tarefa}
        onPress={onPress}
        onToggleConcluido={toggleConcluido}
        onLongPress={abrirMenu}
      />
    </ReanimatedSwipeable>
  );
}

function LeftAction({
  translation,
  ehEmAndamento,
}: {
  translation: SharedValue<number>;
  ehEmAndamento: boolean;
}) {
  const styleAnim = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(translation.value, [0, 80], [0.7, 1], 'clamp') },
    ],
    opacity: interpolate(translation.value, [0, 40], [0, 1], 'clamp'),
  }));

  return (
    <View style={styles.actionLeft}>
      <Animated.View style={[styles.actionContent, styleAnim]}>
        <Loader color={'#1C1917' as any} size={20} />
        <ThemedText type="small" style={styles.actionTextDark}>
          {ehEmAndamento ? 'Pausar' : 'Em andamento'}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

function RightAction({ translation }: { translation: SharedValue<number> }) {
  const styleAnim = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(translation.value, [0, -80], [0.7, 1], 'clamp') },
    ],
    opacity: interpolate(translation.value, [0, -40], [0, 1], 'clamp'),
  }));

  return (
    <View style={styles.actionRight}>
      <Animated.View style={[styles.actionContent, styleAnim]}>
        <Trash2 color={'white' as any} size={20} />
        <ThemedText type="small" style={styles.actionText}>
          Deletar
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionLeft: {
    flex: 1,
    backgroundColor: '#E8A845', // amber = em andamento
    borderRadius: Radius.md,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  actionRight: {
    flex: 1,
    backgroundColor: '#E04830',
    borderRadius: Radius.md,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  actionContent: { alignItems: 'center', gap: 4 },
  actionText: { color: 'white', fontWeight: '600', fontSize: 11 },
  actionTextDark: { color: '#1C1917', fontWeight: '600', fontSize: 11 },
});
