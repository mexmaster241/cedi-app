import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Modal, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/app/constants/colors';
import { db, supabase } from '@/app/src/db';
import { useAuth } from '@/app/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { createTransfer } from '@/app/constants/transfer';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

interface PendingMovementItem {
  id: string;
  user_id: string;
  amount: number;
  final_amount?: number;
  status: string;
  counterparty_name?: string;
  counterparty_clabe?: string;
  counterparty_rfc_curp?: string;
  concept?: string;
  concept2?: string;
  created_at?: string;
}

// OTP Input (same pattern as confirm.tsx)
const OTPInput = ({ value, onChange, cellCount = 6 }: { value: string; onChange: (val: string) => void; cellCount?: number }) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, cellCount);
  }, [cellCount]);

  const handleCellFocus = (index: number) => setFocusedIndex(index);

  const handleKeyPress = (index: number, keyValue: string) => {
    if (keyValue === '' && index > 0) {
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (!/^\d*$/.test(keyValue)) return;
    const newValue = value.substring(0, index) + keyValue + value.substring(index + 1);
    onChange(newValue);
    if (index < cellCount - 1 && keyValue !== '') inputRefs.current[index + 1]?.focus();
  };

  return (
    <View style={otpStyles.container}>
      {Array(cellCount).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => inputRefs.current[index] = ref}
          style={[otpStyles.cell, focusedIndex === index && otpStyles.focusedCell, value[index] && otpStyles.filledCell]}
          keyboardType="number-pad"
          maxLength={1}
          onFocus={() => handleCellFocus(index)}
          onChangeText={(text) => handleKeyPress(index, text)}
          value={value[index] || ''}
          selectionColor={colors.black}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

export default function PendingMovementsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<PendingMovementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [canApprove, setCanApprove] = useState(false);

  const [selected, setSelected] = useState<PendingMovementItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'details' | 'mfa'>('details');
  const [mfaCode, setMfaCode] = useState('');

  const itemsPerPage = 20;

  const bootstrap = useCallback(async () => {
    if (!user?.id) return;
    try {
      const memberships = await db.teams.getTeamMemberships(user.id);
      const tid = memberships && memberships.length > 0 ? memberships[0].team_id : null;
      setTeamId(tid);
      if (tid) {
        const perms = await db.teams.getPermissions(user.id, tid);
        setCanApprove(Boolean(perms?.can_approve_pending_movements));
      } else {
        setCanApprove(true);
      }
    } catch (e) {
      setCanApprove(false);
    }
  }, [user?.id]);

  const loadData = useCallback(async (reset = false) => {
    if (!user?.id) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      if (reset) setIsLoading(true);
      const { data, totalPages } = await db.movements.getPendingMovements({
        page: reset ? 1 : page,
        itemsPerPage,
        teamId: teamId,
        userId: teamId ? null : user.id,
      });
      setTotalPages(totalPages || 1);
      if (reset) {
        setItems(data as any);
        setPage(1);
      } else {
        setItems(prev => [...prev, ...(data as any)]);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los movimientos' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, page, teamId]);

  useEffect(() => { bootstrap().then(() => loadData(true)); }, [bootstrap, loadData]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(true); }, [loadData]);
  const loadMore = () => { if (page < totalPages && !isLoading) setPage(p => p + 1); };
  useEffect(() => { if (page > 1) loadData(false); }, [page]);

  const openDetails = (item: PendingMovementItem) => { setSelected(item); setStep('details'); setShowModal(true); };
  const goToMfa = () => { if (!selected || !canApprove) return; setStep('mfa'); };

  const handlePasteCode = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.length === 6 && /^\d+$/.test(text)) setMfaCode(text);
      else Toast.show({ type: 'error', text1: 'Código inválido', text2: 'No hay un código válido en el portapapeles' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo acceder al portapapeles' });
    }
  };

  const handleApproveWithMfa = async () => {
    if (!selected) return;
    if (mfaCode.length !== 6) { Toast.show({ type: 'error', text1: 'Código inválido', text2: 'Debe tener 6 dígitos' }); return; }
    try {
      setIsLoading(true);
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const factor = factorsData?.totp?.[0];
      if (!factor) throw new Error('MFA no configurado');
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challengeData.id, code: mfaCode });
      if (verifyError) throw verifyError;

      if (!selected.counterparty_clabe) throw new Error('CLABE del beneficiario no disponible');
      const formData = new FormData();
      formData.append('userId', selected.user_id);
      formData.append('amount', String(selected.amount));
      formData.append('accountType', 'clabe');
      formData.append('clabe', selected.counterparty_clabe);
      formData.append('concept', selected.concept || '');
      if (selected.concept2) formData.append('concept2', selected.concept2);
      formData.append('beneficiaryName', selected.counterparty_name || '');
      if (selected.counterparty_rfc_curp) formData.append('rfcCurp', selected.counterparty_rfc_curp);

      const result = await createTransfer(formData);
      if (!result.success) {
        const msg = result.error || 'No se pudo crear la transferencia';
        Toast.show({ type: 'error', text1: 'Error', text2: msg.includes('Insufficient') ? 'Fondos insuficientes' : msg });
        return;
      }

      await db.movements.deletePendingMovement(selected.id);
      Toast.show({ type: 'success', text1: 'Aprobado', text2: 'Transferencia creada' });
      setShowModal(false); setSelected(null); setMfaCode(''); setStep('details'); loadData(true);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'No se pudo aprobar' });
    } finally { setIsLoading(false); }
  };

  const renderItem = ({ item }: { item: PendingMovementItem }) => {
    const date = item.created_at ? new Date(item.created_at) : null;
    const formattedDate = date ? date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase() : '';
    const amount = item.final_amount ?? item.amount ?? 0;
    return (
      <TouchableOpacity style={styles.row} onPress={() => openDetails(item)}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.counterparty_name || 'Beneficiario'}</Text>
          <Text style={styles.subtitle}>{formattedDate} • pendiente</Text>
        </View>
        <Text style={styles.amount}>${Math.abs(amount).toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Movimientos pendientes</Text>
        </View>
      {isLoading && items.length === 0 ? (
        <View style={styles.loading}><ActivityIndicator color={colors.black} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.black} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        />
      )}

        <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowModal(false); setSelected(null); setMfaCode(''); setStep('details'); }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{step === 'details' ? 'Detalle del movimiento' : 'Confirmar aprobación'}</Text>
                <TouchableOpacity onPress={() => { setShowModal(false); setSelected(null); setMfaCode(''); setStep('details'); }} style={styles.closeButton}>
                  <Feather name="x" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>

            {selected && step === 'details' && (
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>Beneficiario: {selected.counterparty_name || '-'}</Text>
                <Text style={styles.modalMessage}>Concepto: {selected.concept || '-'}</Text>
                <Text style={styles.modalMessage}>Concepto 2: {selected.concept2 || '-'}</Text>
                <Text style={styles.modalMessage}>Monto: ${(selected.final_amount ?? selected.amount ?? 0).toFixed(2)}</Text>
                <Text style={styles.modalMessage}>Estatus: {selected.status}</Text>
                {canApprove ? (
                  <TouchableOpacity style={styles.primaryBtn} onPress={goToMfa}>
                    <Text style={styles.primaryBtnText}>Aprobar</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 12 }]}>No tienes permisos para aprobar. Solo lectura.</Text>
                )}
              </View>
            )}

            {selected && step === 'mfa' && (
              <View style={styles.modalBody}>
                <Text style={[styles.modalMessage, { textAlign: 'center', marginBottom: 12 }]}>Ingresa tu código MFA de 6 dígitos</Text>
                <OTPInput value={mfaCode} onChange={setMfaCode} />
                <TouchableOpacity style={styles.pasteButton} onPress={handlePasteCode}>
                  <Feather name="clipboard" size={20} color={colors.black} />
                  <Text style={styles.pasteButtonText}>Pegar código</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, (mfaCode.length !== 6) && { backgroundColor: colors.lightGray }]} onPress={handleApproveWithMfa} disabled={mfaCode.length !== 6}>
                  <Text style={styles.primaryBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
            </View>
          </View>
        </Modal>

        <Toast />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.beige, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, backgroundColor: colors.beige },
  backButton: { padding: 8 },
  title: { fontFamily: 'ClashDisplay', fontSize: 20, color: colors.black, marginLeft: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  rowLeft: { flex: 1, marginRight: 12 },
  rowTitle: { fontFamily: 'ClashDisplay', fontSize: 16, color: colors.black },
  subtitle: { fontFamily: 'ClashDisplay', fontSize: 14, color: colors.darkGray, marginTop: 2 },
  amount: { fontFamily: 'ClashDisplay', fontSize: 16, minWidth: 90, textAlign: 'right' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.white, borderRadius: 24, width: '100%', maxWidth: Platform.OS === 'web' ? 400 : '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.beige },
  modalTitle: { fontFamily: 'ClashDisplay', fontSize: 22, color: colors.black, fontWeight: '600' },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: colors.beige },
  modalBody: { padding: 24 },
  modalMessage: { fontFamily: 'ClashDisplay', fontSize: 16, color: colors.darkGray, marginBottom: 12 },
  primaryBtn: { marginTop: 16, backgroundColor: colors.black, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontFamily: 'ClashDisplay', fontSize: 16 },
  pasteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 12, backgroundColor: colors.beige, borderRadius: 8 },
  pasteButtonText: { fontFamily: 'ClashDisplay', fontSize: 14, color: colors.black, marginLeft: 8 },
});

const otpStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, width: '100%', marginBottom: 12, paddingHorizontal: 16 },
  cell: { width: 48, height: 56, fontSize: 24, borderWidth: 1.5, borderColor: colors.beige, borderRadius: 12, textAlign: 'center', fontFamily: 'ClashDisplay', color: colors.black, backgroundColor: colors.white, paddingVertical: 8 },
  focusedCell: { borderColor: colors.black, borderWidth: 2, backgroundColor: colors.beige },
  filledCell: { backgroundColor: colors.beige },
});
