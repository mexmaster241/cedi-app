import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/app/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/app/context/AuthContext';
import { ActionBar } from '@/app/components/ActionBar';
import {
  getCategories,
  listProductCategories,
  getTransactionHistory,
  ServiceCategory,
  ProductCategoryResponse,
} from '@/app/services/payment-services';
import type { TransactionHistoryItem } from '@/app/services/payment-services';

const CATEGORY_LABELS: Record<string, string> = {
  MOBILE_RECHARGE: 'Tiempo aire',
  TA: 'Tiempo aire',
  WATER_SUPPLY: 'Agua',
  Agua: 'Agua',
  SERVICE_PAYMENTS: 'Pago de servicios',
  ServicesPay: 'Pago de servicios',
  GOVERNMENT_SERVICES: 'Gobierno',
  Gobierno: 'Gobierno',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  MOBILE_RECHARGE: 'Recarga tu celular al instante',
  TA: 'Recarga tu celular al instante',
  WATER_SUPPLY: 'Paga tu recibo de agua',
  Agua: 'Paga tu recibo de agua',
  SERVICE_PAYMENTS: 'Luz, gas, internet y más',
  ServicesPay: 'Luz, gas, internet y más',
  GOVERNMENT_SERVICES: 'Trámites y pagos oficiales',
  Gobierno: 'Trámites y pagos oficiales',
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  MOBILE_RECHARGE: 'smartphone',
  TA: 'smartphone',
  WATER_SUPPLY: 'droplet',
  Agua: 'droplet',
  SERVICE_PAYMENTS: 'file-text',
  ServicesPay: 'file-text',
  GOVERNMENT_SERVICES: 'clipboard',
  Gobierno: 'clipboard',
};

/** Subtítulos para servicios del nivel 2 (Telcel, CFE, Telmex, Totalplay). */
const NIVEL2_SUBTITLE: Record<string, string> = {
  Telcel: 'Paquetes y recargas',
  CFE: 'Comisión Federal de Electricidad',
  Telmex: 'Internet de Fibra Óptica',
  Totalplay: 'Internet de Banda Ancha',
};

/** Servicios comunes: siempre estas 4 cards (nivel 2). */
const NIVEL2_SERVICES: ReadonlyArray<keyof typeof NIVEL2_SUBTITLE> = [
  'Telcel',
  'CFE',
  'Telmex',
  'Totalplay',
];

const NIVEL2_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Telcel: 'smartphone',
  CFE: 'zap',
  Telmex: 'phone',
  Totalplay: 'wifi',
};

/** Mapeo fijo para buscar los productos de CFE/Telmex/Totalplay por serviceId cuando no haya match por nombre. */
const NIVEL2_SERVICE_ID_BY_NAME: Record<string, number> = {
  CFE: 166,
  Telmex: 107,
  Totalplay: 85,
};

type ProductWithCategory = ProductCategoryResponse & { _categoryCode: string };

