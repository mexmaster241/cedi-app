"use client"
import { useState, useEffect } from "react"
import { useAuth } from '@/components/landing/LayoutContext'
import { db } from '@/db'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"
import { SpeiService } from "@/services/spei.service"

interface Contact {
  id: string
  value: string
  name: string
  alias?: string
}

const COMMISSION_CLABE = '646180527800000009';

interface Bank {
  code: string;
  name: string;
}

export const BANK_CODES: { [key: string]: Bank } = {
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
  "638": { code: "638", name: "NU MEXICO" },
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

export function TransferirForm() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('clabe')
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [detectedBank, setDetectedBank] = useState<Bank | null>(null)
  const { toast } = useToast()
  const [userCommission, setUserCommission] = useState<number>(5.80) // Default fallback

  useEffect(() => {
    async function fetchContacts() {
      try {
        if (!user?.id) return;
        
        const contactsList = await db.contacts.list(user.id);
        if (contactsList) {
          setContacts(contactsList.map((contact: any) => ({
            id: contact.id,
            value: contact.clabe,
            name: contact.name,
            alias: contact.alias || contact.name
          })));
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar los contactos",
        });
      }
    }
    fetchContacts();
  }, [user?.id, toast]);

  useEffect(() => {
    async function initializeUser() {
      try {
        if (!user?.id) {
          throw new Error('No user authenticated');
        }

        const userData = await db.users.get(user.id);
        setUserBalance(userData?.balance ?? 0);
        // Get outbound commission from user data
        setUserCommission(userData?.outbound_commission_fixed ?? 5.80);
      } catch (err) {
        console.error("Error initializing user:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar datos del usuario",
        });
      }
    }
    initializeUser();
  }, [toast, user?.id]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value || '0');
    const clabe = (document.getElementById('clabe') as HTMLInputElement)?.value || '';
    const isCommissionFree = clabe.startsWith('6461805278');
    const appliedCommission = isCommissionFree ? 0 : userCommission;
    
    const totalAmount = amount + appliedCommission;
    
    const totalAmountInput = document.getElementById('totalAmount') as HTMLInputElement;
    if (totalAmountInput) {
      totalAmountInput.value = totalAmount.toFixed(2);
    }

    // Add validation for insufficient funds
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      const hasInsufficientFunds = totalAmount > userBalance;
      submitButton.disabled = loading || hasInsufficientFunds;
      
      // Show/hide error message
      const errorMessage = document.getElementById('insufficientFundsError');
      if (errorMessage) {
        errorMessage.style.display = hasInsufficientFunds ? 'block' : 'none';
      }
    }
  };

  const handleTransfer = async (
    recipientClabe: string,
    amount: number,
    concept: string,
    concept2?: string
  ): Promise<{ newSenderBalance: number } | undefined> => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting transfer process...', { recipientClabe, amount, concept });
      
      // Validate CLABE format
      if (!recipientClabe || recipientClabe.length !== 18) {
        throw new Error('La CLABE debe tener 18 dígitos');
      }

      const isInternalTransfer = recipientClabe.startsWith('6461805278');
      const appliedCommission = isInternalTransfer ? 0 : userCommission;
      console.log('Transfer type:', { isInternalTransfer, appliedCommission });

      // Get sender's details
      console.log('Fetching sender details for ID:', user.id);
      const senderData = await db.users.get(user.id);
      console.log('Sender data:', senderData);
      
      if (!senderData) {
        console.error('No sender data found');
        throw new Error('Error al obtener datos del remitente');
      }

      let recipientData = null;
      // For internal transfers, verify recipient exists in our database
      if (isInternalTransfer) {
        console.log('Fetching recipient details for CLABE:', recipientClabe);
        recipientData = await db.users.getByClabe(recipientClabe);
        console.log('Recipient data:', recipientData);
        
        if (!recipientData) {
          console.error('No recipient found for CLABE:', recipientClabe);
          throw new Error('Cuenta de destino no encontrada. Verifica la CLABE.');
        }

        // Prevent self-transfers
        if (recipientData.id === user.id) {
          throw new Error('No puedes transferir a tu propia cuenta');
        }
      }

      // Get commission account for external transfers
      let commissionAccount = null;
      if (!isInternalTransfer) {
        console.log('Fetching commission account for CLABE:', COMMISSION_CLABE);
        const commissionResult = await db.users.getByClabe(COMMISSION_CLABE);
        console.log('Commission account lookup result:', commissionResult);
        
        if (!commissionResult) {
          console.error('Commission account not found');
          throw new Error('Error al procesar la comisión');
        }
        
        // The commission account is the first result, not the array itself
        commissionAccount = commissionResult;
        console.log('Commission account:', commissionAccount);
      }

      const recipientBankCode = recipientClabe.substring(0, 3);
      const senderFullName = `${senderData.given_name || ''} ${senderData.family_name || ''}`;
      const bankName = BANK_CODES[recipientBankCode]?.name || 'Unknown Bank';
      
      console.log('Transfer details:', {
        recipientBankCode,
        senderFullName,
        bankName,
        totalAmount: amount + appliedCommission
      });

      // Get beneficiary name from form
      const beneficiaryNameInput = document.getElementById('beneficiaryName') as HTMLInputElement;
      const recipientName = beneficiaryNameInput?.value || 'Unknown Recipient';

      // Generate claveRastreo
      const claveRastreo = `CEDI${Math.floor(10000000 + Math.random() * 90000000)}`;

      let speiResponse;
      // Call SPEI service for external transfers
      if (!isInternalTransfer) {
        const outboundPayload = prepareOutboundPayload(
          senderData.clabe!,
          recipientClabe,
          amount,
          concept,
          senderFullName,
          recipientName,
          recipientBankCode,
          claveRastreo
        );

        try {
          speiResponse = await SpeiService.sendTransfer(outboundPayload);
          
          if (!speiResponse.success) {
            throw new Error(speiResponse.error || 'Error en la transferencia SPEI');
          }
        } catch (speiError) {
          console.error("SPEI transfer error:", speiError);
          throw new Error(speiError instanceof Error ? speiError.message : 'Error en la transferencia SPEI');
        }
      }

      // Create movements array
      const movements = [
        // Sender's outbound movement
        db.movements.create({
          user_id: user.id,
          category: isInternalTransfer ? 'INTERNAL' : 'WIRE',
          direction: 'OUTBOUND',
          status: 'COMPLETED',
          amount: amount,
          commission: appliedCommission,
          final_amount: amount + appliedCommission,
          clave_rastreo: claveRastreo,
          counterparty_name: recipientName,
          counterparty_bank: BANK_CODES[recipientBankCode]?.name || 'Unknown Bank',
          counterparty_clabe: recipientClabe,
          concept: concept,
          metadata: isInternalTransfer ? {} : { speiResponse: speiResponse!.data }
        })
      ];

      if (isInternalTransfer) {
        // Add recipient's inbound movement for internal transfers
        movements.push(
          db.movements.create({
            user_id: recipientData.id,
            category: 'INTERNAL', 
            direction: 'INBOUND',
            status: 'COMPLETED',
            amount: amount,
            commission: 0,
            final_amount: amount,
            clave_rastreo: claveRastreo,
            counterparty_name: senderFullName,
            counterparty_bank: 'CEDI',
            counterparty_clabe: senderData.clabe,
            concept: concept,
            metadata: {}
          })
        );
      } else if (commissionAccount) {
        // Add commission movement for non-internal transfers
        movements.push(
          db.movements.create({
            user_id: commissionAccount.id,
            category: 'INTERNAL',
            direction: 'INBOUND',
            status: 'COMPLETED',
            amount: appliedCommission,
            commission: 0,
            final_amount: appliedCommission,
            clave_rastreo: claveRastreo,
            counterparty_name: senderFullName,
            counterparty_bank: 'CEDI',
            counterparty_clabe: senderData.clabe,
            concept: 'Comisión por transferencia SPEI saliente',
            metadata: { speiResponse: speiResponse?.data }
          })
        );
      }

      await Promise.all(movements);

      // 3. Update balances
      const newSenderBalance = senderData.balance - (amount + appliedCommission);
      const updates = [
        // Update sender balance
        db.users.createOrUpdate({
          id: user.id,
          email: senderData.email || user.email || '',  // Add fallback for email
          given_name: senderData.given_name,
          family_name: senderData.family_name,
          balance: newSenderBalance,
          clabe: senderData.clabe
        })
      ];

      if (isInternalTransfer && recipientData) {
        // Update recipient balance for internal transfers
        updates.push(
          db.users.createOrUpdate({
            id: recipientData.id,
            email: recipientData.email || `${recipientData.email}`,  // Ensure email is never null
            given_name: recipientData.given_name,
            family_name: recipientData.family_name,
            balance: (recipientData.balance || 0) + amount,
            clabe: recipientData.clabe
          })
        );
      } else if (commissionAccount) {
        // Update commission account balance for non-internal transfers
        updates.push(
          db.users.createOrUpdate({
            id: commissionAccount.id,
            email: commissionAccount.email || `${commissionAccount.email}`,  // Ensure email is never null
            given_name: commissionAccount.given_name,
            family_name: commissionAccount.family_name,
            balance: (commissionAccount.balance || 0) + appliedCommission,
            clabe: commissionAccount.clabe
          })
        );
      }

      await Promise.all(updates);

      return { newSenderBalance };

    } catch (err) {
      console.error("Transfer error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error en la transferencia",
      });
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    try {
      const formData = new FormData(form);
      const amount = Number(formData.get('amount'));
      const totalAmount = amount + userCommission;

      // Add balance validation
      if (totalAmount > userBalance) {
        throw new Error('Saldo insuficiente para realizar la transferencia');
      }

      const destinationClabe = formData.get('clabe') as string;
      const saveAccount = formData.get('saveAccount') === 'on';
      const beneficiaryName = formData.get('beneficiaryName') as string;
      const institution = formData.get('institution') as string;
      const concept = formData.get('concept') as string;
      const concept2 = formData.get('concept2') as string;
      
      if (!user) {
        throw new Error('No user authenticated');
      }

      // First execute the transfer
      const result = await handleTransfer(
        destinationClabe,
        amount,
        concept,
        concept2
      );

      // Only save the contact if transfer was successful and user opted to save
      if (result?.newSenderBalance !== undefined && saveAccount) {
        try {
          const bankCode = institution || detectedBank?.code || 'unknown';
          const bankName = BANK_CODES[bankCode]?.name || 'Desconocido';
          const alias = formData.get('contactAlias') as string;

          console.log('Saving contact with data:', {
            userId: user.id,
            clabe: destinationClabe,
            name: beneficiaryName,
            alias: alias || beneficiaryName,
            bank: bankName
          });

          const newContact = await db.contacts.create({
            user_id: user.id,
            clabe: destinationClabe,
            name: beneficiaryName,
            alias: alias || beneficiaryName,
            bank: bankName
          });

          console.log('Contact creation response:', newContact);
          if (newContact.data) {
            setContacts(prevContacts => [...prevContacts, {
              id: newContact.data!.id,
              value: newContact.data!.clabe,
              name: newContact.data!.name,
              alias: newContact.data!.alias || undefined
            }]);
          }
        } catch (error) {
          console.error('Failed to create contact:', error);
          // Don't fail the whole operation if contact creation fails
          toast({
            variant: "default",
            title: "Transferencia exitosa",
            description: "La transferencia se completó pero no se pudo guardar el contacto",
          });
          return;
        }
      }

      if (result?.newSenderBalance !== undefined) {
        setUserBalance(result.newSenderBalance);
        toast({
          title: "Transferencia completada correctamente",
          description: "La transferencia se ha realizado correctamente",
        });
        
        // Reset form and total amount field
        form.reset();
        const totalAmountInput = document.getElementById('totalAmount') as HTMLInputElement;
        if (totalAmountInput) {
          totalAmountInput.value = '';
        }
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "Error al realizar la transferencia",
        description: error instanceof Error ? error.message : "Error al realizar la transferencia",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    // Find and update the CLABE input
    const clabeInput = document.getElementById('clabe') as HTMLInputElement;
    if (clabeInput) {
      clabeInput.value = contact.value;
    }

    // Find and update the beneficiary name input with the actual name
    const nameInput = document.getElementById('beneficiaryName') as HTMLInputElement;
    if (nameInput) {
      nameInput.value = contact.name;
    }

    // Trigger CLABE validation if needed
    handleClabeChange({ target: { value: contact.value } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleClabeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clabe = e.target.value;
    if (clabe.length >= 3) {
      const bankCode = clabe.substring(0, 3);
      const bank = BANK_CODES[bankCode];
      setDetectedBank(bank || null);
      
      // Automatically set the institution in the select
      const institutionSelect = document.querySelector('select[name="institution"]') as HTMLSelectElement;
      if (institutionSelect && bank) {
        institutionSelect.value = bank.code;
      }
    } else {
      setDetectedBank(null);
    }
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

  const prepareOutboundPayload = (
    senderClabe: string,
    recipientClabe: string,
    amount: number,  // This should be the base amount without commission
    concept: string,
    senderName: string,
    recipientName: string,
    bankCode: string,
    claveRastreo: string
  ) => {
    // Determine if the recipient account is a card (16 digits) or CLABE (18 digits)
    const tipoCuenta = recipientClabe.length === 16 ? "3" : "40";

    // Only send the base amount without commission to the external recipient
    return {
      claveRastreo,
      conceptoPago: concept,
      cuentaOrdenante: senderClabe,
      cuentaBeneficiario: recipientClabe,
      empresa: "CEDI",
      institucionContraparte: getInstitutionCode(bankCode),
      institucionOperante: "90646",
      monto: amount,  // Using base amount without commission
      nombreBeneficiario: recipientName,
      nombreOrdenante: senderName,
      referenciaNumerica: Math.floor(100000 + Math.random() * 900000).toString(),
      rfcCurpBeneficiario: "ND",
      rfcCurpOrdenante: "ND",
      tipoCuentaBeneficiario: tipoCuenta,
      tipoCuentaOrdenante: "40",
      tipoPago: "1"
    };
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await db.contacts.delete(contactId);

      // Update local state to remove the deleted contact
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId));
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast({
        variant: "destructive",
        title: "Error al eliminar el contacto",
        description: "No se pudo eliminar el contacto",
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left side - Contact List */}
      <div className="col-span-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Input 
                type="search" 
                placeholder="Buscar contacto..." 
                className="w-full font-clash-display"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-[400px] overflow-y-auto space-y-2">
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <Card 
                    key={contact.id} 
                    className="p-3 hover:bg-accent"
                  >
                    <div className="flex justify-between items-center">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium font-clash-display">
                            {contact.alias || contact.name}
                          </p>
                          <p className="text-sm text-muted-foreground font-clash-display">
                            {contact.value}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(contact.id);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground font-clash-display">
                  No hay contactos guardados
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Right side - Transfer Form */}
      <div className="col-span-8">
        <Card className="p-6">
          {/* Add balance display */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground font-clash-display">
              Saldo disponible: ${userBalance.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs 
              defaultValue="clabe" 
              className="w-full"
              onValueChange={(value) => setSelectedTab(value as 'clabe' | 'tarjeta' | 'celular')}
            >
              <TabsList>
                <TabsTrigger className="font-clash-display" value="clabe">CLABE</TabsTrigger>
                <TabsTrigger className="font-clash-display" value="tarjeta">Tarjeta</TabsTrigger>
                <TabsTrigger className="font-clash-display" value="celular">Celular</TabsTrigger>
              </TabsList>

              <TabsContent value="clabe">
                <div className="space-y-4">
                  <div>
                    <Label className="font-clash-display" htmlFor="clabe">CLABE</Label>
                    <Input 
                      className="font-clash-display" 
                      name="clabe" 
                      id="clabe" 
                      placeholder="18 dígitos" 
                      maxLength={18}
                      onChange={handleClabeChange}
                    />
                    {detectedBank && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Banco detectado: {detectedBank.name}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tarjeta">
                <div className="space-y-4">
                  <div>
                    <Label className="font-clash-display" htmlFor="tarjeta">Número de Tarjeta</Label>
                    <Input 
                      className="font-clash-display" 
                      name="tarjeta" 
                      id="tarjeta" 
                      placeholder="16 dígitos" 
                      maxLength={16} 
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="celular">
                <div className="space-y-4">
                  <div>
                    <Label className="font-clash-display" htmlFor="celular">Número de Celular</Label>
                    <Input 
                      className="font-clash-display" 
                      name="celular" 
                      id="celular" 
                      placeholder="10 dígitos" 
                      maxLength={10} 
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Institution */}
            <div>
              <Label className="font-clash-display" htmlFor="institution">Institución</Label>
              <Select name="institution" disabled={!!detectedBank}>
                <SelectTrigger>
                  <SelectValue className="font-clash-display" placeholder={detectedBank ? detectedBank.name : "Seleccionar banco"} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {Object.values(BANK_CODES)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((bank) => (
                      <SelectItem 
                        key={bank.code} 
                        value={bank.code}
                        className="font-clash-display"
                      >
                        {bank.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label className="font-clash-display" htmlFor="amount">Monto</Label>
              <Input 
                className="font-clash-display"
                id="amount" 
                name="amount"
                type="number" 
                placeholder="$0.00" 
                min="0"
                step="0.01"
                onChange={handleAmountChange}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Comisión: ${userCommission.toFixed(2)}
              </p>
            </div>

            {/* Total Amount */}
            <div>
              <Label className="font-clash-display" htmlFor="totalAmount">Monto Total</Label>
              <Input 
                className="font-clash-display"
                id="totalAmount" 
                name="totalAmount"
                type="number" 
                placeholder="$0.00" 
                disabled 
              />
            </div>

            {/* Beneficiary Name */}
            <div>
              <Label className="font-clash-display" htmlFor="beneficiaryName">Nombre del beneficiario</Label>
              <Input 
                className="font-clash-display"
                id="beneficiaryName" 
                name="beneficiaryName"
                placeholder="Nombre completo" 
              />
            </div>

            {/* Payment Concept */}
            <div>
              <Label className="font-clash-display" htmlFor="concept">Concepto del pago</Label>
              <Input 
                className="font-clash-display"
                id="concept" 
                name="concept"
                placeholder="Concepto" 
              />
            </div>

            {/* Optional Second Concept */}
            <div>
              <Label className="font-clash-display" htmlFor="concept2">Concepto 2 (opcional)</Label>
              <Input 
                className="font-clash-display"
                id="concept2" 
                name="concept2"
                placeholder="Concepto adicional" 
              />
            </div>

            {/* Save Account Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="saveAccount" 
                name="saveAccount" 
                onCheckedChange={(checked) => {
                  // Find the alias input container and toggle its visibility
                  const aliasContainer = document.getElementById('aliasContainer');
                  if (aliasContainer) {
                    aliasContainer.style.display = checked ? 'block' : 'none';
                  }
                }}
              />
              <Label 
                htmlFor="saveAccount" 
                className="text-sm font-clash-display leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Guardar cuenta
              </Label>
            </div>

            {/* Alias input - hidden by default */}
            <div id="aliasContainer" className="hidden">
              <Label className="font-clash-display" htmlFor="contactAlias">Alias para el contacto</Label>
              <Input 
                className="font-clash-display"
                id="contactAlias" 
                name="contactAlias"
                placeholder="Ej: Mamá, Trabajo, etc." 
              />
            </div>

            {/* Add error message for insufficient funds */}
            <div 
              id="insufficientFundsError" 
              className="text-destructive text-sm font-clash-display" 
              style={{ display: 'none' }}
            >
              Saldo insuficiente para realizar esta transferencia
            </div>

            <Button 
              type="submit" 
              className="w-full font-clash-display" 
              disabled={loading || userBalance <= userCommission}
            >
              {loading ? "Procesando..." : 
               userBalance <= userCommission ? 
               "Saldo insuficiente" : 
               "Realizar transferencia"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}