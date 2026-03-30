/**
 * Payment Success Screen — Pago exitoso con ticket tipo recibo.
 * frontend-design: elegante, bancario, distintivo.
 * delight: check animado, momento de celebración sutil.
 * harden: cuenta de origen enmascarada (**** 1234).
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  Share,
  Animated,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/context/ThemeContext';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', DATE_FORMAT_OPTIONS).format(date);
}

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const statusBarStyle = isDark ? 'light' : 'dark';

  const params = useLocalSearchParams<{
    providerName: string;
    amount: string;
    referenceOrPhone: string;
    transactionId: string;
  }>();

  const headerHeight = windowHeight * 0.30;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const shareContainerRef = useRef<View>(null);

  const headerGreen = 'hsl(121, 54.50%, 52.50%)';
  const headerGreenTransparent = 'hsla(195, 79.50%, 59.80%, 0.19)';
  const fadeStartLocation = 0.99; // el desvanecimiento empieza ~70% para mantener contraste del check

  useEffect(() => {
    Animated.parallel([
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay: 120,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkScale, checkOpacity]);

  const amountFormatted =
    params.amount != null && params.amount !== ''
      ? `$${Number(params.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '$0.00';
  const dateTimeLabel = formatDateTime(new Date());

  const handleFinish = () => {
    router.replace('/(tabs)/payment-services');
  };

  const handleShare = async () => {
    try {
      if (shareContainerRef.current == null) return;
      const uri = await captureRef(shareContainerRef.current, {
        format: 'png',
        quality: 0.9,
      });
      await Share.share({
        url: Platform.OS === 'ios' ? uri : `file://${uri}`,
        title: 'Comprobante de pago',
      });
    } catch {
      // User cancelled or share not available
    }
  };

  const ticketBg = theme.surface;
  const ticketText = theme.text;
  const ticketMuted = theme.textSecondary;

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <StatusBar style={statusBarStyle} />
      <View
        ref={shareContainerRef}
        collapsable={false}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header — gradiente azul que se desvanece suavemente (sin corte recto); normalize: dark → theme.background gris */}
        <View style={[styles.headerWrap, { height: headerHeight, zIndex: 0 }]}>
          {/* Capa 1: gradiente azul-verde hasta ~70%, luego fade a transparente */}
          <LinearGradient
            colors={[headerGreen, headerGreen, headerGreenTransparent]}
            locations={[0, fadeStartLocation, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Capa 2: transición suave hacia el fondo de la app (crema o gris oscuro) */}
        {/*   <LinearGradient
            colors={['transparent', theme.background]}
            locations={[0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          /> */}
          <SafeAreaView edges={['top']} style={styles.headerSafe} />
          <View style={styles.headerContent}>
            <Animated.View
              style={[
                styles.checkWrap,
                {
                  opacity: checkOpacity,
                  transform: [{ scale: checkScale }],
                },
              ]}
            >
              <View style={styles.checkCircle}>
                <Feather name="check" size={40} color="#fff" strokeWidth={3} />
              </View>
            </Animated.View>
            <Text style={styles.headerTitle}>¡Pago exitoso!</Text>
            <View
              style={{
                height: 1,
                width: 120,
                backgroundColor: 'rgba(35, 35, 35, 0.32)',
                alignSelf: 'center',
                marginVertical: 8,
                borderRadius: 1,
              }}
            />
            <Text style={styles.headerSubtitle}>Cedi</Text>
          </View>
        </View>

        <ScrollView
          style={[
            styles.scroll,
            { zIndex: 1 },
            Platform.OS === 'android' ? { elevation: 2 } : null,
          ]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 24 + 56 + 16,
              marginTop: 0,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Ticket — recibo con borde inferior “dentado” (dashed) */}
          <View style={[styles.ticket, { backgroundColor: ticketBg, borderColor: theme.border }]}>
            {/* Efecto recibo: borde inferior discontinuo */}
            <View style={styles.ticketInner}>
              <Text style={[styles.amountLarge, { color: ticketText }]}>
                {amountFormatted}
              </Text>
              <View style={[styles.divider, { borderBottomColor: theme.border }]} />
              <DetailRow
                label="Servicio / Operador"
                value={params.providerName ?? '—'}
                theme={theme}
              />
              <DetailRow
                label="Referencia / Número"
                value={params.referenceOrPhone ?? '—'}
                theme={theme}
              />
              <DetailRow
                label="Folio de rastreo"
                value={params.transactionId ?? '—'}
                theme={theme}
              />
              <View style={[styles.divider, { borderBottomColor: theme.border }]} />
              <Text style={[styles.dateTime, { color: ticketMuted }]}>
                {dateTimeLabel}
              </Text>
            </View>
            {/* Bordes dentados: fila de semicírculos */}
            <View style={styles.serratedRow}>
              {Array.from({ length: 24 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.serratedTooth,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Botón secundario: compartir / descargar comprobante */}
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Feather name="share-2" size={20} color={theme.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
              Compartir comprobante
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Botón principal sticky abajo */}
        <View
          style={[
            styles.stickyFooter,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: theme.background,
              borderTopColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={handleFinish}
            activeOpacity={0.9}
          >
            <Text style={[styles.primaryBtnText, { color: theme.primaryContrast }]}>
              Volver al inicio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: { text: string; textMuted: string; textSecondary: string };
}) {
  const textColor = theme.text;
  const mutedColor = theme.textSecondary;
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: mutedColor }]} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.detailValue, { color: textColor }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  headerSafe: {
    flex: 0,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  checkWrap: {
    marginBottom: 10,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 27,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontFamily: 'FunnelDisplay-500',
    fontSize: 23,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  ticket: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  ticketInner: {
    padding: 24,
    paddingBottom: 16,
  },
  amountLarge: {
    fontFamily: 'ClashDisplay',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  detailLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    flexShrink: 0,
    maxWidth: '42%',
  },
  detailValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  dateTime: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  serratedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
    gap: 2,
  },
  serratedTooth: {
    width: 10,
    height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginLeft: 8,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'ClashDisplay',
    fontSize: 17,
  },
});