export default function PaymentServicesScreen() {
  const { theme, colorScheme } = useTheme();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [commonProducts, setCommonProducts] = useState<ProductWithCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [recentHistory, setRecentHistory] = useState<TransactionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openSection, setOpenSection] = useState<'history' | 'categories' | 'common' | null>(null);

  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let cancelled = false;
      (async () => {
        setLoadingHistory(true);
        try {
          const list = await getTransactionHistory(user.id);
          if (!cancelled) setRecentHistory(Array.isArray(list) ? list.slice(0, 4) : []);
        } catch (e) {
          console.error('Error fetching transaction history:', e);
          if (!cancelled) setRecentHistory([]);
        } finally {
          if (!cancelled) setLoadingHistory(false);
        }
      })();
      return () => { cancelled = true; };
    }, [user?.id])
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCategories(true);
      try {
        const list = await getCategories();
        if (!cancelled) setCategories(list);
      } catch (e) {
        console.error('Error fetching categories:', e);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoadingProducts(true);
      try {
        const productArrays = await Promise.all(
          categories.map((cat) => listProductCategories(cat.name))
        );
        if (!cancelled) {
          const withCategory: ProductWithCategory[] = [];
          categories.forEach((cat, i) => {
            const products = productArrays[i] ?? [];
            products.forEach((p) => {
              withCategory.push({ ...p, _categoryCode: cat.name });
            });
          });
          setCommonProducts(withCategory);
        }
      } catch (e) {
        console.error('Error fetching products by category:', e);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, [categories]);

  useEffect(() => {
    if (openSection !== null) return;
    setOpenSection(recentHistory.length > 0 ? 'history' : 'categories');
  }, [recentHistory.length, openSection]);

  /** Map productId → category (alineado con cediOs: productIdToCategory). TA = recarga. */
  const productIdToCategory = useMemo(() => {
    const map = new Map<number, string>();
    commonProducts.forEach((p) => {
      if (p.productId != null && !map.has(p.productId)) map.set(p.productId, p._categoryCode);
    });
    return map;
  }, [commonProducts]);

  /** Map serviceId → category (alineado con cediOs: serviceIdToCategory). Fallback cuando productId no matchea. */
  const serviceIdToCategory = useMemo(() => {
    const map = new Map<number, string>();
    commonProducts.forEach((p) => {
      if (!map.has(p.serviceId)) map.set(p.serviceId, p._categoryCode);
    });
    return map;
  }, [commonProducts]);

  /** Map serviceId → nombre del servicio para etiquetar recientes. */
  const serviceIdToName = useMemo(() => {
    const map = new Map<number, string>();
    commonProducts.forEach((p) => {
      if (!map.has(p.serviceId) && p.service) map.set(p.serviceId, p.service);
    });
    return map;
  }, [commonProducts]);

  const showInitialLoadingScreen = loadingProducts && commonProducts.length === 0;

  if (showInitialLoadingScreen) {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.loadingScreenWrap}>
              <View style={styles.loadingHeader}>
                <Text style={[styles.title, { color: theme.text }]}>Cargando servicios</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Estamos preparando tus categorías y proveedores más usados.
                </Text>
              </View>
              <View style={styles.loadingCardsColumn}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.loadingCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.loadingIcon,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    />
                    <View style={styles.loadingTextColumn}>
                      <View
                        style={[
                          styles.loadingLinePrimary,
                          { backgroundColor: theme.backgroundSecondary },
                        ]}
                      />
                      <View
                        style={[
                          styles.loadingLineSecondary,
                          { backgroundColor: theme.backgroundSecondary },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.loadingFooterRow}>
                <ActivityIndicator size="small" color={theme.textMuted} />
                <Text style={[styles.loadingHint, { color: theme.textMuted }]}>
                  Esto toma solo unos segundos.
                </Text>
              </View>
            </View>
          </SafeAreaView>
          <View style={styles.actionBarWrap}>
            <ActionBar />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          <Text style={[styles.title, { color: theme.text }]}>Pago de servicios</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Elige una categoría o un servicio para pagar
          </Text>

          {/* Historial – sección desplegable */}
          {recentHistory.length > 0 && (
            <View style={styles.sectionBlock}>
              <TouchableOpacity
                style={styles.sectionHeaderRow}
                activeOpacity={0.8}
                onPress={() => setOpenSection(openSection === 'history' ? null : 'history')}
              >
                <Text style={[styles.sectionLabel, { marginBottom: 0, color: theme.text }]}>
                  Últimos servicios usados
                </Text>
                <Feather
                  name={openSection === 'history' ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
              {openSection === 'history' && (
                <>
                  {loadingHistory ? (
                    <View style={[styles.historySection, styles.loadingWrap]}>
                      <ActivityIndicator size="small" color={theme.textMuted} />
                    </View>
                  ) : (
                    <View style={styles.categoryStack}>
                      {recentHistory.map((item, index) => {
                        const product = commonProducts.find(
                          (p) => p.productId === item.productId && p.serviceId === item.serviceId
                        );
                        const category =
                          product?._categoryCode ??
                          productIdToCategory.get(item.productId) ??
                          serviceIdToCategory.get(item.serviceId);
                        const label =
                          product?.service ??
                          serviceIdToName.get(item.serviceId) ??
                          `Referencia ${item.paymentReference.slice(-4)}`;
                        const isRecargaByCategory = category === 'TA' || category === 'MOBILE_RECHARGE';
                        const isRecargaByCatType = item.catTypeServiceId === 13;
                        const isRecarga = isRecargaByCategory || (category == null && isRecargaByCatType);
                        return (
                          <TouchableOpacity
                            key={`${item.productId}-${item.serviceId}-${item.paymentReference}-${index}`}
                            style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => {
                              if (isRecarga) {
                                router.push({
                                  pathname: '/(tabs)/payment-services/flow',
                                  params: {
                                    providerId: String(item.productId),
                                    providerName: label,
                                    type: 'recarga',
                                    category: 'TA',
                                    productId: String(item.productId),
                                    serviceId: String(item.serviceId),
                                    serviceTypeCategoryId: String(item.catTypeServiceId),
                                    frontType: String(product?.frontType ?? 1),
                                    initialReference: item.paymentReference,
                                    initialAmount: String(item.amount),
                                  },
                                });
                              } else {
                                router.push({
                                  pathname: '/(tabs)/payment-services/flow',
                                  params: {
                                    providerId: String(item.productId),
                                    providerName: label,
                                    type: 'servicio',
                                    productId: String(item.productId),
                                    serviceId: String(item.serviceId),
                                    serviceTypeCategoryId: String(item.catTypeServiceId),
                                    frontType: String(product?.frontType ?? 1),
                                    price: String(item.amount),
                                    initialBarcode: item.paymentReference,
                                  },
                                });
                              }
                            }}
                            activeOpacity={0.85}
                          >
                            <View style={[styles.cardIconWrap, { backgroundColor: theme.backgroundSecondary }]}>
                              {product?.image ? (
                                <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="contain" />
                              ) : (
                                <Feather name="clock" size={28} color={theme.textMuted} />
                              )}
                            </View>
                            <View style={styles.cardTextWrap}>
                              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                {label}
                              </Text>
                              <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                                Ref. {item.paymentReference} · ${item.amount}
                              </Text>
                            </View>
                            <Feather name="chevron-right" size={22} color={theme.textMuted} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Categorías – sección desplegable */}
          <View style={styles.sectionBlock}>
            <TouchableOpacity
              style={styles.sectionHeaderRow}
              activeOpacity={0.8}
              onPress={() => setOpenSection(openSection === 'categories' ? null : 'categories')}
            >
              <Text
                style={[
                  styles.sectionLabel,
                  recentHistory.length > 0 ? styles.sectionLabelSecond : undefined,
                  { marginBottom: 0, color: theme.text },
                ]}
              >
                Categorías
              </Text>
              <Feather
                name={openSection === 'categories' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            {openSection === 'categories' && (
              <>
                {loadingCategories ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator size="small" color={theme.textMuted} />
                  </View>
                ) : (
                  <View style={styles.categoryStack}>
                    {categories.map((item) => {
                      const code = item.name;
                      const label = CATEGORY_LABELS[code] ?? item.name;
                      const description = CATEGORY_DESCRIPTIONS[code] ?? '';
                      const icon = CATEGORY_ICONS[code] ?? 'grid';

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                          onPress={() => {
                            router.push({
                              pathname: '/(tabs)/payment-services/operators',
                              params: { category: code, categoryName: label },
                            });
                          }}
                          activeOpacity={0.85}
                        >
                          <View style={[styles.cardIconWrap, { backgroundColor: theme.backgroundSecondary }]}>
                            <Feather name={icon} size={28} color={theme.textMuted} />
                          </View>
                          <View style={styles.cardTextWrap}>
                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                              {label}
                            </Text>
                            <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                              {description}
                            </Text>
                          </View>
                          <Feather name="chevron-right" size={22} color={theme.textMuted} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Servicios comunes – sección desplegable */}
          <View style={styles.sectionBlock}>
            <TouchableOpacity
              style={styles.sectionHeaderRow}
              activeOpacity={0.8}
              onPress={() => setOpenSection(openSection === 'common' ? null : 'common')}
            >
              <Text style={[styles.sectionLabel, styles.sectionLabelSecond, { marginBottom: 0, color: theme.text }]}>
                Servicios comunes
              </Text>
              <Feather
                name={openSection === 'common' ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            {openSection === 'common' && (
              <View style={styles.categoryStack}>
                {NIVEL2_SERVICES.map((serviceName) => {
                  const fallbackServiceId = NIVEL2_SERVICE_ID_BY_NAME[serviceName] ?? null;
                  const product =
                    commonProducts.find((p) => p.service === serviceName) ??
                    (fallbackServiceId != null
                      ? commonProducts.find((p) => p.serviceId === fallbackServiceId)
                      : undefined);
                  return (
                    <TouchableOpacity
                      key={serviceName}
                      style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => {
                        if (serviceName === 'Telcel') {
                          // Ir directo al flujo de recargas Telcel con selector de tipo
                          router.push({
                            pathname: '/(tabs)/payment-services/flow',
                            params: {
                              providerId: '',
                              providerName: 'Telcel',
                              type: 'recarga',
                              category: 'TA',
                              telcelOptions: '1',
                            },
                          });
                          return;
                        }
                        if (product) {
                          console.log('Entra a formulario de pago de servicio', product);
                          // CFE, Telmex, Totalplay → flujo de pago de servicio (formulario con código de barras y monto)
                          router.push({
                            pathname: '/(tabs)/payment-services/flow',
                            params: {
                              providerId: String(product.productId),
                              providerName: product.service ?? '',
                              type: 'servicio',
                              productId: String(product.productId),
                              serviceId: String(product.serviceId),
                              serviceTypeCategoryId: String(product.serviceTypeCategoryId ?? 0),
                              frontType: String(product.frontType ?? 1),
                              price: product.price ?? '',
                            },
                          });
                        } else {
                          console.log('Entra a categorías de servicios', serviceIdToName);
                          router.push({
                            pathname: '/(tabs)/payment-services/operators',
                            params: { category: 'ServicesPay', categoryName: 'Pago de servicios' },
                          });
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.cardIconWrap, { backgroundColor: theme.backgroundSecondary }]}>
                        {product?.image ? (
                          <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="contain" />
                        ) : (
                          <Feather name={NIVEL2_ICONS[serviceName] ?? 'grid'} size={28} color={theme.textMuted} />
                        )}
                      </View>
                      <View style={styles.cardTextWrap}>
                        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                          {serviceName}
                        </Text>
                        <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                          {NIVEL2_SUBTITLE[serviceName] ?? ''}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={22} color={theme.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
        </SafeAreaView>
        <View style={styles.actionBarWrap}>
          <ActionBar />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingScreenWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    justifyContent: 'flex-start',
  },
  loadingHeader: {
    marginBottom: 28,
  },
  loadingCardsColumn: {
    gap: 14,
    marginBottom: 32,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
  },
  loadingTextColumn: {
    flex: 1,
    gap: 6,
  },
  loadingLinePrimary: {
    height: 14,
    borderRadius: 999,
    width: '70%',
  },
  loadingLineSecondary: {
    height: 12,
    borderRadius: 999,
    width: '50%',
  },
  loadingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingHint: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
  },
  actionBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 26,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'ClashDisplay',
    fontSize: 17,
    marginBottom: 12,
  },
  sectionLabelSecond: {
    marginTop: 28,
  },
  historySection: {
    marginBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  categoryStack: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardImage: {
    width: 40,
    height: 40,
  },
  cardTextWrap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 17,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    lineHeight: 20,
  },
});
