import { Text, View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { light, dark } from '../constants/theme';

export interface TransactionItem {
  id: string;
  direction: string;
  status: string;
  final_amount: number;
  counterparty_name: string;
  concept?: string;
  created_at?: string;
  clave_rastreo: string;
}

function getStatusText(status: string): string {
  switch (status.toUpperCase()) {
    case 'REVERSED':
      return 'Devuelta';
    case 'COMPLETED':
      return 'Completada';
    case 'FAILED':
      return 'Fallida';
    case 'PROCESSING':
      return 'Procesando';
    default:
      return 'Pendiente';
  }
}

function getStatusIcon(status: string, direction: string): keyof typeof Feather.glyphMap {
  switch (status.toUpperCase()) {
    case 'REVERSED':
      return 'rotate-ccw';
    case 'COMPLETED':
      return direction === 'INBOUND' ? 'arrow-down-left' : 'arrow-up-right';
    default:
      return 'clock';
  }
}

interface TransactionListProps {
  items: TransactionItem[];
  onRefresh?: () => void;
  isLoading?: boolean;
  renderSkeleton?: () => React.ReactElement;
}

export function TransactionList({
  items,
  isLoading,
  renderSkeleton,
}: TransactionListProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? dark : light;

  if (isLoading && renderSkeleton) {
    return (
      <View style={styles.section}>
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {items.length === 0 ? (
        <View style={[styles.empty, { borderColor: theme.border }]}>
          <Feather name="inbox" size={40} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No hay transacciones recientes
          </Text>
        </View>
      ) : (
        items.map((item) => {
          const date = new Date(item.created_at || '');
          const formattedDate = date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
          }).toUpperCase();
          const isInbound = item.direction === 'INBOUND';
          const isSuccess = item.status.toUpperCase() === 'COMPLETED' && isInbound;
          const amountColor = isSuccess ? theme.success : theme.text;
          const iconName = getStatusIcon(item.status, item.direction);

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/transaction',
                  params: { movementId: item.clave_rastreo },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.leftContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                  <Feather name={iconName} size={22} color={amountColor} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {isInbound ? 'Recibido' : 'Enviado'}
                    {item.counterparty_name ? ` · ${item.counterparty_name}` : ''}
                  </Text>
                  <Text style={[styles.meta, { color: theme.textMuted }]}>
                    {formattedDate} · {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.amount, { color: amountColor }]}
                numberOfLines={1}
              >
                {isInbound ? '+' : '-'}$ {Math.abs(item.final_amount).toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 4,
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
  meta: {
    fontFamily: 'ClashDisplay',
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 88,
    flexShrink: 0,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'ClashDisplay',
    fontSize: 15,
    marginTop: 12,
  },
});
