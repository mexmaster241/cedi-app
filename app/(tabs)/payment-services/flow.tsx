import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { primaryButtonStyle, primaryButtonTextStyle } from '@/app/constants/buttons';
import { TELCEL_TIPOS } from './constants';
import { payService, listProductCategories, inquireBill, getTransactionHistory } from '@/app/services/payment-services';
import type { ProductCategoryResponse, PayServiceRequest, TransactionHistoryItem } from '@/app/services/payment-services';
import { MfaVerifyModal } from '@/app/components/MfaVerifyModal';

const STEP_LABELS_RECARGA = ['Monto', 'Número', 'Confirmar'] as const;
const STEP_LABELS_SERVICIO = ['Datos', 'Confirmar'] as const;

/** Alert box for due date / important notices — soft, accessible contrast (elegant banking). */
function ImportantNotice({
  message,
  theme,
}: {
  message: string;
  theme: { error: string };
}) {
  const bg = 'rgba(200, 70, 70, 0.08)';
  const textColor = theme.error;
  return (
    <View style={[styles.importantWrap, { backgroundColor: bg }]}>
      <Text style={[styles.importantTitle, { color: textColor }]}>Importante:</Text>
      <Text style={[styles.importantText, { color: textColor }]}>{message}</Text>
    </View>
  );
}

