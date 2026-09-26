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

interface AdminBottomNavProps {
  activeTab: 'dashboard' | 'items' | 'create' | 'claims' | 'profile';
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ activeTab }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { claims } = useCampusData();

  const pendingVerificationCount = claims.filter(
    (c) => c.status === 'Menunggu Verifikasi'
  ).length;

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconOutline: 'grid-outline' as const,
      iconFilled: 'grid' as const,
      route: '/admin/dashboard',
    },
    {
      id: 'items',
      label: 'Barang',
      iconOutline: 'cube-outline' as const,
      iconFilled: 'cube' as const,
      route: '/admin/items',
    },
    {
      id: 'create',
      label: 'Input',
      iconOutline: 'add-circle-outline' as const,
      iconFilled: 'add-circle' as const,
      route: '/admin/create',
      isSpecial: true,
    },
    {
      id: 'claims',
      label: 'Klaim',
      iconOutline: 'file-tray-full-outline' as const,
      iconFilled: 'file-tray-full' as const,
      route: '/admin/claims',
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
    },
    {
      id: 'profile',
      label: 'Profil',
      iconOutline: 'person-outline' as const,
      iconFilled: 'person' as const,
      route: '/admin/profile',
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
                  size={tab.isSpecial ? 26 : 22}
                  color={
                    tab.isSpecial
                      ? '#4F46E5'
                      : isActive
                      ? '#4F46E5'
                      : '#64748B'
                  }
                />
                {tab.badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  tab.isSpecial && { color: '#4F46E5', fontWeight: '700' },
                ]}
              >
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
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
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
    color: '#94A3B8',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#818CF8',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444',
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
