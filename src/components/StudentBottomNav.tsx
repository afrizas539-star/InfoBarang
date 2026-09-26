import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCampusData } from '@/context/CampusDataContext';

interface StudentBottomNavProps {
  activeTab: 'home' | 'explore' | 'claims' | 'profile';
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeTab }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { claims } = useCampusData();

  const pendingClaimsCount = claims.filter((c) => c.status === 'Menunggu Verifikasi').length;

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      iconOutline: 'home-outline' as const,
      iconFilled: 'home' as const,
      route: '/',
    },
    {
      id: 'explore',
      label: 'Explore',
      iconOutline: 'search-outline' as const,
      iconFilled: 'search' as const,
      route: '/explore',
    },
    {
      id: 'claims',
      label: 'Klaim',
      iconOutline: 'shield-checkmark-outline' as const,
      iconFilled: 'shield-checkmark' as const,
      route: '/claims',
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
    },
    {
      id: 'profile',
      label: 'Bantuan',
      iconOutline: 'person-circle-outline' as const,
      iconFilled: 'person-circle' as const,
      route: '/profile',
    },
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => {
                if (!isActive) {
                  router.replace(tab.route as any);
                }
              }}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.iconFilled : tab.iconOutline}
                  size={22}
                  color={isActive ? '#2563EB' : '#64748B'}
                />
                {tab.badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
