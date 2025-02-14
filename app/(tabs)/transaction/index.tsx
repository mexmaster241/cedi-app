import { View, Text, StyleSheet, TouchableOpacity, Share, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../src/db';
import { captureRef } from 'react-native-view-shot';

interface Movement {
  id: string;
  category: string;
  direction: string;
  status: string;
  amount: number;
  commission: number;
  final_amount: number;
  counterparty_name: string;
  counterparty_bank: string;
  counterparty_clabe: string;
  concept?: string;
  concept2?: string;
  clave_rastreo: string;
  created_at: string;
}

export default function TransactionScreen() {
  const { movementId } = useLocalSearchParams<{ movementId: string }>();
  const [movement, setMovement] = useState<Movement | null>(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const loadMovement = async () => {
      if (!movementId) return;
      const movementData = await db.movements.getByClaveRastreo(movementId);
      if (movementData && movementData.length > 0) {
        setMovement(movementData[0]);
      }
    };

    loadMovement();
  }, [movementId]);

  const handleShare = async () => {
    if (!movement) return;

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.8,
        result: 'data-uri',
      });
      
      await Share.share({
        url: uri,
        title: 'Comprobante de Transferencia',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!movement) return null;

  const date = new Date(movement.created_at);
  const formattedDate = date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalles de transferencia</Text>
        </View>

        <View style={styles.content}>
          <View 
            ref={viewRef} 
            style={[styles.card, { backgroundColor: '#FFFFFF' }]}
            collapsable={false}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>
                {movement.direction === 'INBOUND' ? 'Recibido' : 'Enviado'}
              </Text>
              <Text style={[
                styles.amount,
                { color: movement.direction === 'INBOUND' ? '#22c55e' : colors.black }
              ]}>
                ${Math.abs(movement.final_amount).toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estado</Text>
                <View style={styles.statusContainer}>
                  <Feather 
                    name={movement.status === 'COMPLETED' ? 'check-circle' : 'clock'} 
                    size={16} 
                    color={movement.status === 'COMPLETED' ? '#22c55e' : colors.darkGray}
                    style={styles.statusIcon}
                  />
                  <Text style={[
                    styles.statusText,
                    { color: movement.status === 'COMPLETED' ? '#22c55e' : colors.darkGray }
                  ]}>
                    {movement.status === 'COMPLETED' ? 'Completada' : 'Pendiente'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Clave de rastreo</Text>
                <Text style={styles.detailValue}>{movement.clave_rastreo}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {movement.direction === 'INBOUND' ? 'Remitente' : 'Destinatario'}
                </Text>
                <Text style={styles.detailValue}>{movement.counterparty_name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Banco</Text>
                <Text style={styles.detailValue}>{movement.counterparty_bank}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CLABE</Text>
                <Text style={styles.detailValue}>{movement.counterparty_clabe}</Text>
              </View>

              {movement.concept && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Concepto</Text>
                  <Text style={styles.detailValue}>{movement.concept}</Text>
                </View>
              )}

              {movement.concept2 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Concepto 2</Text>
                  <Text style={styles.detailValue}>{movement.concept2}</Text>
                </View>
              )}

              {movement.commission > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Comisión</Text>
                  <Text style={styles.detailValue}>${movement.commission.toFixed(2)}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color={colors.white} />
            <Text style={styles.shareButtonText}>Compartir Comprobante</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    color: colors.black,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.beige,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 40,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 8,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 32,
    color: colors.black,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
  },
  detailValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.black,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
});