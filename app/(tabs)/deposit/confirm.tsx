import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/app/constants/colors';
import { useState } from 'react';
import { getCurrentUser } from '@/app/src/db';
import { db } from '@/app/src/db';
import Toast from 'react-native-toast-message';
import React from 'react';
import { supabase, supabaseAdmin } from '@/app/src/db';
import { SpeiService } from '@/app/components/spei.service';

const COMMISSION_AMOUNT = 5.80;
const COMMISSION_CLABE = '646180527800000009';

interface Bank {
  code: string;
  name: string;
}

const BANK_CODES: { [key: string]: Bank } = {
  "002": { code: "002", name: "BANAMEX" },
  "006": { code: "006", name: "BANCOMEXT" },
  "009": { code: "009", name: "BANOBRAS" },
  "012": { code: "012", name: "BBVA MEXICO" },
  "014": { code: "014", name: "SANTANDER" },
  "019": { code: "019", name: "BANJERCITO" },
  "021": { code: "021", name: "HSBC" },
  "030": { code: "030", name: "BAJÍO" },
  "036": { code: "036", name: "INBURSA" },
  "042": { code: "042", name: "MIFEL" },
  "044": { code: "044", name: "SCOTIABANK" },
  "058": { code: "058", name: "BANREGIO" },
  "059": { code: "059", name: "INVEX" },
  "060": { code: "060", name: "BANSI" },
  "062": { code: "062", name: "AFIRME" },
  "072": { code: "072", name: "BANORTE" },
  "106": { code: "106", name: "BANK OF AMERICA" },
  "108": { code: "108", name: "MUFG" },
  "110": { code: "110", name: "JP MORGAN" },
  "112": { code: "112", name: "BMONEX" },
  "113": { code: "113", name: "VE POR MAS" },
  "126": { code: "126", name: "CREDIT SUISSE" },
  "127": { code: "127", name: "AZTECA" },
  "128": { code: "128", name: "AUTOFIN" },
  "129": { code: "129", name: "BARCLAYS" },
  "130": { code: "130", name: "COMPARTAMOS" },
  "132": { code: "132", name: "MULTIVA BANCO" },
  "133": { code: "133", name: "ACTINVER" },
  "135": { code: "135", name: "NAFIN" },
  "136": { code: "136", name: "INTERCAM BANCO" },
  "137": { code: "137", name: "BANCOPPEL" },
  "138": { code: "138", name: "ABC CAPITAL" },
  "140": { code: "140", name: "CONSUBANCO" },
  "141": { code: "141", name: "VOLKSWAGEN" },
  "143": { code: "143", name: "CIBanco" },
  "145": { code: "145", name: "BBASE" },
  "147": { code: "147", name: "BANKAOOL" },
  "148": { code: "148", name: "PagaTodo" },
  "150": { code: "150", name: "INMOBILIARIO" },
  "151": { code: "151", name: "Donde" },
  "152": { code: "152", name: "BANCREA" },
  "154": { code: "154", name: "BANCO COVALTO" },
  "155": { code: "155", name: "ICBC" },
  "156": { code: "156", name: "SABADELL" },
  "157": { code: "157", name: "SHINHAN" },
  "158": { code: "158", name: "MIZUHO BANK" },
  "159": { code: "159", name: "BANK OF CHINA" },
  "160": { code: "160", name: "BANCO S3" },
  "166": { code: "166", name: "Banco del Bienestar" },
  "168": { code: "168", name: "HIPOTECARIA FEDERAL" },
  "600": { code: "600", name: "MONEXCB" },
  "601": { code: "601", name: "GBM" },
  "602": { code: "602", name: "MASARI CB" },
  "605": { code: "605", name: "VALUÉ" },
  "608": { code: "608", name: "VECTOR" },
  "610": { code: "610", name: "B&B" },
  "613": { code: "613", name: "MULTIVA CBOLSA" },
  "616": { code: "616", name: "FINAMEX" },
  "617": { code: "617", name: "VALMEX" },
  "618": { code: "618", name: "ÚNICA" },
  "619": { code: "619", name: "MAPFRE" },
  "620": { code: "620", name: "PROFUTURO" },
  "621": { code: "621", name: "CB ACTINBER" },
  "622": { code: "622", name: "OACTIN" },
  "623": { code: "623", name: "SKANDIA" },
  "626": { code: "626", name: "CBDEUTSCHE" },
  "627": { code: "627", name: "ZURICH" },
  "628": { code: "628", name: "ZURICHVI" },
  "629": { code: "629", name: "SU CASITA" },
  "630": { code: "630", name: "C.B. INTERCAM" },
  "631": { code: "631", name: "C.I. BOLSA" },
  "632": { code: "632", name: "BULLTICK C.B." },
  "633": { code: "633", name: "STERLING" },
  "634": { code: "634", name: "FINCOMUN" },
  "636": { code: "636", name: "HDI SEGUROS" },
  "637": { code: "637", name: "ORDER" },
  "638": { code: "638", name: "AKALA" },
  "640": { code: "640", name: "C.B. JP MORGAN" },
  "642": { code: "642", name: "REFORMA" },
  "646": { code: "646", name: "STP" },
  "647": { code: "647", name: "TELECOMM" },
  "648": { code: "648", name: "EVERCORE" },
  "649": { code: "649", name: "SKANDIA" },
  "651": { code: "651", name: "SEGMTY" },
  "652": { code: "652", name: "ASEA" },
  "653": { code: "653", name: "KUSPIT" },
  "655": { code: "655", name: "SOFIEXPRESS" },
  "656": { code: "656", name: "UNAGRA" },
  "659": { code: "659", name: "OPCIONES EMPRESARIALES DEL NOROESTE" },
  "670": { code: "670", name: "LIBERTAD" },
  "674": { code: "674", name: "AXA" },
  "677": { code: "677", name: "CAJA POP MEXICA" },
  "679": { code: "679", name: "FND" },
  "684": { code: "684", name: "TRANSFER" },
  "722": { code: "722", name: "MERCADO PAGO" },
  "901": { code: "901", name: "CLS" },
  "902": { code: "902", name: "INDEVAL" },
  "999": { code: "999", name: "N/A" }
};

