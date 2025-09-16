export const BANK_CODES: { [key: string]: { code: string; name: string } } = {
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
  
  export const BANK_TO_INSTITUTION: { [key: string]: string } = {
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
  
  export const SECONDARY_INSTITUTIONS: { [key: string]: string } = {
    "002": "91802", // BANAMEX2
    "012": "91812", // BBVA BANCOMER2
    "014": "91814", // SANTANDER2
    "021": "91821", // HSBC2
    "072": "91872", // BANORTE2
    "127": "91927", // AZTECA2
  };

  export const MONATO_BANK_CODES = [
    {
        "id": "5d776c65-23be-48fa-9ca2-c2e260c38d55",
        "name": "MEMBER_A",
        "token": "123",
        "BIM": "123",
        "code": "301",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7acb94d4-a241-4727-82c7-d01eb1a2198b",
        "name": "GEM-BANAMEX",
        "token": "124",
        "BIM": "124",
        "code": "302",
        "bank_status": "ACTIVE"
    },
    {
        "id": "a148952b-236c-409f-97b9-635951c53e7c",
        "name": "GEM-BANKOFCHINA",
        "token": "125",
        "BIM": "125",
        "code": "303",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d0424c8b-6a26-48e5-9b07-d21cc8b29498",
        "name": "GEM-PRESTAMO",
        "token": "126",
        "BIM": "126",
        "code": "304",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6d578e03-c993-4da8-a16e-5ef5925b17d6",
        "name": "GEM-PRESTAMO",
        "token": "127",
        "BIM": "127",
        "code": "305",
        "bank_status": "ACTIVE"
    },
    {
        "id": "a9d08380-c71c-4cbb-a355-e4874fc10ed1",
        "name": "GEM-PRESTAMO",
        "token": "128",
        "BIM": "128",
        "code": "306",
        "bank_status": "ACTIVE"
    },
    {
        "id": "cfa0909c-1b73-407b-8733-5fd175fb7952",
        "name": "GEM-PRESTAMO",
        "token": "129",
        "BIM": "129",
        "code": "307",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e6695cc6-d2d6-4550-abae-45aac140e872",
        "name": "GEM-SANTANDES",
        "token": "130",
        "BIM": "130",
        "code": "314",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1f451a75-e364-4fa0-89b3-62dc5ad6be10",
        "name": "GEM-MIFEL",
        "token": "131",
        "BIM": "131",
        "code": "315",
        "bank_status": "ACTIVE"
    },
    {
        "id": "78d1826a-ee52-40dd-a3ba-ff76144b8b00",
        "name": "GEM-HSBC",
        "token": "132",
        "BIM": "132",
        "code": "321",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5851b6cd-03b1-4905-be70-a132c83520fd",
        "name": "GEM-HSBC_DES",
        "token": "133",
        "BIM": "133",
        "code": "322",
        "bank_status": "ACTIVE"
    },
    {
        "id": "fcafe8db-fe37-4bfd-a590-165493b6f045",
        "name": "GEM-HSBC",
        "token": "134",
        "BIM": "134",
        "code": "323",
        "bank_status": "ACTIVE"
    },
    {
        "id": "655c4814-09bf-40e0-8a76-e212cc28aa7a",
        "name": "GEM-DES_COMPART",
        "token": "135",
        "BIM": "135",
        "code": "330",
        "bank_status": "ACTIVE"
    },
    {
        "id": "31b45807-c29e-47c0-8100-d0728da3f782",
        "name": "GEM-BANCOMER",
        "token": "136",
        "BIM": "136",
        "code": "412",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f1cab385-6495-499e-bf82-df03db68cf8f",
        "name": "GEM-SANTANDE",
        "token": "137",
        "BIM": "137",
        "code": "414",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ee155b86-284c-42bc-9c8f-0818ce58a25b",
        "name": "GEM-HSBC",
        "token": "138",
        "BIM": "138",
        "code": "421",
        "bank_status": "ACTIVE"
    },
    {
        "id": "113b9786-d48c-4a38-8274-8be1583d0645",
        "name": "GEM-INVERLAT",
        "token": "139",
        "BIM": "139",
        "code": "444",
        "bank_status": "ACTIVE"
    },
    {
        "id": "734e01da-0fb5-41e7-9393-1f8b3799f088",
        "name": "GEM-BANKAOOL",
        "token": "140",
        "BIM": "140",
        "code": "447",
        "bank_status": "ACTIVE"
    },
    {
        "id": "16bc8d0c-f24f-41df-a404-d6f4ce786fc7",
        "name": "GEM-PAGATODO",
        "token": "141",
        "BIM": "141",
        "code": "448",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f64f079a-5750-49f0-875a-5c99157e495f",
        "name": "GEM-INMOBIMEX",
        "token": "142",
        "BIM": "142",
        "code": "450",
        "bank_status": "ACTIVE"
    },
    {
        "id": "031cf00c-04ac-4222-823d-a86a3c3185bf",
        "name": "GEM-DONDE",
        "token": "143",
        "BIM": "143",
        "code": "451",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9f4fb12d-fd51-4c54-8a6c-6dd803f433e5",
        "name": "GEM-BMBANCREA",
        "token": "144",
        "BIM": "144",
        "code": "452",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6dd6bf64-35ec-4bbf-910b-560f013fd65b",
        "name": "GEM-ICBC",
        "token": "145",
        "BIM": "145",
        "code": "455",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d5aca3bc-0197-4bd4-aa82-4a6f817e5f0e",
        "name": "GEM-BANXICO",
        "token": "146",
        "BIM": "146",
        "code": "501",
        "bank_status": "ACTIVE"
    },
    {
        "id": "dad7c340-f2ec-4d6e-9234-306813c3fb45",
        "name": "GEM-BANAMEX",
        "token": "147",
        "BIM": "147",
        "code": "502",
        "bank_status": "ACTIVE"
    },
    {
        "id": "385680c0-1617-4b80-b411-b72cb0ce2dca",
        "name": "GEM-BANCOMEXT",
        "token": "148",
        "BIM": "148",
        "code": "506",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ef7ae6a0-4f85-4720-8862-7cf5ae4c941f",
        "name": "GEM-BANOBRAS",
        "token": "149",
        "BIM": "149",
        "code": "509",
        "bank_status": "ACTIVE"
    },
    {
        "id": "01c74f44-57d9-4368-82b2-ea1d280f7187",
        "name": "GEM-BANCOMER",
        "token": "150",
        "BIM": "150",
        "code": "512",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9a3df245-49b5-4ea5-a401-e82fd217c084",
        "name": "GEM-SANTANDER",
        "token": "151",
        "BIM": "151",
        "code": "514",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4ec8bb78-2944-4866-9793-6b0a3541cca1",
        "name": "GEM-BANJERCITO",
        "token": "152",
        "BIM": "152",
        "code": "519",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ecd9f0b1-cc74-4372-a880-845c919dc081",
        "name": "GEM-HSBC",
        "token": "153",
        "BIM": "153",
        "code": "521",
        "bank_status": "ACTIVE"
    },
    {
        "id": "89457d5e-e5e7-4e3a-824c-c0e7f36f2ee4",
        "name": "GEM-BAJIO",
        "token": "154",
        "BIM": "154",
        "code": "530",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f768d6dd-4ab4-456e-a50b-517f28926ccf",
        "name": "GEM-INBURSA",
        "token": "155",
        "BIM": "155",
        "code": "536",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5ee98d5f-6451-4b6d-876b-3bb245758db0",
        "name": "GEM-MIFEL",
        "token": "156",
        "BIM": "156",
        "code": "542",
        "bank_status": "ACTIVE"
    },
    {
        "id": "c5171a03-ce9a-4758-b133-3f22c6d0445a",
        "name": "GEM-INVERLAT",
        "token": "157",
        "BIM": "157",
        "code": "544",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0f588b78-ab91-4ead-a8ba-574db0e08d8e",
        "name": "GEM-BANREGIO",
        "token": "158",
        "BIM": "158",
        "code": "558",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7294cee6-9b13-43f2-8ac2-c5dfef441230",
        "name": "GEM-INVEX",
        "token": "159",
        "BIM": "159",
        "code": "559",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6206b2ca-5dc5-497f-b965-f7bdc61c50ca",
        "name": "GEM-BANSI",
        "token": "160",
        "BIM": "160",
        "code": "560",
        "bank_status": "ACTIVE"
    },
    {
        "id": "166253a0-98aa-4b90-a2d1-8ac4cfb760d0",
        "name": "GEM-AFIRME",
        "token": "161",
        "BIM": "161",
        "code": "562",
        "bank_status": "ACTIVE"
    },
    {
        "id": "06a088b2-638f-4cc4-ba20-4c686dd28d08",
        "name": "GEM-BANSEFI",
        "token": "162",
        "BIM": "162",
        "code": "566",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5ac7bbae-e766-4ecd-9f62-dc303e2a5190",
        "name": "GEM-BANORTE/IXE",
        "token": "163",
        "BIM": "163",
        "code": "572",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4f384bae-6b3d-45b2-9c35-c6086dd7f2fd",
        "name": "GEM-ABNAMRO",
        "token": "164",
        "BIM": "164",
        "code": "602",
        "bank_status": "ACTIVE"
    },
    {
        "id": "49bd1f1d-3119-4768-ab34-84e018e218ee",
        "name": "GEM-AMEX",
        "token": "165",
        "BIM": "165",
        "code": "603",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e8cdab16-2522-4467-bac8-1a2349636a16",
        "name": "GEM-BAMSA",
        "token": "166",
        "BIM": "166",
        "code": "606",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2b566894-3052-4e0a-8bbd-2db8e4bc8b5c",
        "name": "GEM-TOKYO",
        "token": "167",
        "BIM": "167",
        "code": "608",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0db9a23d-a5a7-4c8f-8dcb-489eac68ba92",
        "name": "GEM-JPMORGAN",
        "token": "168",
        "BIM": "168",
        "code": "610",
        "bank_status": "ACTIVE"
    },
    {
        "id": "59f4fc5c-4272-4e8e-91bf-a4617bbf1856",
        "name": "GEM-MONEX",
        "token": "169",
        "BIM": "169",
        "code": "612",
        "bank_status": "ACTIVE"
    },
    {
        "id": "491b7bdf-c85a-4bdc-b76b-02aa0a0c7835",
        "name": "GEM-VEPORMAS",
        "token": "170",
        "BIM": "170",
        "code": "613",
        "bank_status": "ACTIVE"
    },
    {
        "id": "20279338-e0d6-425a-86d7-307332a09d00",
        "name": "GEM-DEUTSCHE",
        "token": "171",
        "BIM": "171",
        "code": "624",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f5d50990-9330-4b3b-b34a-547bb6d09ec8",
        "name": "GEM-CREDITSUIS",
        "token": "172",
        "BIM": "172",
        "code": "626",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0c417d43-ef17-472e-9754-2b97a9e1214d",
        "name": "GEM-AZTECA",
        "token": "173",
        "BIM": "173",
        "code": "627",
        "bank_status": "ACTIVE"
    },
    {
        "id": "273f59f0-ef9e-4e27-bec3-f89f9e1d6cc2",
        "name": "GEM-AUTOFIN",
        "token": "174",
        "BIM": "174",
        "code": "628",
        "bank_status": "ACTIVE"
    },
    {
        "id": "42a58b95-2664-4dd2-84c2-d435dceb1511",
        "name": "GEM-BARCLAYS",
        "token": "175",
        "BIM": "175",
        "code": "629",
        "bank_status": "ACTIVE"
    },
    {
        "id": "49aa3cc6-1644-41f7-a7c1-146f2c201fc1",
        "name": "GEM-COMPARTAMOS",
        "token": "176",
        "BIM": "176",
        "code": "630",
        "bank_status": "ACTIVE"
    },
    {
        "id": "494b51c8-af10-4515-82f6-9f57044ebc20",
        "name": "GEM-MULTIVA",
        "token": "177",
        "BIM": "177",
        "code": "632",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bb88b9d1-e016-4c14-ad1f-5b4a3533713a",
        "name": "GEM-BCOACTINVE",
        "token": "178",
        "BIM": "178",
        "code": "633",
        "bank_status": "ACTIVE"
    },
    {
        "id": "90233a2f-8645-4c19-9e67-be8747bd5175",
        "name": "GEM-NAFIN",
        "token": "179",
        "BIM": "179",
        "code": "635",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f5c7875c-b7de-405f-b2ff-79308254d4f5",
        "name": "GEM-INTERCAM",
        "token": "180",
        "BIM": "180",
        "code": "636",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0e18131b-fca6-4239-83cb-c4683a176999",
        "name": "GEM-BANCOPPEL",
        "token": "181",
        "BIM": "181",
        "code": "637",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5aa8b1c8-4ea0-4023-a4c0-38e919bf9e5a",
        "name": "GEM-NORESTE",
        "token": "182",
        "BIM": "182",
        "code": "638",
        "bank_status": "ACTIVE"
    },
    {
        "id": "56e72b71-aa4c-4c08-aed4-0ff90e65f1ec",
        "name": "GEM-CONSUBANCO",
        "token": "183",
        "BIM": "183",
        "code": "640",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5810368c-13d4-49a5-a868-8b158e7a55c2",
        "name": "GEM-VOLKSWAGEN",
        "token": "184",
        "BIM": "184",
        "code": "641",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bf3408cc-db2a-43e9-b22a-e2a49e07af95",
        "name": "GEM-CHIHUAHUA",
        "token": "185",
        "BIM": "185",
        "code": "653",
        "bank_status": "ACTIVE"
    },
    {
        "id": "94d4dc51-05e0-42a4-9e95-5919094834f6",
        "name": "GEM-FINTERRA",
        "token": "186",
        "BIM": "186",
        "code": "654",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f6ba2978-35f1-4b17-802f-4ca5a5872575",
        "name": "GEM-SABADELL",
        "token": "187",
        "BIM": "187",
        "code": "656",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0ded595e-224d-443f-98e4-2fb94313393f",
        "name": "GEM-SHINHAN",
        "token": "188",
        "BIM": "188",
        "code": "657",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bb04ed13-3f77-4f36-88e9-2fec8ac00f31",
        "name": "GEM-MIZUHO",
        "token": "189",
        "BIM": "189",
        "code": "658",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b886e305-bf74-4890-81e1-23ff5e48b9f2",
        "name": "GEM-BANCOS",
        "token": "190",
        "BIM": "190",
        "code": "660",
        "bank_status": "ACTIVE"
    },
    {
        "id": "00f71c95-8401-4996-aa5d-cd331ba00f8e",
        "name": "GEM-HIPOTECARIA",
        "token": "191",
        "BIM": "191",
        "code": "668",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f64e8445-3d60-48c6-80a6-cf8a9488e087",
        "name": "GEM-GBM",
        "token": "192",
        "BIM": "192",
        "code": "707",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9f0f6c05-6d83-443f-8362-11b3143e0174",
        "name": "GEM-VALUE",
        "token": "193",
        "BIM": "193",
        "code": "719",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b98d0490-090a-48e2-8800-505c4e78ed75",
        "name": "GEM-MONEX",
        "token": "194",
        "BIM": "194",
        "code": "721",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1542cc25-d3c3-42ad-becf-7b4ae66a8a2f",
        "name": "GEM-CONSULTORIA",
        "token": "195",
        "BIM": "195",
        "code": "743",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2acded1f-4b4f-4e15-8e95-a6cf557dc245",
        "name": "GEM-BANCOPP",
        "token": "196",
        "BIM": "196",
        "code": "756",
        "bank_status": "ACTIVE"
    },
    {
        "id": "eea22461-24ba-4f3c-97be-dcd2b037de13",
        "name": "GEM-BANCOPP",
        "token": "197",
        "BIM": "197",
        "code": "757",
        "bank_status": "ACTIVE"
    },
    {
        "id": "c015bc14-25f5-4b1c-ad3b-6d71567bccb9",
        "name": "GEM-MASARI",
        "token": "198",
        "BIM": "198",
        "code": "767",
        "bank_status": "ACTIVE"
    },
    {
        "id": "14d4c817-8920-4ffb-b52f-a8f3866b491b",
        "name": "GEM-ARCUS",
        "token": "199",
        "BIM": "199",
        "code": "806",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0276ac9e-8f9e-461f-aa1f-5bd3e2844f9a",
        "name": "GEM-MULTIVA",
        "token": "200",
        "BIM": "200",
        "code": "813",
        "bank_status": "ACTIVE"
    },
    {
        "id": "44ec57a1-fd68-44be-a4a4-6196c80ca264",
        "name": "GEM-FINAMEX",
        "token": "201",
        "BIM": "201",
        "code": "816",
        "bank_status": "ACTIVE"
    },
    {
        "id": "45ffdd1c-1d3e-4663-9ea5-f311d4026372",
        "name": "GEM-VALMEX",
        "token": "202",
        "BIM": "202",
        "code": "817",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b0559198-1be1-4508-97a1-31920e19ffc9",
        "name": "GEM-PROFUTURO",
        "token": "203",
        "BIM": "203",
        "code": "820",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7548ce5b-bb6b-44e4-a993-6d39b11794bc",
        "name": "GEM-ESTRUCTURAD",
        "token": "204",
        "BIM": "204",
        "code": "823",
        "bank_status": "ACTIVE"
    },
    {
        "id": "14584919-f732-4cf8-9757-9dedf67d2578",
        "name": "GEM-VECTOR",
        "token": "205",
        "BIM": "205",
        "code": "826",
        "bank_status": "ACTIVE"
    },
    {
        "id": "541f41eb-a85b-4020-9739-a90e63061c4a",
        "name": "GEM-CBINTERCAM",
        "token": "206",
        "BIM": "206",
        "code": "830",
        "bank_status": "ACTIVE"
    },
    {
        "id": "a0440088-c385-468b-ab32-ab572c0d9824",
        "name": "GEM-CIBOLSA",
        "token": "207",
        "BIM": "207",
        "code": "831",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ce4b8ce8-7a25-4662-b816-9241c58222c3",
        "name": "GEM-FINCOMUN",
        "token": "208",
        "BIM": "208",
        "code": "834",
        "bank_status": "ACTIVE"
    },
    {
        "id": "78d517a7-d158-4326-9447-49f1b0618cab",
        "name": "GEM-HDISEGUROS",
        "token": "209",
        "BIM": "209",
        "code": "836",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8a06ead8-46f7-4130-a255-c2297a82816b",
        "name": "GEM-AKALA",
        "token": "210",
        "BIM": "210",
        "code": "838",
        "bank_status": "ACTIVE"
    },
    {
        "id": "19775840-87ec-4cd7-83e7-359dbc13fd94",
        "name": "GEM-C.B.J.P.M",
        "token": "211",
        "BIM": "211",
        "code": "840",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2a8dd9f3-ecc6-4d28-919a-a3939ee72222",
        "name": "GEM-REFORMA",
        "token": "212",
        "BIM": "212",
        "code": "842",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9822f25a-b568-4172-ae1f-ef475b95d072",
        "name": "GEM-STP",
        "token": "213",
        "BIM": "213",
        "code": "846",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3e86d34f-fb34-44fb-a0bb-26de6a74e98b",
        "name": "GEM-EVERCORE",
        "token": "214",
        "BIM": "214",
        "code": "848",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1e20ed13-00e8-4a42-93af-ae728d41c9f5",
        "name": "GEM-ASEA",
        "token": "215",
        "BIM": "215",
        "code": "852",
        "bank_status": "ACTIVE"
    },
    {
        "id": "12dd60c1-5617-4224-9a79-c972faf91dca",
        "name": "GEMELOKUSPIT",
        "token": "216",
        "BIM": "216",
        "code": "853",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0672f112-6b6f-40be-a5a1-be14c401dda1",
        "name": "GEM-BBASE",
        "token": "217",
        "BIM": "217",
        "code": "854",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e36d38de-aed4-4d03-b355-57b072378740",
        "name": "GEM-UNAGRA",
        "token": "218",
        "BIM": "218",
        "code": "857",
        "bank_status": "ACTIVE"
    },
    {
        "id": "cd82db51-7175-447a-8c7b-7d4528a251cc",
        "name": "GEM-INDEVAL",
        "token": "219",
        "BIM": "219",
        "code": "858",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d9503de5-24da-42a4-bb14-6fe0ee71e9df",
        "name": "GEM-ASP-FINANC",
        "token": "220",
        "BIM": "220",
        "code": "860",
        "bank_status": "ACTIVE"
    },
    {
        "id": "dfe4dc61-e03d-4dd6-b812-b433a7cb16fa",
        "name": "GEM-LIBERTAD",
        "token": "221",
        "BIM": "221",
        "code": "861",
        "bank_status": "ACTIVE"
    },
    {
        "id": "c7b1632b-bb6a-41d1-af5e-749574adcc67",
        "name": "GEM-C.B.INBURS",
        "token": "222",
        "BIM": "222",
        "code": "876",
        "bank_status": "ACTIVE"
    },
    {
        "id": "de6a084b-50b6-4107-af50-558f5dafea71",
        "name": "GEM-CAJAPOPMEX",
        "token": "223",
        "BIM": "223",
        "code": "877",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0d6d9267-c386-48c2-b344-9d3f7bc26e67",
        "name": "GEM-CAJCRISTOB",
        "token": "224",
        "BIM": "224",
        "code": "880",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8965aaf1-dfa7-4d30-b579-98209bc8b67e",
        "name": "GEM-PRESTAMO",
        "token": "225",
        "BIM": "225",
        "code": "881",
        "bank_status": "ACTIVE"
    },
    {
        "id": "029515cd-41af-490a-8550-10208b04f9f7",
        "name": "GEM-CAJA_TELMEX",
        "token": "226",
        "BIM": "226",
        "code": "883",
        "bank_status": "ACTIVE"
    },
    {
        "id": "c3f1ab88-0542-40a3-94b1-293fdb30a770",
        "name": "GEM-TRANSFER",
        "token": "227",
        "BIM": "227",
        "code": "884",
        "bank_status": "ACTIVE"
    },
    {
        "id": "51170234-e795-4e1f-bb91-15f1ffa6b650",
        "name": "GEM-FONDO",
        "token": "228",
        "BIM": "228",
        "code": "885",
        "bank_status": "ACTIVE"
    },
    {
        "id": "82f3ee65-9d0c-4e80-8727-7a213990638c",
        "name": "GEM-INVERCAP",
        "token": "229",
        "BIM": "229",
        "code": "886",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bdf4fa69-ac3c-4022-a57a-6f6090017e6c",
        "name": "GEM-CREDICLUB",
        "token": "230",
        "BIM": "230",
        "code": "888",
        "bank_status": "ACTIVE"
    },
    {
        "id": "386ce332-4270-4319-8aca-d3b2c9218daf",
        "name": "GEM-XXI-BANORTE",
        "token": "231",
        "BIM": "231",
        "code": "892",
        "bank_status": "ACTIVE"
    },
    {
        "id": "faa9ec6b-2823-4ba9-a476-d81a71d675d2",
        "name": "GEM-TECREEMOS",
        "token": "232",
        "BIM": "232",
        "code": "895",
        "bank_status": "ACTIVE"
    },
    {
        "id": "66456cb6-1fd1-4b73-83b4-926196760043",
        "name": "GEM-PROSA",
        "token": "233",
        "BIM": "233",
        "code": "896",
        "bank_status": "ACTIVE"
    },
    {
        "id": "65f7832f-4193-4e2b-a40b-d1da778fd352",
        "name": "GEM-CAPITALACT",
        "token": "234",
        "BIM": "234",
        "code": "897",
        "bank_status": "ACTIVE"
    },
    {
        "id": "47496ea5-ab5c-4ec6-98c5-372df387b94a",
        "name": "GEM-BURSAMETRIC",
        "token": "235",
        "BIM": "235",
        "code": "898",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3ae00595-20a5-424c-9a9a-3f88f4a55ecd",
        "name": "NAFIN",
        "token": "240",
        "BIM": "135",
        "code": "37135",
        "bank_status": "ACTIVE"
    },
    {
        "id": "dde426ad-95c6-4305-b7fc-ca7e93fae02c",
        "name": "BANSEFI",
        "token": "241",
        "BIM": "166",
        "code": "37166",
        "bank_status": "ACTIVE"
    },
    {
        "id": "15bb1e94-cd5a-4acd-85b2-73a66838dd60",
        "name": "HIPOTECARIAFED",
        "token": "242",
        "BIM": "168",
        "code": "37168",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f086a7c4-8db3-403a-810e-06dc4f032320",
        "name": "ACCENDOBANCO",
        "token": "256",
        "BIM": "102",
        "code": "40102",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b5446d7a-a4bd-459b-940e-39617e0dc278",
        "name": "AMERICANEXPRES",
        "token": "257",
        "BIM": "103",
        "code": "40103",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7f7a8c75-0c45-43e5-bbc7-ee5d90ff5ad1",
        "name": "BANKOFAMERICA",
        "token": "258",
        "BIM": "106",
        "code": "40106",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9d105d03-a1b7-4e07-b968-08834fe1a077",
        "name": "MUFG",
        "token": "259",
        "BIM": "108",
        "code": "40108",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0a0e0b50-02c2-4c30-9fdc-788afd89182b",
        "name": "JPMORGAN",
        "token": "260",
        "BIM": "110",
        "code": "40110",
        "bank_status": "ACTIVE"
    },
    {
        "id": "eb0bb160-cc6b-4dc7-80cf-d7a3b26c4695",
        "name": "BMONEX",
        "token": "261",
        "BIM": "112",
        "code": "40112",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5aecc4af-cf14-4465-8a24-8bb8a84a8d27",
        "name": "VEPORMAS",
        "token": "262",
        "BIM": "113",
        "code": "40113",
        "bank_status": "ACTIVE"
    },
    {
        "id": "17b12906-faa6-4c44-b29f-073d3e8943eb",
        "name": "DEUTSCHE",
        "token": "263",
        "BIM": "124",
        "code": "40124",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4e0580c6-ce15-41be-be9b-275e3cf26179",
        "name": "CREDITSUISSE",
        "token": "264",
        "BIM": "126",
        "code": "40126",
        "bank_status": "ACTIVE"
    },
    {
        "id": "75528459-b61c-40f8-9625-5ccf68b4b8f3",
        "name": "AZTECA",
        "token": "265",
        "BIM": "127",
        "code": "40127",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b82df284-83c4-4a27-874f-e67bd9e2c3e5",
        "name": "AUTOFIN",
        "token": "266",
        "BIM": "128",
        "code": "40128",
        "bank_status": "ACTIVE"
    },
    {
        "id": "72cd9d78-9da0-4cf3-a4e4-dd1c38028ea8",
        "name": "BARCLAYS",
        "token": "267",
        "BIM": "129",
        "code": "40129",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2533ed6d-65b3-4e1d-b334-bb54e4308c83",
        "name": "COMPARTAMOS",
        "token": "268",
        "BIM": "130",
        "code": "40130",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b0fa8077-53e4-468a-bd97-15c8f8c5ed74",
        "name": "MULTIVABANCO",
        "token": "269",
        "BIM": "132",
        "code": "40132",
        "bank_status": "ACTIVE"
    },
    {
        "id": "90ba511d-95bf-4849-a7be-cfc9d569dd77",
        "name": "ACTINVER",
        "token": "270",
        "BIM": "133",
        "code": "40133",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2754e317-d703-4827-a891-494b02fbd4d5",
        "name": "INTERCAMBANCO",
        "token": "271",
        "BIM": "136",
        "code": "40136",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f058590a-436f-4f0e-96f3-ba8f594ca2cc",
        "name": "BANCOPPEL",
        "token": "272",
        "BIM": "137",
        "code": "40137",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7ec813b6-759c-493f-b01c-d3cd8212217f",
        "name": "ABCCAPITAL",
        "token": "273",
        "BIM": "138",
        "code": "40138",
        "bank_status": "ACTIVE"
    },
    {
        "id": "cf6de715-98d1-4f1c-b924-1498af67cd8e",
        "name": "CONSUBANCO",
        "token": "274",
        "BIM": "140",
        "code": "40140",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bb6bd49f-0eec-4958-90e7-8bfe47f205b4",
        "name": "VOLKSWAGEN",
        "token": "275",
        "BIM": "141",
        "code": "40141",
        "bank_status": "ACTIVE"
    },
    {
        "id": "365e6ebf-4d8a-4773-acb4-857c58414719",
        "name": "CIBANCO",
        "token": "276",
        "BIM": "143",
        "code": "40143",
        "bank_status": "ACTIVE"
    },
    {
        "id": "bdd4b0e1-72e3-4108-888c-61e392fce607",
        "name": "BBASE",
        "token": "277",
        "BIM": "145",
        "code": "40145",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9593c687-d582-4703-82c5-42da69c8802c",
        "name": "BANKAOOL",
        "token": "278",
        "BIM": "147",
        "code": "40147",
        "bank_status": "ACTIVE"
    },
    {
        "id": "934f9e53-6655-4a7d-bae1-3d5a8c4a135d",
        "name": "PAGATODO",
        "token": "279",
        "BIM": "148",
        "code": "40148",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f88117e5-5e7a-4832-ba54-d44e256559d7",
        "name": "INMOBILIARIO",
        "token": "280",
        "BIM": "150",
        "code": "40150",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9aaff858-3a0a-4319-91fe-918e50042e12",
        "name": "DONDE",
        "token": "281",
        "BIM": "151",
        "code": "40151",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9a6624b2-cf14-49e7-bdf5-b2bff7d9f566",
        "name": "BANCREA",
        "token": "282",
        "BIM": "152",
        "code": "40152",
        "bank_status": "ACTIVE"
    },
    {
        "id": "aa62d89a-ce0d-4768-8285-b2a850f8257d",
        "name": "PROGRESO",
        "token": "283",
        "BIM": "153",
        "code": "40153",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e3d83df5-c164-4435-8b89-d4abf20beef8",
        "name": "BANCOFINTERRA",
        "token": "284",
        "BIM": "154",
        "code": "40154",
        "bank_status": "ACTIVE"
    },
    {
        "id": "976941c7-1b50-4f81-bf85-b84b8191e826",
        "name": "ICBC",
        "token": "285",
        "BIM": "155",
        "code": "40155",
        "bank_status": "ACTIVE"
    },
    {
        "id": "eab427d7-4d10-4a60-a921-230be1fdf271",
        "name": "SABADELL",
        "token": "286",
        "BIM": "156",
        "code": "40156",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ec32d56c-c67f-4741-8043-449927db2008",
        "name": "BANXICO",
        "token": "236",
        "BIM": "001",
        "code": "2001",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1e8c024f-5276-41c4-bfe9-a4cf07821a34",
        "name": "BANCOMEXT",
        "token": "237",
        "BIM": "006",
        "code": "37006",
        "bank_status": "ACTIVE"
    },
    {
        "id": "80028ffa-88b4-4a94-80e8-3ec9b826b7fb",
        "name": "BANOBRAS",
        "token": "238",
        "BIM": "009",
        "code": "37009",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3054ff18-32a0-478d-b9fe-b5261f9a6e1f",
        "name": "BANAMEX",
        "token": "243",
        "BIM": "002",
        "code": "40002",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d7d1b36b-45f4-4542-b1b9-9fd89186ff6e",
        "name": "SHINHAN",
        "token": "287",
        "BIM": "157",
        "code": "40157",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8ae113df-2de5-470b-b6cc-7a2f853f1f5a",
        "name": "MIZUHOBANK",
        "token": "288",
        "BIM": "158",
        "code": "40158",
        "bank_status": "ACTIVE"
    },
    {
        "id": "fbc27b9b-7a49-43d9-b6f3-4c9c65793893",
        "name": "BANKOFCHINA",
        "token": "289",
        "BIM": "159",
        "code": "40159",
        "bank_status": "ACTIVE"
    },
    {
        "id": "954628e6-0946-4bac-8228-2a9def5b0f8e",
        "name": "BANCOS",
        "token": "290",
        "BIM": "160",
        "code": "40160",
        "bank_status": "ACTIVE"
    },
    {
        "id": "de2592b3-328d-4378-8241-4092ecb31819",
        "name": "BanxicoPruebas",
        "token": "291",
        "BIM": "805",
        "code": "40805",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d0d0e244-0828-4be5-9b28-5c62dd0cd7a8",
        "name": "BANCOPRUEBAS",
        "token": "292",
        "BIM": "819",
        "code": "40819",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0f1f4b11-613d-46c7-9cf4-00182f967b13",
        "name": "BancoPruebas",
        "token": "293",
        "BIM": "820",
        "code": "40820",
        "bank_status": "ACTIVE"
    },
    {
        "id": "a1b176ba-dcda-4ca7-a20a-c1d1405df380",
        "name": "BancoFacilB",
        "token": "294",
        "BIM": "993",
        "code": "40993",
        "bank_status": "ACTIVE"
    },
    {
        "id": "87f3544b-e1db-4433-b507-c223cd3e4e8b",
        "name": "BancoF?cil_R",
        "token": "295",
        "BIM": "994",
        "code": "40994",
        "bank_status": "ACTIVE"
    },
    {
        "id": "eaa38f20-f567-4ff9-96c1-1487ba30db09",
        "name": "BancoF?cil",
        "token": "296",
        "BIM": "995",
        "code": "40995",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6c75d433-8a3c-44d9-a25b-a9ae89283a7a",
        "name": "BanCobroB",
        "token": "297",
        "BIM": "997",
        "code": "40997",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e32200a8-0167-47ed-922e-faa8c9d39d21",
        "name": "BanCobroA",
        "token": "298",
        "BIM": "998",
        "code": "40998",
        "bank_status": "ACTIVE"
    },
    {
        "id": "a19806a6-8699-4c2d-88a2-f3c1409f6aa4",
        "name": "BancoF?cil",
        "token": "299",
        "BIM": "999",
        "code": "40999",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d7741883-4e93-46d8-8b48-c393f2cac99d",
        "name": "MONEXCB",
        "token": "300",
        "BIM": "600",
        "code": "90600",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7c80fff0-a4f1-41bb-b593-300cada50508",
        "name": "GBM",
        "token": "301",
        "BIM": "601",
        "code": "90601",
        "bank_status": "ACTIVE"
    },
    {
        "id": "34934cdf-62c2-4abb-9fca-f3d8defe6948",
        "name": "MASARI",
        "token": "302",
        "BIM": "602",
        "code": "90602",
        "bank_status": "ACTIVE"
    },
    {
        "id": "62f8c845-713b-4de6-bbb0-b7d190922e7c",
        "name": "VALUE",
        "token": "303",
        "BIM": "605",
        "code": "90605",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6f9b0ea5-04d8-4e87-ba9c-fc168dcac186",
        "name": "ESTRUCTURADORES",
        "token": "304",
        "BIM": "606",
        "code": "90606",
        "bank_status": "ACTIVE"
    },
    {
        "id": "04a518e1-3aaf-4f78-987c-7ce16223cda1",
        "name": "VECTOR",
        "token": "305",
        "BIM": "608",
        "code": "90608",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f0d1a2ca-2c4b-416c-b83a-b123f402de99",
        "name": "MULTIVACBOLSA",
        "token": "306",
        "BIM": "613",
        "code": "90613",
        "bank_status": "ACTIVE"
    },
    {
        "id": "718c4e98-2c16-4165-a26a-666eb0a42f77",
        "name": "FINAMEX",
        "token": "307",
        "BIM": "616",
        "code": "90616",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7dd470d4-735d-4cb9-887b-eebf5e7db7fc",
        "name": "VALMEX",
        "token": "308",
        "BIM": "617",
        "code": "90617",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0a82302e-298b-40f3-8319-99a5ae090d18",
        "name": "PROFUTURO",
        "token": "309",
        "BIM": "620",
        "code": "90620",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6a6771d2-f2af-4d5e-9bec-8477e800c0af",
        "name": "CBINTERCAM",
        "token": "310",
        "BIM": "630",
        "code": "90630",
        "bank_status": "ACTIVE"
    },
    {
        "id": "74bfaf1a-c392-4854-b384-5a6503b30903",
        "name": "CIBOLSA",
        "token": "311",
        "BIM": "631",
        "code": "90631",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5c290980-5fe8-49f5-9ebd-d46d7c05c679",
        "name": "FINCOMUN",
        "token": "312",
        "BIM": "634",
        "code": "90634",
        "bank_status": "ACTIVE"
    },
    {
        "id": "24f05278-6598-4f96-87c7-6e7967fb5bdd",
        "name": "HDISEGUROS",
        "token": "313",
        "BIM": "636",
        "code": "90636",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7e086fb2-f78b-4d1d-93f1-1cd6abcb7fef",
        "name": "REFORMA",
        "token": "315",
        "BIM": "642",
        "code": "90642",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d90bde89-d3b9-476b-9ce4-6d5633966011",
        "name": "STP",
        "token": "316",
        "BIM": "646",
        "code": "90646",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8821ed0f-4002-4142-a9b5-781e8661351e",
        "name": "EVERCORE",
        "token": "317",
        "BIM": "648",
        "code": "90648",
        "bank_status": "ACTIVE"
    },
    {
        "id": "07cf60cc-c0b9-4a98-adf6-79a29ee86000",
        "name": "CREDICAPITAL",
        "token": "318",
        "BIM": "652",
        "code": "90652",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1e26b290-74e6-45fa-bb40-e95992af5607",
        "name": "KUSPIT",
        "token": "319",
        "BIM": "653",
        "code": "90653",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f14c5106-0692-402e-be49-c2a2e50d8f60",
        "name": "UNAGRA",
        "token": "320",
        "BIM": "656",
        "code": "90656",
        "bank_status": "ACTIVE"
    },
    {
        "id": "2356a347-d89b-4a58-9d2b-3320bbab2c9a",
        "name": "ASPINTEGRAOPC",
        "token": "321",
        "BIM": "659",
        "code": "90659",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ed810049-2b7d-45a6-9226-a485f7d00ea8",
        "name": "LIBERTAD",
        "token": "322",
        "BIM": "670",
        "code": "90670",
        "bank_status": "ACTIVE"
    },
    {
        "id": "09f84718-7f32-4884-b9c7-ea29f5656a67",
        "name": "C.B.INBURSA",
        "token": "323",
        "BIM": "676",
        "code": "90676",
        "bank_status": "ACTIVE"
    },
    {
        "id": "078e9e77-2f43-40a7-a278-18cb8987b431",
        "name": "CAJAPOPMEXICA",
        "token": "324",
        "BIM": "677",
        "code": "90677",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f4250a14-45ae-46f9-a4af-1564facc3449",
        "name": "CRISTOBALCOLON",
        "token": "325",
        "BIM": "680",
        "code": "90680",
        "bank_status": "ACTIVE"
    },
    {
        "id": "70e75a55-3a1e-4a32-9754-537a6b319809",
        "name": "CAJATELEFONIST",
        "token": "326",
        "BIM": "683",
        "code": "90683",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e39038af-1e15-4bda-9010-ddb871ee91f3",
        "name": "TRANSFER",
        "token": "327",
        "BIM": "684",
        "code": "90684",
        "bank_status": "ACTIVE"
    },
    {
        "id": "49d3672b-3733-4063-afd5-87258093452b",
        "name": "FONDO(FIRA",
        "token": "328",
        "BIM": "685",
        "code": "90685",
        "bank_status": "ACTIVE"
    },
    {
        "id": "77bb9f46-5ab0-4e5c-9d68-5ba13acdca20",
        "name": "CREDICLUB",
        "token": "329",
        "BIM": "688",
        "code": "90688",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8eb43d4d-dbb2-469e-b922-5509e44219e0",
        "name": "FOMPED",
        "token": "330",
        "BIM": "689",
        "code": "90689",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5d16d20b-4d7d-41a1-ab9b-0705a0cd956a",
        "name": "XXI-BANORTE",
        "token": "331",
        "BIM": "692",
        "code": "90692",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e8bbabf3-71fa-47d4-80cb-d783c6f4675f",
        "name": "TECREEMOS",
        "token": "332",
        "BIM": "695",
        "code": "90695",
        "bank_status": "ACTIVE"
    },
    {
        "id": "c1a7c4fe-3d59-4a27-8d90-caac9a433ce9",
        "name": "SCPROMYOP",
        "token": "333",
        "BIM": "696",
        "code": "90696",
        "bank_status": "ACTIVE"
    },
    {
        "id": "8ac1b035-c408-4ede-8c32-491e34e58856",
        "name": "CAPITALACTIVO",
        "token": "334",
        "BIM": "697",
        "code": "90697",
        "bank_status": "ACTIVE"
    },
    {
        "id": "b60b80a3-40da-484f-9d61-15489046e22c",
        "name": "BURSAMETRICA",
        "token": "335",
        "BIM": "698",
        "code": "90698",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5c0ab660-b2d9-420d-996d-96d1823e2d91",
        "name": "ARCUS",
        "token": "336",
        "BIM": "706",
        "code": "90706",
        "bank_status": "ACTIVE"
    },
    {
        "id": "7eb21b6c-b0e0-403b-bcae-2fc54c5cba15",
        "name": "FND",
        "token": "337",
        "BIM": "709",
        "code": "90709",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f4553a12-dd27-49f7-8d18-6a8416f994cb",
        "name": "CLSBANK",
        "token": "338",
        "BIM": "901",
        "code": "90901",
        "bank_status": "ACTIVE"
    },
    {
        "id": "5c889ac3-1e2a-47ad-b072-09bbe958ff17",
        "name": "INDEVAL",
        "token": "339",
        "BIM": "902",
        "code": "90902",
        "bank_status": "ACTIVE"
    },
    {
        "id": "067417b9-1f6c-4c84-8d55-2bbd410cf4e0",
        "name": "BanCobro_R",
        "token": "341",
        "BIM": "904",
        "code": "90904",
        "bank_status": "ACTIVE"
    },
    {
        "id": "fe054736-acb3-41da-a5a8-ac58d03137a1",
        "name": "BanCobro",
        "token": "342",
        "BIM": "996",
        "code": "90996",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6128a707-70e4-439e-b9ec-92e56c14a5d9",
        "name": "BanCobro",
        "token": "343",
        "BIM": "998",
        "code": "90998",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f1d89992-4fc4-4603-a044-c3dbf120c25a",
        "name": "Validador",
        "token": "344",
        "BIM": "999",
        "code": "90999",
        "bank_status": "ACTIVE"
    },
    {
        "id": "08a33c48-94ec-45c1-befc-38711d10211a",
        "name": "GEM-BANXICO",
        "token": "345",
        "BIM": "801",
        "code": "91801",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9b940206-86f4-4888-a553-07353ab473d6",
        "name": "BANAMEX",
        "token": "346",
        "BIM": "802",
        "code": "91802",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9eb79d83-b2a7-4a8d-8475-7905fe6f37b4",
        "name": "BBVABANCOMER",
        "token": "347",
        "BIM": "812",
        "code": "91812",
        "bank_status": "ACTIVE"
    },
    {
        "id": "19409444-ea08-4aff-ac37-5a098f1a1f1e",
        "name": "SANTANDER",
        "token": "348",
        "BIM": "814",
        "code": "91814",
        "bank_status": "ACTIVE"
    },
    {
        "id": "54d9e4e8-c44f-48a3-8fd9-de30789ddd3a",
        "name": "HSBC",
        "token": "349",
        "BIM": "821",
        "code": "91821",
        "bank_status": "ACTIVE"
    },
    {
        "id": "68cfada1-a495-4d00-8c27-166e59745c63",
        "name": "BANORTE",
        "token": "350",
        "BIM": "872",
        "code": "91872",
        "bank_status": "ACTIVE"
    },
    {
        "id": "e6752940-3d0d-49d1-a395-796fb87ffa02",
        "name": "AZTECA",
        "token": "351",
        "BIM": "927",
        "code": "91927",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f2b7877c-6ca9-46f5-96a1-434b05599abc",
        "name": "BANJERCITO",
        "token": "239",
        "BIM": "019",
        "code": "37019",
        "bank_status": "ACTIVE"
    },
    {
        "id": "1953a92c-11e5-4315-b406-b89dd6b699b4",
        "name": "BBVABANCOMER",
        "token": "244",
        "BIM": "012",
        "code": "40012",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3114d179-8a10-40b9-b040-20ff464b50e0",
        "name": "SANTANDER",
        "token": "245",
        "BIM": "014",
        "code": "40014",
        "bank_status": "ACTIVE"
    },
    {
        "id": "f78d3263-65eb-477f-ba55-bd789848f334",
        "name": "HSBC",
        "token": "246",
        "BIM": "021",
        "code": "40021",
        "bank_status": "ACTIVE"
    },
    {
        "id": "245e2c1d-e805-450c-b57d-3f3c1a947169",
        "name": "BAJIO",
        "token": "247",
        "BIM": "030",
        "code": "40030",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3fd10afd-c827-45c1-ae22-38f376de9159",
        "name": "INBURSA",
        "token": "248",
        "BIM": "036",
        "code": "40036",
        "bank_status": "ACTIVE"
    },
    {
        "id": "84217df3-788c-4849-9898-30e958f15fcc",
        "name": "MIFEL",
        "token": "249",
        "BIM": "042",
        "code": "40042",
        "bank_status": "ACTIVE"
    },
    {
        "id": "0730b821-a88e-4308-8da3-1099ee81ebfa",
        "name": "SCOTIABANK",
        "token": "250",
        "BIM": "044",
        "code": "40044",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4cc84e03-d679-4863-b296-cd2d438b3732",
        "name": "BANREGIO",
        "token": "251",
        "BIM": "058",
        "code": "40058",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3979b2d2-1780-4df7-9679-5020c376e9c9",
        "name": "INVEX",
        "token": "252",
        "BIM": "059",
        "code": "40059",
        "bank_status": "ACTIVE"
    },
    {
        "id": "815c35b7-866a-438f-af57-251d48131045",
        "name": "BANSI",
        "token": "253",
        "BIM": "060",
        "code": "40060",
        "bank_status": "ACTIVE"
    },
    {
        "id": "987c9c9b-b999-41ac-bf70-f91445ee486f",
        "name": "AFIRME",
        "token": "254",
        "BIM": "062",
        "code": "40062",
        "bank_status": "ACTIVE"
    },
    {
        "id": "cf0ca911-256a-4f4c-a406-f865abcc07f5",
        "name": "BANORTE",
        "token": "255",
        "BIM": "072",
        "code": "40072",
        "bank_status": "ACTIVE"
    },
    {
        "id": "6000747a-915b-4507-a647-50d3cf9cb3f4",
        "name": "FONDEADORA",
        "token": "352",
        "BIM": "699",
        "code": "90699",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4cf24fe9-e848-451c-a156-763ccf4acfde",
        "name": "TESORED",
        "token": "353",
        "BIM": "703",
        "code": "90703",
        "bank_status": "ACTIVE"
    },
    {
        "id": "4950ff04-4915-4066-b2bf-7fb6b090b958",
        "name": "NVIO",
        "token": "353",
        "BIM": "710",
        "code": "90710",
        "bank_status": "ACTIVE"
    },
    {
        "id": "fc39ce95-d1bf-486f-b54b-c37b74637745",
        "name": "MERCADO_PAGO_W",
        "token": "354",
        "BIM": "722",
        "code": "90722",
        "bank_status": "ACTIVE"
    },
    {
        "id": "139bc5d9-3020-4e25-9acc-3364262db77d",
        "name": "CUENCA",
        "token": "355",
        "BIM": "723",
        "code": "90723",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3c71b5de-ece0-45d5-bec6-6fc616175fb6",
        "name": "SPIN_BY_OXXO",
        "token": "356",
        "BIM": "728",
        "code": "90728",
        "bank_status": "ACTIVE"
    },
    {
        "id": "ec065f99-6f43-49c0-a916-def480d2bbef",
        "name": "CoDiValida",
        "token": "340",
        "BIM": "903",
        "code": "90903",
        "bank_status": "ACTIVE"
    },
    {
        "id": "771ade5f-f2c1-4cb2-b0b3-4cd2d1a2c5ee",
        "name": "KLAR",
        "token": "357",
        "BIM": "661",
        "code": "90661",
        "bank_status": "ACTIVE"
    },
    {
        "id": "23af84a8-5f7d-40ef-a49e-d3530ff39a6f",
        "name": "To be Registered",
        "token": "000",
        "BIM": "000",
        "code": "0",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9d84b03a-28d1-4898-a69c-38824239e2b1",
        "name": "FINCO_PAY",
        "token": "734",
        "BIM": "734",
        "code": "90734",
        "bank_status": "ACTIVE"
    },
    {
        "id": "d3435bd9-998d-4e8a-9067-6b71d5fd3ac7",
        "name": "GEM-FINCO_PAY",
        "token": "734",
        "BIM": "977",
        "code": "97734",
        "bank_status": "ACTIVE"
    },
    {
        "id": "476d0c85-2752-4ff8-b05c-b7ac228c4809",
        "name": "ALBO",
        "token": "358",
        "BIM": "721",
        "code": "90721",
        "bank_status": "ACTIVE"
    },
    {
        "id": "3168dc59-5e59-4623-a1c9-94051a949569",
        "name": "NU MEXICO",
        "token": "314",
        "BIM": "638",
        "code": "90638",
        "bank_status": "ACTIVE"
    },
    {
        "id": "9d1b2934-b825-4193-b2f5-839bf332e385",
        "name": "MEXPAGO",
        "token": "720",
        "BIM": "720",
        "code": "90720",
        "bank_status": "ACTIVE"
    }
];