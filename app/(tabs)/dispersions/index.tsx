import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Modal, Platform } from 'react-native';
import { colors } from '@/app/constants/colors';
import { db } from '@/app/src/db';
import { useAuth } from '@/app/context/AuthContext';
import { Feather } from '@expo/vector-icons';

interface PendingDispersionItem {
  id: string;
  name: string;
  total_amount: number;
  status: string;
  scheduled_for?: string | null;
  created_at?: string;
}

export default function DispersionsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<PendingDispersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selected, setSelected] = useState<PendingDispersionItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 20;

  const loadData = useCallback(async (reset = false) => {
    if (!user?.id) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (reset) setIsLoading(true);

      const memberships = await db.teams.getTeamMemberships(user.id);
      const maybeTeamId = memberships && memberships.length > 0 ? memberships[0].team_id : null;

      const { data, totalPages } = await db.dispersions.getPendingDispersions({
        page: reset ? 1 : page,
        itemsPerPage,
        teamId: maybeTeamId,
        userId: maybeTeamId ? null : user.id,
      });

      setTotalPages(totalPages || 1);
      if (reset) {
        setItems(data as any);
        setPage(1);
      } else {
        setItems(prev => [...prev, ...(data as any)]);
      }
    } catch (e) {
      console.error('Error loading pending dispersions:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, page]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const loadMore = () => {
    if (page < totalPages && !isLoading) setPage(p => p + 1);
  };

  useEffect(() => {
    if (page > 1) loadData(false);
  }, [page]);

  const openDetails = (item: PendingDispersionItem) => {
    setSelected(item);
    setShowModal(true);
  };

  const renderItem = ({ item }: { item: PendingDispersionItem }) => {
    const date = item.created_at ? new Date(item.created_at) : null;
    const formattedDate = date ? date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase() : '';

    return (
      <TouchableOpacity style={styles.row} onPress={() => openDetails(item)}>
        <View style={styles.rowLeft}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitle}>{formattedDate} • pendiente</Text>
        </View>
        <Text style={styles.amount}>${Math.abs(item.total_amount).toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispersiónes pendientes</Text>
      {isLoading && items.length === 0 ? (
        <View style={styles.loading}><ActivityIndicator color={colors.black} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.black} />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        />
      )}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowModal(false);
          setSelected(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de dispersión</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowModal(false);
                  setSelected(null);
                }}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>

            {selected && (
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>Nombre: {selected.name}</Text>
                <Text style={styles.modalMessage}>Monto total: ${selected.total_amount.toFixed(2)}</Text>
                <Text style={styles.modalMessage}>Estatus: {selected.status}</Text>
                {selected.scheduled_for && (
                  <Text style={styles.modalMessage}>Programada para: {new Date(selected.scheduled_for).toLocaleString('es-MX')}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
    paddingTop: 8,
  },
  header: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
  },
  subtitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginTop: 2,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    minWidth: 90,
    textAlign: 'right',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  modalTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 22,
    color: colors.black,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.beige,
  },
  modalBody: {
    padding: 24,
  },
  modalMessage: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 12,
  },
});