const BANK_TO_INSTITUTION: { [key: string]: string } = {
  "002": "40002", // BANAMEX
  "006": "37006", // BANCOMEXT
  "009": "37009", // BANOBRAS
  "012": "40012", // BBVA MEXICO
  "014": "40014", // SANTANDER
  "019": "37019", // BANJERCITO
  "021": "40021", // HSBC
  "030": "40030", // BAJIO
  "036": "40036", // INBURSA
  "042": "40042", // MIFEL
  "044": "40044", // SCOTIABANK
  "058": "40058", // BANREGIO
  "059": "40059", // INVEX
  "060": "40060", // BANSI
  "062": "40062", // AFIRME
  "072": "40072", // BANORTE
  "106": "40106", // BANK OF AMERICA
  "108": "40108", // MUFG
  "110": "40110", // JP MORGAN
  "112": "40112", // BMONEX
  "113": "40113", // VE POR MAS
  "124": "40124", // CBM BANCO
  "127": "40127", // AZTECA
  "128": "40128", // AUTOFIN
  "129": "40129", // BARCLAYS
  "130": "40130", // COMPARTAMOS
  "132": "40132", // MULTIVA BANCO
  "133": "40133", // ACTINVER
  "135": "37135", // NAFIN
  "136": "40136", // INTERCAM BANCO
  "137": "40137", // BANCOPPEL
  "138": "40138", // ABC CAPITAL
  "140": "40140", // CONSUBANCO
  "141": "40141", // VOLKSWAGEN
  "143": "40143", // CIBANCO
  "145": "40145", // BBASE
  "147": "40147", // BANKAOOL
  "148": "40148", // PAGATODO
  "150": "40150", // INMOBILIARIO
  "151": "40151", // DONDE
  "152": "40152", // BANCREA
  "154": "40154", // BANCO COVALTO
  "155": "40155", // ICBC
  "156": "40156", // SABADELL
  "157": "40157", // SHINHAN
  "158": "40158", // MIZUHO BANK
  "159": "40159", // BANK OF CHINA
  "160": "40160", // BANCO S3
  "166": "37166", // BaBien
  "168": "37168", // HIPOTECARIA FED
  "600": "90600", // MONEXCB
  "601": "90601", // GBM
  "602": "90602", // MASARI
  "605": "90605", // VALUE
  "608": "90608", // VECTOR
  "616": "90616", // FINAMEX
  "617": "90617", // VALMEX
  "620": "90620", // PROFUTURO
  "630": "90630", // CB INTERCAM
  "631": "90631", // CI BOLSA
  "634": "90634", // FINCOMUN
  "638": "90638", // NU MEXICO
  "642": "90642", // REFORMA
  "646": "90646", // STP
  "652": "90652", // CREDICAPITAL
  "653": "90653", // KUSPIT
  "656": "90656", // UNAGRA
  "659": "90659", // ASP INTEGRA OPC
  "661": "90661", // ALTERNATIVOS
  "670": "90670", // LIBERTAD
  "677": "90677", // CAJA POP MEXICA
  "680": "90680", // CRISTOBAL COLON
  "683": "90683", // CAJA TELEFONIST
  "684": "90684", // TRANSFER
  "685": "90685", // FONDO (FIRA)
  "686": "90686", // INVERCAP
  "689": "90689", // FOMPED
  "699": "90699", // FONDEADORA
  "703": "90703", // TESORED
  "706": "90706", // ARCUS
  "710": "90710", // NVIO
  "722": "90722", // Mercado Pago W
  "723": "90723", // CUENCA
  "728": "90728", // SPIN BY OXXO
  "902": "90902", // INDEVAL
  "903": "90903", // CoDi Valida
};