export default function PaymentServicesFlowScreen() {
  const { theme, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    providerId: string;
    providerName: string;
    type: 'recarga' | 'servicio';
    category?: string;
    productId?: string;
    serviceId?: string;
    serviceTypeCategoryId?: string;
    frontType?: string;
    telcelOptions?: string;
    price?: string;
    /** Prellenar referencia (recarga) y abrir en paso confirmación. */
    initialReference?: string;
    initialAmount?: string;
    /** Prellenar código de barras/referencia (servicio) para verificar de nuevo. */
    initialBarcode?: string;
  }>();

  const {
    providerId,
    providerName,
    type,
    category: categoryParam,
    productId: productIdParam,
    serviceId: serviceIdParam,
    serviceTypeCategoryId: serviceTypeCategoryIdParam,
    frontType: frontTypeParam,
    telcelOptions: telcelOptionsParam,
    price: servicePriceParam,
    initialReference: initialReferenceParam,
    initialAmount: initialAmountParam,
    initialBarcode: initialBarcodeParam,
  } = params;

  const { user } = useAuth();
  const [products, setProducts] = useState<ProductCategoryResponse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductCategoryResponse | null>(null);
  const [selectedTelcelIdServicio, setSelectedTelcelIdServicio] = useState<number | null>(null);
  const [selectedTelcelLabel, setSelectedTelcelLabel] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>('');
  const [barcode, setBarcode] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingBill, setVerifyingBill] = useState(false);
  const [billVerified, setBillVerified] = useState(false);
  const [serviceLiquidado, setServiceLiquidado] = useState(false);
  const [verificationUnavailable, setVerificationUnavailable] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [recargaHistory, setRecargaHistory] = useState<TransactionHistoryItem[]>([]);
  const [loadingRecargaHistory, setLoadingRecargaHistory] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const pendingPaymentRef = useRef<PayServiceRequest | null>(null);

  const isRecarga = type === 'recarga';
  const isServicio = type === 'servicio';
  const frontTypeNumber = frontTypeParam != null ? Number(frontTypeParam) : undefined;
  const isFrontType2Service = isServicio && frontTypeNumber === 2;
  const isTelcelOptionsMode = isRecarga && telcelOptionsParam === '1';
  const effectiveServiceId =
    selectedTelcelIdServicio ?? (serviceIdParam != null ? Number(serviceIdParam) : null);
  const showTelcelOptionButtons = isTelcelOptionsMode && selectedTelcelIdServicio == null;
  const stepLabels = isRecarga ? STEP_LABELS_RECARGA : STEP_LABELS_SERVICIO;
  const maxStep = stepLabels.length;

  // Desde historial: recarga → paso 3 con número y monto; servicio → paso 1 con referencia prellenada
  useEffect(() => {
    if (isRecarga && initialReferenceParam && initialAmountParam) {
      setReference(initialReferenceParam);
      setAmount(initialAmountParam);
      setStep(3);
    }
    if (isServicio && initialBarcodeParam) {
      setBarcode(initialBarcodeParam);
    }
  }, [isRecarga, isServicio, initialReferenceParam, initialAmountParam, initialBarcodeParam]);

  // Cargar productos de recarga con idService (params o opción Telcel elegida)
  useEffect(() => {
    if (!isRecarga || !categoryParam || effectiveServiceId == null || Number.isNaN(effectiveServiceId))
      return;
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const list = await listProductCategories(categoryParam, { idService: effectiveServiceId });
        if (cancelled) return;
        setProducts(list);
      } catch (e) {
        console.error('Error fetching recarga products:', e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isRecarga, categoryParam, effectiveServiceId]);

  // Historial de recargas: se pide al entrar al step 2 para listar números recientes de la misma compañía
  useEffect(() => {
    if (step !== 2 || !isRecarga || !user?.id) return;
    let cancelled = false;
    (async () => {
      setLoadingRecargaHistory(true);
      try {
        const list = await getTransactionHistory(user.id);
        if (!cancelled) setRecargaHistory(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error fetching recarga history:', e);
        if (!cancelled) setRecargaHistory([]);
      } finally {
        if (!cancelled) setLoadingRecargaHistory(false);
      }
    })();
    return () => { cancelled = true; };
  }, [step, isRecarga, user?.id]);

  useEffect(() => {
    if (step === 1) return;
    contentOpacity.setValue(0);
    contentTranslateY.setValue(20);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const handleVerifyBill = useCallback(async () => {
    if (!barcode.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Ingresa el código de barras',
      });
      return;
    }
    try {
      setVerifyingBill(true);
      setBillVerified(false);
      setServiceLiquidado(false);
      setVerificationUnavailable(false);
      const result = await inquireBill({
        providerId: providerId,
        reference: barcode.trim(),
      });
      if (!result.isValid) {
        setAmount('');
        Toast.show({
          type: 'error',
          text1: 'Referencia inválida',
          text2: result.errorMessage ?? 'Verifica el código de barras',
        });
        return;
      }
      if (result.verificationUnavailable) {
        setVerificationUnavailable(true);
        setBillVerified(true);
        setAmount('');
        Toast.show({
          type: 'info',
          text1: 'Verificación no disponible',
          text2: 'Ingresa la cantidad a pagar manualmente y continúa.',
        });
        return;
      }
      const value = result.amount ?? 0;
      setAmount(String(value));
      setBillVerified(true);
      if (value === 0) {
        setServiceLiquidado(true);
        Toast.show({
          type: 'info',
          text1: 'Servicio liquidado',
          text2: 'Este servicio no tiene adeudo. No es necesario realizar el pago.',
        });
      } else {
        setServiceLiquidado(false);
        Toast.show({
          type: 'success',
          text1: 'Referencia válida',
          text2: 'El monto a pagar se cargó automáticamente.',
        });
      }
    } catch (e) {
      setAmount('');
      setServiceLiquidado(false);
      setVerificationUnavailable(false);
      const message = e instanceof Error ? e.message : 'No se pudo verificar la referencia';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setVerifyingBill(false);
    }
  }, [barcode, providerId]);

  const handlePayment = useCallback(async () => {
    if (!user?.id) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Debes iniciar sesión' });
      return;
    }
    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
    if (amountNum <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Indica la cantidad a pagar' });
      return;
    }
    const ref = (isServicio ? barcode : reference).trim();
    if (!ref) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: isServicio ? 'Ingresa el código de barras' : 'Ingresa el número',
      });
      return;
    }

    const servicePriceNum = isServicio && servicePriceParam != null && servicePriceParam !== ''
      ? parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0
      : 0;
    const totalAmount = isServicio && servicePriceNum > 0 ? servicePriceNum + amountNum : amountNum;

    setLoading(true);
    try {
      const productId = isRecarga && selectedProduct != null
        ? selectedProduct.productId
        : (productIdParam != null ? Number(productIdParam) : undefined);
      const serviceId = isRecarga && selectedProduct != null
        ? selectedProduct.serviceId
        : (selectedTelcelIdServicio ?? (serviceIdParam != null ? Number(serviceIdParam) : undefined));
      const serviceTypeCategoryId = isRecarga && selectedProduct != null
        ? (selectedProduct.serviceTypeCategoryId ?? 0)
        : (serviceTypeCategoryIdParam != null ? Number(serviceTypeCategoryIdParam) : undefined);
      const frontType = isRecarga && selectedProduct != null
        ? (selectedProduct.frontType ?? 1)
        : (frontTypeParam != null ? Number(frontTypeParam) : undefined);

      const res = await payService({
        // Mismo flujo para recarga (reference = número) y pago de servicio (referenceOrPhone = barcode)
        userId: user.id,
        productId: productId ?? 0,
        serviceId: serviceId ?? 0,
        serviceTypeCategoryId: serviceTypeCategoryId ?? 0,
        referenceOrPhone: ref,
        paymentAmount: totalAmount,
        frontType: frontType ?? 1,
        channel: 'APP_IOS',
        ipAddress: '0.0.0.0',
      });
      Toast.show({
        type: 'success',
        text1: 'Pago enviado',
        text2: 'Tu pago se está procesando.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      router.replace({
        pathname: '/(tabs)/payment-services/success',
        params: {
          providerName: providerName ?? '',
          amount: String(totalAmount),
          referenceOrPhone: ref,
          transactionId: res.transactionId ?? '',
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo realizar el pago';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    providerId,
    providerName,
    amount,
    barcode,
    reference,
    isServicio,
    selectedProduct,
    productIdParam,
    serviceIdParam,
    serviceTypeCategoryIdParam,
    frontTypeParam,
    servicePriceParam,
  ]);

  const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const canContinueStep1 = isRecarga
    ? !!amount
    : isFrontType2Service
      ? !!barcode && billVerified && amountNum > 0
      : !!barcode && !!amount;
  const canGoStep2 =
    (isRecarga && !!amount) ||
    (isServicio &&
      !!barcode &&
      (amountNum > 0 || (isFrontType2Service && billVerified && amountNum > 0)));
  const canConfirm = canGoStep2 && (isRecarga ? !!reference : true);

  const goBack = () => {
    if (categoryParam) {
      router.push({
        pathname: '/(tabs)/payment-services/operators',
        params: { category: categoryParam },
      });
      return;
    }
    router.back();
  };
  const goNext = () => {
    if (step < maxStep) {
      setStep((s) => s + 1);
      return;
    }
    // Último paso: validar solo user y canConfirm; guardar payload y abrir MFA
    if (!user?.id) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Debes iniciar sesión' });
      return;
    }
    if (!canConfirm) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Completa los datos del pago' });
      return;
    }
    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
    const ref = (isServicio ? barcode : reference).trim();
    const servicePriceNum = isServicio && servicePriceParam != null && servicePriceParam !== ''
      ? parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0
      : 0;
    const totalAmount = isServicio && servicePriceNum > 0 ? servicePriceNum + amountNum : amountNum;
    const productId = isRecarga && selectedProduct != null
      ? selectedProduct.productId
      : (productIdParam != null ? Number(productIdParam) : 0);
    const serviceId = isRecarga && selectedProduct != null
      ? selectedProduct.serviceId
      : (selectedTelcelIdServicio ?? (serviceIdParam != null ? Number(serviceIdParam) : 0));
    const serviceTypeCategoryId = isRecarga && selectedProduct != null
      ? (selectedProduct.serviceTypeCategoryId ?? 0)
      : (serviceTypeCategoryIdParam != null ? Number(serviceTypeCategoryIdParam) : 0);
    const frontType = isRecarga && selectedProduct != null
      ? (selectedProduct.frontType ?? 1)
      : (frontTypeParam != null ? Number(frontTypeParam) : 1);

    pendingPaymentRef.current = {
      userId: user.id,
      productId,
      serviceId,
      serviceTypeCategoryId,
      referenceOrPhone: ref,
      paymentAmount: totalAmount,
      frontType,
      channel: 'APP_IOS',
      ipAddress: '0.0.0.0',
    };
    setShowMfaModal(true);
  };

  const handleMfaSuccess = useCallback(async () => {
    setShowMfaModal(false);
    const payload = pendingPaymentRef.current;
    pendingPaymentRef.current = null;
    if (!payload) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se encontró el dato del pago. Intenta de nuevo.' });
      return;
    }
    if (!payload.referenceOrPhone?.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Falta la referencia o código de barras.' });
      return;
    }
    if (payload.paymentAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Indica la cantidad a pagar.' });
      return;
    }
    setLoading(true);
    try {
      const res = await payService(payload);
      Toast.show({
        type: 'success',
        text1: 'Pago enviado',
        text2: 'Tu pago se está procesando.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      router.replace({
        pathname: '/(tabs)/payment-services/success',
        params: {
          providerName: providerName ?? '',
          amount: String(payload.paymentAmount),
          referenceOrPhone: payload.referenceOrPhone,
          transactionId: res.transactionId ?? '',
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo realizar el pago';
      Toast.show({ type: 'error', text1: 'Error', text2: message });
    } finally {
      setLoading(false);
    }
  }, [providerName]);

  const continueDisabled =
    loading ||
    showTelcelOptionButtons ||
    (step === 1 && !canContinueStep1) ||
    (step === 2 && isRecarga && !reference) ||
    (step === maxStep && !canConfirm);
  const buttonText = step < maxStep ? 'Continuar' : 'Pagar';

  const isDark = colorScheme === 'dark';
  const stickyBottomPadding = Math.max(insets.bottom, 16) + 56 + 16;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        {/* Compact stepper attached to header */}
        <View style={[styles.stepperRow, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={goBack} style={styles.backWrap} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={theme.text} />
            <Text style={[styles.backLabel, { color: theme.textSecondary }]}>Volver</Text>
          </TouchableOpacity>
          <View style={styles.stepsContainer}>
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const active = step === stepNum;
              const done = step > stepNum;
              const canJump = done;
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.stepItem}
                  activeOpacity={canJump ? 0.8 : 1}
                  disabled={!canJump}
                  onPress={() => {
                    if (canJump) setStep(stepNum);
                  }}
                >
                  <View
                    style={[
                      styles.stepCircle,
                      { borderColor: theme.border },
                      active && { backgroundColor: theme.blueLight, borderColor: theme.blueLight },
                      done && { backgroundColor: theme.successLight, borderColor: theme.successLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        { color: theme.textMuted },
                        (active || done) && { color: '#fff' },
                      ]}
                    >
                      {stepNum}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: theme.textMuted },
                      active && { color: theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: stickyBottomPadding }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.screenTitle, { color: theme.text }]}>
              {selectedTelcelLabel || providerName}
            </Text>

            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              }}
            >
              {showTelcelOptionButtons ? (
                <>
                  <Text style={[styles.hint, { color: theme.textSecondary }]}>
                    Elige el tipo de recarga Telcel
                  </Text>
                  <View style={styles.telcelOptionsGrid}>
                    {TELCEL_TIPOS.map((opcion) => (
                      <TouchableOpacity
                        key={opcion.idServicio}
                        style={[
                          styles.telcelOptionBtn,
                          { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                        onPress={() => {
                          setSelectedTelcelIdServicio(opcion.idServicio);
                          setSelectedTelcelLabel(opcion.label);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.telcelOptionBtnText, { color: theme.text }]}>
                          {opcion.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : step === 1 && (
                <>
                  {isRecarga && (
                    <>
                      <Text style={[styles.hint, { color: theme.textSecondary }]}>
                        Elige el monto de recarga
                      </Text>
                      {loadingProducts ? (
                        <View style={styles.loadingAmounts}>
                          <ActivityIndicator size="small" color={theme.textMuted} />
                        </View>
                      ) : (
                        <View style={styles.amountGrid}>
                          {products
                            .filter((p) => p.price != null && p.price !== '')
                            .sort((a, b) => (parseFloat(a.price!) - parseFloat(b.price!)))
                            .map((product) => {
                              const priceStr = product.price!;
                              const serviceName = product.service ?? '';
                              const showPrice = !serviceName.includes('$');
                              const isSelected = amount === priceStr;
                              return (
                                <TouchableOpacity
                                  key={`${product.productId}-${product.serviceId}-${priceStr}`}
                                  style={[
                                    styles.amountCard,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    isSelected && {
                                      borderColor: theme.blue,
                                      backgroundColor: theme.blue + '18',
                                    },
                                  ]}
                                  onPress={() => {
                                    setAmount(priceStr);
                                    setSelectedProduct(product);
                                    setStep(2);
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.amountCardText,
                                      { color: theme.text },
                                      isSelected && { color: theme.primaryContrast },
                                    ]}
                                  >
                                    {serviceName}
                                    {showPrice ? ` $${priceStr}` : ''}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                        </View>
                      )}
                    </>
                  )}
                  {isServicio && (
                    <>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>Código de barras</Text>
                      <View
                        style={[
                          styles.inputRow,
                          { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}
                      >
                        <TextInput
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Hasta 30 dígitos"
                          placeholderTextColor={theme.textMuted}
                          value={barcode}
                          onChangeText={setBarcode}
                          maxLength={30}
                          keyboardType="number-pad"
                          autoFocus
                        />
                        <TouchableOpacity style={styles.scanBtn}>
                          <Feather name="maximize" size={22} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                      {isFrontType2Service && (
                        <TouchableOpacity
                          style={[
                            styles.verifyButton,
                            { borderColor: theme.blue, backgroundColor: theme.surface },
                            verifyingBill && { opacity: 0.7 },
                          ]}
                          onPress={handleVerifyBill}
                          disabled={verifyingBill}
                          activeOpacity={0.85}
                        >
                          {verifyingBill ? (
                            <ActivityIndicator size="small" color={theme.blue} />
                          ) : (
                            <Text style={[styles.verifyButtonText, { color: theme.blue }]}>
                              Verificar referencia
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                      <Text style={[styles.inputLabel, styles.inputLabelSpaced, { color: theme.text }]}>
                        Cantidad a pagar
                      </Text>
                      {verificationUnavailable && (
                        <Text style={[styles.inputLabel, { marginBottom: 16, fontSize: 13, color: theme.error }]}>
                          El servicio de verificación no está disponible. Ingresa el monto manualmente.
                        </Text>
                      )}
                      <TextInput
                        style={[
                          styles.input,
                          styles.inputSolo,
                          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                        ]}
                        placeholder="$0.00"
                        placeholderTextColor={theme.textMuted}
                        value={amount}
                        onChangeText={setAmount}
                        editable={!isFrontType2Service || verificationUnavailable}
                        selectTextOnFocus={!isFrontType2Service || verificationUnavailable}
                        keyboardType="decimal-pad"
                      />
                      {serviceLiquidado && (
                        <View style={[styles.importantWrap, { backgroundColor: 'rgba(60, 140, 90, 0.12)' }]}>
                          <Text style={[styles.importantTitle, { color: theme.success }]}>
                            Servicio liquidado
                          </Text>
                          <Text style={[styles.importantText, { color: theme.text }]}>
                            Este servicio no tiene adeudo. No es necesario realizar el pago.
                          </Text>
                        </View>
                      )}
                      {!serviceLiquidado && (
                        <ImportantNotice
                          theme={theme}
                          message="Te sugerimos pagar tu recibo como mínimo 24 horas antes del vencimiento para evitar suspensiones."
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {step === 2 && isRecarga && (
                <>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Número a recargar</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputSolo,
                      { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder="10 dígitos"
                    placeholderTextColor={theme.textMuted}
                    value={reference}
                    onChangeText={setReference}
                    maxLength={10}
                    keyboardType="phone-pad"
                    autoFocus
                  />

                  {(() => {
                    const currentServiceId = selectedProduct?.serviceId ?? (serviceIdParam != null ? Number(serviceIdParam) : null);
                    const sameProvider = recargaHistory.filter((item) => item.serviceId === currentServiceId);
                    const onlyPhones = sameProvider
                      .map((item) => item.paymentReference.replace(/\D/g, '').slice(-10))
                      .filter((num) => num.length >= 10);
                    const previousNumbers = Array.from(new Set(onlyPhones)).slice(0, 5);
                    if (loadingRecargaHistory) {
                      return (
                        <View style={styles.previousNumbersWrap}>
                          <View style={styles.previousNumbersList}>
                            <ActivityIndicator size="small" color={theme.textMuted} />
                          </View>
                        </View>
                      );
                    }
                    return previousNumbers.length > 0 && currentServiceId != null ? (
                      <View style={styles.previousNumbersWrap}>
                        <Text style={[styles.previousNumbersLabel, { color: theme.textMuted }]}>
                          Números recargados antes
                        </Text>
                        <View style={styles.previousNumbersList}>
                          {previousNumbers.map((num) => (
                            <TouchableOpacity
                              key={num}
                              style={[styles.previousNumberChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                              onPress={() => {
                                setReference(num);
                                setStep(3);
                              }}
                              activeOpacity={0.7}
                            >
                              <Feather name="smartphone" size={16} color={theme.textMuted} />
                              <Text style={[styles.previousNumberText, { color: theme.text }]}>{num}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : null;
                  })()}
                </>
              )}

              {step === 2 && isServicio && (
                <View style={[styles.summaryBlock, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.summaryRow, { color: theme.text }]}>Proveedor: {providerName}</Text>
                  {servicePriceParam != null && servicePriceParam !== '' && (parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0) > 0 && (
                    <>
                      <Text style={[styles.summaryRow, { color: theme.text }]}>
                        Cargo / Comisión: ${(parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0).toFixed(2)}
                      </Text>
                      <Text style={[styles.summaryRow, { color: theme.text }]}>
                        Cantidad a pagar: ${((parseFloat(amount.replace(/[^0-9.]/g, '')) || 0).toFixed(2))}
                      </Text>
                      <Text style={[styles.summaryRow, styles.summaryRowTotal, { color: theme.text }]}>
                        Total: ${((parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0) + (parseFloat(amount.replace(/[^0-9.]/g, '')) || 0)).toFixed(2)}
                      </Text>
                    </>
                  )}
                  {(!servicePriceParam || servicePriceParam === '' || (parseFloat(servicePriceParam.replace(/[^0-9.]/g, '')) || 0) <= 0) && (
                    <Text style={[styles.summaryRow, { color: theme.text }]}>Monto: ${amount || '0.00'}</Text>
                  )}
                  <Text style={[styles.summaryRow, { color: theme.text }]}>Código: {barcode || '—'}</Text>
                </View>
              )}

              {step === 3 && isRecarga && (
                <>
                  <View
                    style={[
                      styles.confirmCard,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.confirmAmount, { color: theme.text }]}>
                      ${amount || '0.00'}
                    </Text>
                    <View style={[styles.confirmDivider, { backgroundColor: theme.border }]} />
                    <View style={[styles.confirmRow, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.confirmLabel, { color: theme.textMuted }]}>Operador</Text>
                      <Text style={[styles.confirmValue, { color: theme.text }]} numberOfLines={1}>
                        {providerName}
                      </Text>
                    </View>
                    <View style={[styles.confirmRow, styles.confirmRowLast, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.confirmLabel, { color: theme.textMuted }]}>Número de teléfono</Text>
                      <Text style={[styles.confirmValue, { color: theme.text }]}>{reference || '—'}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.paymentMethodCard,
                      {
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.paymentMethodTitle, { color: theme.textMuted }]}>
                      El pago será realizado con
                    </Text>
                    <View style={styles.paymentMethodRow}>
                      <Feather name="credit-card" size={22} color={theme.blue} />
                      <Text style={[styles.paymentMethodValue, { color: theme.text }]}>
                        Cuenta Concentradora Cedi
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>

          {/* Sticky Action Button — oculto en recarga paso 1 (monto): se avanza al elegir monto */}
          {!(step === 1 && isRecarga) && (
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
            {step === maxStep && (
              <Text style={[styles.legalDisclaimer, { color: theme.textMuted }]}>
                Al pagar, aceptas los términos y condiciones de servicio.
              </Text>
            )}
            <TouchableOpacity
              style={[
                primaryButtonStyle(theme),
                { minHeight: 52 },
                continueDisabled && styles.continueBtnDisabled,
              ]}
              onPress={goNext}
              disabled={continueDisabled}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryContrast} />
              ) : (
                <>
                  <Text style={primaryButtonTextStyle(theme)}>{buttonText}</Text>
                  <Ionicons name="arrow-forward-outline" size={20} color={theme.primaryContrast} />
                </>
              )}
            </TouchableOpacity>
          </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <MfaVerifyModal
        visible={showMfaModal}
        onClose={() => setShowMfaModal(false)}
        onSuccess={handleMfaSuccess}
        title="Confirmar pago"
        successMessage="Ingresa el código de 6 dígitos de tu aplicación de autenticación para confirmar el pago."
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backWrap: {
    alignItems: 'center',
    marginRight: 10,
  },
  backLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 11,
    marginTop: 2,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stepItem: {
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    fontFamily: 'ClashDisplay',
    fontSize: 11,
  },
  stepLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 10,
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 24,
    marginBottom: 20,
  },
  hint: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginBottom: 14,
  },
  verifyButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  verifyButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
  },
  telcelOptionsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  telcelOptionBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  telcelOptionBtnText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  loadingAmounts: {
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountCard: {
    width: '48%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCardText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
  inputLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginBottom: 8,
  },
  inputLabelSpaced: {
    marginTop: 20,
  },
  previousNumbersWrap: {
    marginTop: 26,
  },
  previousNumbersLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginBottom: 10,
  },
  previousNumbersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previousNumberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  previousNumberText: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inputSolo: {
    borderRadius: 14,
    borderWidth: 1,
  },
  scanBtn: {
    padding: 8,
  },
  importantWrap: {
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  importantTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginBottom: 6,
  },
  importantText: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    lineHeight: 20,
  },
  summaryBlock: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
  },
  confirmCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  confirmAmount: {
    fontFamily: 'ClashDisplay',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  confirmDivider: {
    height: 1,
    marginBottom: 14,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  confirmLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginRight: 12,
  },
  confirmValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  confirmRowLast: {
    borderBottomWidth: 0,
  },
  paymentMethodCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
  },
  paymentMethodTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    fontWeight: '600',
  },
  legalDisclaimer: {
    fontFamily: 'ClashDisplay',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  summaryRow: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginBottom: 8,
  },
  summaryRowTotal: {
    fontWeight: '600',
    marginTop: 4,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
});
