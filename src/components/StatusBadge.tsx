import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { STATUS_COLORS } from '@/constants/initialData';
import { ItemStatus } from '@/types';

interface StatusBadgeProps {
  status: ItemStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const theme = STATUS_COLORS[status] || {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
  };

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: theme.text }]} />
      <Text
        style={[
          styles.text,
          {
            color: theme.text,
            fontSize: isSmall ? 11 : 13,
            fontWeight: '600',
          },
        ]}
        numberOfLines={1}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    letterSpacing: -0.2,
  },
});
