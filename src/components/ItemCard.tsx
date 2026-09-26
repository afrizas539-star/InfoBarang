import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { StatusBadge } from './StatusBadge';

import { CampusItem } from '@/types';

interface ItemCardProps {
  item: CampusItem;
  onPress?: () => void;
  isAdmin?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress, isAdmin = false }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/item/${item.id}` as any);
    }
  };

  const isLost = item.type === 'lost';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={styles.cardContainer}
      accessibilityRole="button"
      accessibilityLabel={`Buka detail barang: ${item.title}`}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View
          style={[
            styles.typePill,
            { backgroundColor: isLost ? '#DC2626' : '#16A34A' },
          ]}
        >
          <Text style={styles.typePillText}>{isLost ? 'HILANG' : 'DITEMUKAN'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <StatusBadge status={item.status} size="small" />
          <Text style={styles.categoryLabel}>{item.category}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={13} color="#2563EB" />
          <Text style={styles.facultyText} numberOfLines={1}>
            {item.faculty}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.dateWrap}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>

          <View style={styles.openDetailHint}>
            <Text style={styles.openDetailText}>{isAdmin ? 'Kelola' : 'Lihat Detail'}</Text>
            <Ionicons name="chevron-forward" size={14} color="#2563EB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typePill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  facultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  openDetailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