// Special cases for secondary institutions
const SECONDARY_INSTITUTIONS: { [key: string]: string } = {
  "002": "91802", // BANAMEX2
  "012": "91812", // BBVA BANCOMER2
  "014": "91814", // SANTANDER2
  "021": "91821", // HSBC2
  "072": "91872", // BANORTE2
  "127": "91927", // AZTECA2
};

const getInstitutionCode = (bankCode: string) => {
  // First try the primary institution code
  const primaryCode = BANK_TO_INSTITUTION[bankCode];
  if (primaryCode) return primaryCode;
  
  // Then check secondary institutions
  const secondaryCode = SECONDARY_INSTITUTIONS[bankCode];
  if (secondaryCode) return secondaryCode;
  
  // Default to STP if no matching institution is found
  return "90646";
};

export default function ConfirmDepositScreen() {
  const { 
    amount, 
    recipientId,
    recipientName, 
    accountNumber 
  } = useLocalSearchParams<{
    amount: string;
    recipientId: string;
    recipientName: string;
    accountNumber: string;
  }>();

  const [concept, setConcept] = useState('');
  const [concept2, setConcept2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add state for commission visibility
  const isInternalTransfer = accountNumber?.startsWith('6461805278');
  const appliedCommission = isInternalTransfer ? 0 : COMMISSION_AMOUNT;
  const totalAmount = Number(amount) + appliedCommission;

  const handleTransfer = async (
    recipientClabe: string,
    amount: number,
    concept: string,
    concept2?: string
  ): Promise<{ newSenderBalance: number; claveRastreo: string } | undefined> => {
    let speiResponse: any = null;

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No authenticated user');
      }

      const sender = await db.users.get(currentUser.id);
      if (!sender) {
        throw new Error('Sender not found');
      }

      const isInternalTransfer = recipientClabe.startsWith('6461805278');
      const appliedCommission = isInternalTransfer ? 0 : COMMISSION_AMOUNT;

      if (sender.balance! < (amount + appliedCommission)) {
        throw new Error('Insufficient funds');
      }

      // Generate tracking number
      const claveRastreo = `CEDI${Math.floor(10000000 + Math.random() * 90000000)}`;
      const recipientBankCode = recipientClabe.substring(0, 3);
      const senderFullName = `${sender.given_name} ${sender.family_name}`;

      // For external transfers, call SPEI service
      if (!isInternalTransfer) {
        const outboundPayload = {
          claveRastreo,
          conceptoPago: concept,
          cuentaOrdenante: sender.clabe!,
          cuentaBeneficiario: recipientClabe,
          empresa: "CEDI",
          institucionContraparte: getInstitutionCode(recipientBankCode),
          institucionOperante: "90646",
          monto: amount,
          nombreBeneficiario: recipientName,
          nombreOrdenante: senderFullName,
          referenciaNumerica: Math.floor(100000 + Math.random() * 900000).toString(),
          rfcCurpBeneficiario: "ND",
          rfcCurpOrdenante: "ND",
          tipoCuentaBeneficiario: recipientClabe.length === 16 ? "3" : "40",
          tipoCuentaOrdenante: "40",
          tipoPago: "1"
        };

        speiResponse = await SpeiService.sendTransfer(outboundPayload);
        
        if (!speiResponse.success) {
          throw new Error(speiResponse.error || 'Error en la transferencia SPEI');
        }
      }

      // Get commission account for external transfers
      let commissionAccount = null;
      if (!isInternalTransfer) {
        const { data: commissionAccounts } = await supabase
          .from('users')
          .select('*')
          .eq('clabe', COMMISSION_CLABE)
          .single();
        
        commissionAccount = commissionAccounts;
      }

      // Update balances
      const newSenderBalance = sender.balance! - (amount + appliedCommission);
      const updates = [
        supabaseAdmin
          .from('users')
          .update({ balance: newSenderBalance })
          .eq('id', currentUser.id)
      ];

      // Add commission account update if external transfer
      if (!isInternalTransfer && commissionAccount) {
        const newCommissionBalance = (commissionAccount.balance || 0) + appliedCommission;
        updates.push(
          supabaseAdmin
            .from('users')
            .update({ balance: newCommissionBalance })
            .eq('id', commissionAccount.id)
        );
      }

      await Promise.all(updates);

      // Create movement records
      const movements = [
        // Sender's outbound movement
        db.movements.create({
          user_id: currentUser.id,
          category: isInternalTransfer ? 'INTERNAL' : 'WIRE',
          direction: 'OUTBOUND',
          status: 'COMPLETED',
          amount,
          commission: appliedCommission,
          final_amount: amount + appliedCommission,
          clave_rastreo: claveRastreo,
          counterparty_name: recipientName,
          counterparty_bank: BANK_CODES[recipientBankCode]?.name || 'Unknown Bank',
          counterparty_clabe: recipientClabe,
          concept,
          concept2,
          metadata: isInternalTransfer ? {} : { speiResponse: speiResponse!.data }
        })
      ];

      // Add commission movement for external transfers
      if (!isInternalTransfer && commissionAccount) {
        movements.push(
          db.movements.create({
            user_id: commissionAccount.id,
            category: 'INTERNAL',
            direction: 'INBOUND',
            status: 'COMPLETED',
            amount: COMMISSION_AMOUNT,
            commission: 0,
            final_amount: COMMISSION_AMOUNT,
            clave_rastreo: claveRastreo,
            counterparty_name: senderFullName,
            counterparty_bank: 'CEDI',
            counterparty_clabe: sender.clabe,
            concept: 'Comisión por transferencia SPEI saliente',
            metadata: isInternalTransfer ? {} : { speiResponse: speiResponse!.data }
          })
        );
      }

      await Promise.all(movements);

      return { newSenderBalance, claveRastreo };
    } catch (error) {
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (!concept) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El concepto es obligatorio',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await handleTransfer(
        accountNumber,
        parseFloat(amount),
        concept,
        concept2
      );

      if (result?.newSenderBalance !== undefined) {
        Toast.show({
          type: 'success',
          text1: 'Transferencia completada',
          text2: 'La transferencia se ha realizado correctamente',
          position: 'bottom',
          visibilityTime: 3000,
        });

        router.replace({
          pathname: '/(tabs)/deposit/processing',
          params: {
            movementData: JSON.stringify({
              clave_rastreo: result.claveRastreo,
              amount,
              commission: appliedCommission,
              finalAmount: amount + appliedCommission,
              recipientName,
              beneficiaryName: recipientName,
              bankName: BANK_CODES[accountNumber.substring(0, 3)]?.name || 'Unknown Bank',
              counterpartyClabe: accountNumber,
              counterpartyBank: BANK_CODES[accountNumber.substring(0, 3)]?.name || 'Unknown Bank',
              concept,
              concept2,
              status: 'COMPLETED',
              createdAt: new Date().toISOString(),
              direction: 'OUTBOUND'
            })
          }
        });
      }
    } catch (error) {
      console.error('Error in transfer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error en la transferencia',
        text2: error instanceof Error ? error.message : 'Por favor intenta de nuevo más tarde',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Confirmar depósito</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amount}>{parseFloat(amount).toFixed(2)}</Text>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.label}>Monto:</Text>
            <Text style={styles.value}>${amount}</Text>

            {/* Only show commission if not internal transfer */}
            {!isInternalTransfer && (
              <>
                <Text style={styles.label}>Comisión:</Text>
                <Text style={styles.value}>${COMMISSION_AMOUNT.toFixed(2)}</Text>
              </>
            )}

            <Text style={styles.label}>Total:</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.recipientCard}>
            <Text style={styles.label}>Destinatario</Text>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.accountNumber}>{accountNumber}</Text>
          </View>

          <View style={styles.conceptContainer}>
            <Text style={styles.label}>Concepto</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Agregar concepto"
              value={concept}
              onChangeText={setConcept}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          <View style={styles.conceptContainer}>
            <Text style={styles.label}>Concepto 2 (opcional)</Text>
            <TextInput
              style={styles.conceptInput}
              placeholder="Agregar concepto adicional"
              value={concept2}
              onChangeText={setConcept2}
              placeholderTextColor={colors.darkGray}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.confirmButton,
              isLoading && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmButtonText}>
              {isLoading ? 'Procesando...' : 'Confirmar transferencia'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Toast 
        config={{
          error: (props) => (
            <View style={toastStyles.container}>
              <View style={toastStyles.iconContainer}>
                <Feather name="alert-circle" size={24} color={colors.black} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          ),
          success: (props) => (
            <View style={toastStyles.container}>
              <View style={[toastStyles.iconContainer, { backgroundColor: colors.black }]}>
                <Feather name="check" size={24} color={colors.white} />
              </View>
              <View style={toastStyles.textContainer}>
                <Text style={toastStyles.title}>{props.text1}</Text>
                <Text style={toastStyles.message}>{props.text2}</Text>
              </View>
            </View>
          )
        }}
      />
    </>
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
    marginRight: 8,
  },
  amount: {
    fontFamily: 'ClashDisplay',
    fontSize: 56,
    color: colors.black,
  },
  recipientCard: {
    backgroundColor: colors.beige,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  recipientName: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: colors.darkGray,
  },
  conceptContainer: {
    marginBottom: 32,
  },
  conceptInput: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.beige,
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto', // Pushes button to bottom
  },
  confirmButtonText: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.white,
  },
  detailsCard: {
    backgroundColor: colors.beige,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  value: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
  },
  totalValue: {
    fontFamily: 'ClashDisplay',
    fontSize: 18,
    color: colors.black,
    fontWeight: 'bold',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
});

const toastStyles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'ClashDisplay',
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  message: {
    fontFamily: 'ClashDisplay',
    fontSize: 14,
    color: colors.darkGray,
  },
});
