import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { UserSheet } from './UserSheet';

export function TopBar() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleUserPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.userButton}
          onPress={handleUserPress}
        >
          <Feather name="user" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>
      
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['25%']}
        backgroundStyle={{ backgroundColor: colors.beige }}
      >
        <UserSheet onClose={() => bottomSheetModalRef.current?.dismiss()} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    backgroundColor: colors.beige,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  userButton: {
    padding: 8,
  },
});