import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TELCEL_TIPOS } from './constants';
import { listProductCategories, ProductCategoryResponse } from '@/app/services/payment-services';
import { useTheme } from '@/app/context/ThemeContext';

const CARD_RADIUS = 20;
const CATEGORY_TITLES: Record<string, string> = {
  TA: 'Tiempo aire',
  Agua: 'Agua',
  ServicesPay: 'Pago de servicios',
  Gobierno: 'Gobierno',
};

export default function OperatorsScreen() {
  const { theme } = useTheme();
  const { colorScheme } = useTheme();
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName?: string }>();
  const [products, setProducts] = useState<ProductCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [telcelLoading, setTelcelLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await listProductCategories(category);
        if (!cancelled) setProducts(list);
      } catch (e) {
        console.error('Error fetching products by category:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  useEffect(() => {
    if (loading || products.length === 0) return;
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading, products.length]);

  const title = categoryName ?? CATEGORY_TITLES[category] ?? category;
  const isRecarga = category === 'MOBILE_RECHARGE' || category === 'TA';

  const isTelcel = (name: string | undefined) =>
    name?.trim().toLowerCase() === 'telcel';

  const handleProductPress = async (product: ProductCategoryResponse) => {
    if (isRecarga && isTelcel(product.service)) {
      setTelcelLoading(true);
      try {
        const categoryCode = category === 'MOBILE_RECHARGE' ? 'TA' : category;
        await Promise.all(
          TELCEL_TIPOS.map((opcion) =>
            listProductCategories(categoryCode, { idService: opcion.idServicio })
          )
        );
        router.push({
          pathname: '/(tabs)/payment-services/flow',
          params: {
            providerId: String(product.productId),
            providerName: 'Telcel',
            type: 'recarga',
            category: categoryCode,
            productId: String(product.productId),
            serviceTypeCategoryId: String(product.serviceTypeCategoryId ?? 0),
            frontType: String(product.frontType ?? 1),
            telcelOptions: '1',
          },
        });
      } catch (e) {
        console.error('Error fetching Telcel options:', e);
      } finally {
        setTelcelLoading(false);
      }
      return;
    }
    router.push({
      pathname: '/(tabs)/payment-services/flow',
      params: {
        providerId: String(product.productId),
        providerName: product.service,
        type: isRecarga ? 'recarga' : 'servicio',
        category: isRecarga ? (category === 'MOBILE_RECHARGE' ? 'TA' : category) : undefined,
        productId: String(product.productId),
        serviceId: String(product.serviceId),
        serviceTypeCategoryId: String(product.serviceTypeCategoryId ?? 0),
        frontType: String(product.frontType ?? 1),
        price: isRecarga ? undefined : (product.price ?? ''),
      },
    });
  };

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {telcelLoading && (
        <View style={[StyleSheet.absoluteFill, styles.telcelOverlay]}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.telcelOverlayText, { color: theme.textSecondary }]}>
            Cargando opciones Telcel...
          </Text>
        </View>
      )}
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/payment-services')}
            style={[styles.closeBtn, { backgroundColor: theme.surface }]}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isRecarga ? 'Elige un operador para recargar' : 'Elige un servicio para pagar'}
            </Text>
          </View>
          <View style={styles.closeBtn} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={theme.textMuted} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.grid,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {products.map((product, index) => (
                <TouchableOpacity
                  key={`${product.productId}-${product.serviceId}`}
                  style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.logoWrap,
                      { backgroundColor: colorScheme === 'light' ? '#ffffff' : theme.backgroundTertiary },
                    ]}
                  >
                    {product.image ? (
                      <Image
                        source={{ uri: product.image }}
                        style={styles.logoImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.logoPlaceholder, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.logoText, { color: theme.textMuted }]}>
                          {product.service?.charAt(0) ?? '?'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                    {product.service}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
  },
  subtitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginTop: 2,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  telcelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  telcelOverlayText: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    marginTop: 12,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    minHeight: 160,
    backgroundColor: 'transparent',
    borderRadius: CARD_RADIUS,
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'ClashDisplay',
    fontSize: 28,
  },
  cardTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    textAlign: 'center',
  },
  cardPrice: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
