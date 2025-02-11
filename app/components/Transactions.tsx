import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import { Skeleton } from './Skeleton';

interface Movement {
  id: string;
  category: string;      
  direction: string;     
  status: string;        
  final_amount: number;
  counterparty_name: string;
  concept?: string;
  created_at?: string;
}

export function Transactions() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMovements() {
      try {
        const currentUser = await getCurrentUser();
        const userEmail = currentUser?.email;
        
        if (!userEmail) {
          throw new Error('No email found for user');
        }

        // Get user ID first
        const userId = await db.users.getUserId(userEmail);
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Fetch movements using userId
        const userMovements = await db.movements.list(userId);
        
        if (isMounted) {
          const sortedMovements = userMovements.sort((a, b) => {
            return new Date(b?.createdAt ?? 0).getTime() - 
                   new Date(a?.createdAt ?? 0).getTime();
          });

          setMovements(sortedMovements.slice(0, 20) as Movement[]); // Show last 20 movements
        }
      } catch (err) {
        console.error('Error fetching movements:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMovements();
    return () => { isMounted = false; };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones recientes</Text>
      {isLoading ? (
        <View>
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.transaction}>
              <View style={styles.transactionInfo}>
                <Skeleton width={150} height={20} />
                <View style={{ marginTop: 4 }}>
                  <Skeleton width={100} height={16} />
                </View>
                <View style={{ marginTop: 4 }}>
                  <Skeleton width={120} height={16} />
                </View>
              </View>
              <Skeleton width={80} height={20} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={movements}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.transaction}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {item.direction === 'INBOUND' ? 'Depósito de ' : 'Transferencia a '}
                    {item.counterparty_name}
                  </Text>
                  {item.concept && (
                    <Text style={styles.concept}>{item.concept}</Text>
                  )}
                  <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                </View>
                <Text 
                  style={[
                    styles.final_amount, 
                    { color: item.direction === 'INBOUND' ? '#22c55e' : '#ef4444' }
                  ]}
                >
                  ${Math.abs(item.final_amount).toFixed(2)}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 20,
    marginBottom: 16,
    color: '#000000',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionTitle: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: '#000000',
  },
  concept: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  final_amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
  },
});