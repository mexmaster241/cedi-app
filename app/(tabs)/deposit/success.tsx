import { View, Text, StyleSheet, TouchableOpacity, Share, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/app/constants/colors';
import { useState, useEffect, useRef } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

interface Movement {
  clave_rastreo: string;
  createdAt: string;
  beneficiaryName: string;
  bankName: string;
  direction: string;
  amount: number;
  commission: number;
  finalAmount: number;
  counterpartyBank: string;
  counterpartyClabe: string;
  counterpartyCard: string;
  concept?: string;
  concept2?: string;
  status: string;
}

export default function SuccessScreen() {
  const params = useLocalSearchParams<{ movementData: string }>();
  const [movement, setMovement] = useState<Movement | null>(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (params.movementData) {
      try {
        const parsedMovement = JSON.parse(params.movementData);
        const processedMovement: Movement = {
          clave_rastreo: parsedMovement.clave_rastreo,
          createdAt: parsedMovement.createdAt,
          beneficiaryName: parsedMovement.beneficiaryName,
          bankName: parsedMovement.bankName,
          direction: parsedMovement.direction,
          amount: Number(parsedMovement.amount),
          commission: Number(parsedMovement.commission),
          finalAmount: Number(parsedMovement.amount) + Number(parsedMovement.commission),
          counterpartyBank: parsedMovement.counterpartyBank,
          counterpartyClabe: parsedMovement.counterpartyClabe,
          counterpartyCard: parsedMovement.counterpartyCard,
          concept: parsedMovement.concept,
          concept2: parsedMovement.concept2,
          status: parsedMovement.status || 'COMPLETED'
        };
        setMovement(processedMovement);
      } catch (error) {
        console.error('Error parsing movement data:', error);
      }
    }
  }, [params.movementData]);

  const formatAmount = (amount: number) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'Liquidado',
      'REVERSED': 'Devuelto',
      'FAILED': 'Cancelado',
      'PENDING': 'En espera'
    };
    return statusMap[status] || status;
  };

  const generatePDFContent = () => {
    if (!movement) return '';

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 80px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { color: #64748b; }
            .total { font-weight: bold; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://your-domain.com/logotipo.png" class="logo" />
            <h2>Comprobante de Transferencia</h2>
            <p>#${movement.clave_rastreo}</p>
          </div>

          <div class="details">
            <div class="row">
              <span class="label">Fecha:</span>
              <span>${movement.createdAt ? new Date(movement.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="row">
              <span class="label">Beneficiario:</span>
              <span>${movement.beneficiaryName}</span>
            </div>
            <div class="row">
              <span class="label">Banco:</span>
              <span>${movement.bankName}</span>
            </div>
            ${movement.counterpartyClabe ? `
              <div class="row">
                <span class="label">CLABE:</span>
                <span>${movement.counterpartyClabe}</span>
              </div>
            ` : ''}
            <div class="row">
              <span class="label">Estatus:</span>
              <span>${getStatusLabel(movement.status)}</span>
            </div>
          </div>

          <div class="details">
            <div class="row">
              <span class="label">Monto:</span>
              <span>${formatAmount(movement.amount)}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    if (!movement) return;

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.8,
      });
      
      await Share.share({
        url: uri,
        title: 'Comprobante de Transferencia',
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const DetailRow = ({ label, value, isTotal = false }: { 
    label: string; 
    value: string; 
    isTotal?: boolean;
  }) => (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, isTotal && styles.totalLabel]}>{label}:</Text>
      <Text style={[styles.detailValue, isTotal && styles.totalValue]}>{value}</Text>
    </View>
  );

  if (!movement) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró la transferencia</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/')}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/')}
          style={styles.backButton}
        >
          <Feather name="x" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalles de la Transferencia</Text>
      </View>

      <View style={styles.content}>
        <View ref={viewRef} style={styles.card}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardTitle}>Comprobante de Transferencia</Text>
          <Text style={styles.reference}>#{movement?.clave_rastreo}</Text>

          <View style={styles.detailsSection}>
            <DetailRow 
              label="Fecha" 
              value={movement?.createdAt ? new Date(movement.createdAt).toLocaleString() : 'N/A'} 
            />
            <DetailRow 
              label="Beneficiario" 
              value={movement?.beneficiaryName || ''} 
            />
            <DetailRow 
              label="Banco" 
              value={movement?.bankName || ''} 
            />
            {movement?.counterpartyClabe && (
              <DetailRow 
                label="CLABE" 
                value={movement.counterpartyClabe} 
              />
            )}
            <DetailRow 
              label="Estatus" 
              value={getStatusLabel(movement?.status || '')} 
            />
          </View>

         

          <View style={styles.totalSection}>
            <DetailRow 
              label="Monto" 
              value={formatAmount(movement?.amount || 0)} 
              isTotal 
            />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  loadingText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 30,
  },
  loaderContainer: {
    width: '80%',
    height: 2,
    backgroundColor: colors.beige,
    overflow: 'hidden',
    borderRadius: 1,
  },
  loadingBar: {
    width: 100,
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'ClashDisplay',
    alignItems:"center",
    fontSize: 20,
    color: colors.black,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  reference: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    paddingBottom: 16,
    marginBottom: 16,
  },
  amountsSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    paddingBottom: 16,
    marginBottom: 16,
  },
  totalSection: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  shareButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
    marginLeft: 8,
  },
  button: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
});

