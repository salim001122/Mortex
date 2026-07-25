export type Language = 'en' | 'ru' | 'es' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' }
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Header
    ecosystem: 'NGKEcosystem',
    vipPass: 'Pass',
    streak: 'Streak',
    selectLanguage: 'Select Language',
    
    // Navbar
    navHome: 'Home',
    navCopyTrade: 'Copy Trade',
    navReferral: 'Referral',
    navHistory: 'History',
    navProfile: 'Profile',
    navSupport: 'Support',

    // Dashboard
    totalBalance: 'Total Balance',
    mainBalance: 'Main Balance',
    profitBalance: 'Profit Balance',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    quickCopy: 'Quick Copy Trade',
    dailyReturn: 'Daily Return',
    signalAlert: 'Next UK Signal Alert',
    verifiedTrader: 'Verified Trader',
    unverifiedNotice: 'Complete KYC verification to unlock $50,000 USDT daily withdrawals.',

    // Profile & Settings
    accountOperations: 'Account Operations',
    verifyIdentity: 'Verify Identity (KYC)',
    kycLevel1: 'Level 1: Basic',
    kycLevel2: 'Level 2: Real-Exchange Verified',
    twoFactorSecurity: 'Two-Factor Security',
    changePassword: 'Set Security Password',
    telegramSignalBot: 'Telegram Signal Bot',
    logout: 'Logout',
    memberSince: 'Member Since',
    systemNode: 'System Node',
    netWorth: 'Accumulated Net Worth',

    // KYC Enhanced
    kycTitle: 'Institutional Identity Verification',
    kycSubtitle: 'Real-Exchange Biometric & AI Document Verification',
    selectDocType: 'Select Document Type',
    passport: 'Passport 🛂',
    nationalId: 'National ID 💳',
    driversLicense: 'Driver License 🚘',
    legalName: 'Full Legal Name',
    docNumber: 'Document ID Number',
    country: 'Country of Nationality',
    phone: 'Mobile Phone Number',
    docFront: 'Upload ID Front Photo',
    docBack: 'Upload ID Back Photo',
    startFaceMatch: 'Start Biometric Face Scan',
    scanningDoc: 'Scanning Document OCR...',
    matchingFace: 'Matching Biometric Face mesh...',
    antiFraudCheck: 'Running Global Anti-Fraud Check...',
    kycSuccess: 'Verification Approved! Level 2 VIP Unlocked.',
    limitUnlocked: 'Daily Withdrawal Limit: $50,000 USDT',
    submitKyc: 'Submit for AI Instant Approval'
  },

  ru: {
    // Header
    ecosystem: 'NGKЭкосистема',
    vipPass: 'Пасс',
    streak: 'Дней',
    selectLanguage: 'Выберите язык',
    
    // Navbar
    navHome: 'Главная',
    navCopyTrade: 'Копи-трейдинг',
    navReferral: 'Рефералы',
    navHistory: 'История',
    navProfile: 'Профиль',
    navSupport: 'Поддержка',

    // Dashboard
    totalBalance: 'Общий баланс',
    mainBalance: 'Основной баланс',
    profitBalance: 'Баланс прибыли',
    deposit: 'Пополнить',
    withdraw: 'Вывести',
    quickCopy: 'Быстрое копирование',
    dailyReturn: 'Дневной доход',
    signalAlert: 'Сигнал по времени Великобритании',
    verifiedTrader: 'Проверенный трейдер',
    unverifiedNotice: 'Пройдите верификацию KYC для разблокировки вывода до $50 000 USDT.',

    // Profile & Settings
    accountOperations: 'Операции с аккаунтом',
    verifyIdentity: 'Верификация личности (KYC)',
    kycLevel1: 'Уровень 1: Базовый',
    kycLevel2: 'Уровень 2: Проверенный биревой',
    twoFactorSecurity: 'Двухфакторная защита (2FA)',
    changePassword: 'Установить пароль',
    telegramSignalBot: 'Telegram Бот Сигналов',
    logout: 'Выйти',
    memberSince: 'Дата регистрации',
    systemNode: 'Узел системы',
    netWorth: 'Общая капитализация',

    // KYC Enhanced
    kycTitle: 'Институциональная верификация личности',
    kycSubtitle: 'Биометрическая проверка и AI сканирование документов',
    selectDocType: 'Выберите тип документа',
    passport: 'Загранпаспорт 🛂',
    nationalId: 'Национальное ID 💳',
    driversLicense: 'Водительские права 🚘',
    legalName: 'Полное имя (как в паспорте)',
    docNumber: 'Номер документа',
    country: 'Страна гражданства',
    phone: 'Номер мобильного телефона',
    docFront: 'Загрузить лицевую сторону ID',
    docBack: 'Загрузить обратную сторону ID',
    startFaceMatch: 'Начать биометрическое сканирование лица',
    scanningDoc: 'Сканирование OCR документа...',
    matchingFace: 'Сравнение биометрии лица...',
    antiFraudCheck: 'Проверка системы безопасности...',
    kycSuccess: 'Верификация одобрена! Уровень 2 VIP разблокирован.',
    limitUnlocked: 'Лимит вывода: $50 000 USDT в день',
    submitKyc: 'Отправить на мгновенную AI проверку'
  },

  es: {
    // Header
    ecosystem: 'EcosistemaNGK',
    vipPass: 'Pase',
    streak: 'Racha',
    selectLanguage: 'Seleccionar idioma',
    
    // Navbar
    navHome: 'Inicio',
    navCopyTrade: 'Copy Trade',
    navReferral: 'Referidos',
    navHistory: 'Historial',
    navProfile: 'Perfil',
    navSupport: 'Soporte',

    // Dashboard
    totalBalance: 'Balance Total',
    mainBalance: 'Balance Principal',
    profitBalance: 'Balance de Ganancias',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    quickCopy: 'Copia Rápida',
    dailyReturn: 'Retorno Diario',
    signalAlert: 'Siguiente Señal (Hora UK)',
    verifiedTrader: 'Comerciante Verificado',
    unverifiedNotice: 'Complete la verificación KYC para desbloquear retiros de hasta $50,000 USDT diarios.',

    // Profile & Settings
    accountOperations: 'Operaciones de cuenta',
    verifyIdentity: 'Verificar Identidad (KYC)',
    kycLevel1: 'Nivel 1: Básico',
    kycLevel2: 'Nivel 2: Verificado Intercambio Real',
    twoFactorSecurity: 'Seguridad Dos Factores (2FA)',
    changePassword: 'Establecer Contraseña',
    telegramSignalBot: 'Bot de Señales Telegram',
    logout: 'Cerrar sesión',
    memberSince: 'Miembro desde',
    systemNode: 'Nodo del Sistema',
    netWorth: 'Patrimonio Neto Acumulado',

    // KYC Enhanced
    kycTitle: 'Verificación de Identidad Institucional',
    kycSubtitle: 'Verificación Biométrica y Escaneo IA de Documentos',
    selectDocType: 'Seleccionar Tipo de Documento',
    passport: 'Pasaporte 🛂',
    nationalId: 'Cédula de Identidad 💳',
    driversLicense: 'Licencia de Conducir 🚘',
    legalName: 'Nombre Legal Completo',
    docNumber: 'Número de Documento ID',
    country: 'País de Nacionalidad',
    phone: 'Número de Teléfono Móvil',
    docFront: 'Subir Foto Frontal del Documento',
    docBack: 'Subir Foto Posterior del Documento',
    startFaceMatch: 'Iniciar Escaneo Biométrico Facial',
    scanningDoc: 'Escaneando OCR de Documento...',
    matchingFace: 'Verificando Malla Facial Biométrica...',
    antiFraudCheck: 'Verificación Antifraude en Proceso...',
    kycSuccess: '¡Verificación Aprobada! Nivel 2 VIP Desbloqueado.',
    limitUnlocked: 'Límite de Retiro Diario: $50,000 USDT',
    submitKyc: 'Enviar para Aprobación Instantánea IA'
  },

  ar: {
    // Header
    ecosystem: 'منظومةNGK',
    vipPass: 'البطاقة',
    streak: 'أيام',
    selectLanguage: 'اختر اللغة',
    
    // Navbar
    navHome: 'الرئيسية',
    navCopyTrade: 'نسخ التداول',
    navReferral: 'الإحالات',
    navHistory: 'السجل',
    navProfile: 'الملف الشخصي',
    navSupport: 'الدعم',

    // Dashboard
    totalBalance: 'إجمالي الرصيد',
    mainBalance: 'الرصيد الرئيسي',
    profitBalance: 'رصيد الأرباح',
    deposit: 'إيداع',
    withdraw: 'سحب',
    quickCopy: 'نسخ سريع',
    dailyReturn: 'العائد اليومي',
    signalAlert: 'التنبيه القادم (بتوقيت بريطانيا)',
    verifiedTrader: 'متداول موثق',
    unverifiedNotice: 'أكمل التحقق من الهوية (KYC) لفتح حد سحب يومي يصل إلى 50,000 USDT.',

    // Profile & Settings
    accountOperations: 'عمليات الحساب',
    verifyIdentity: 'توثيق الهوية (KYC)',
    kycLevel1: 'المستوى 1: أساسي',
    kycLevel2: 'المستوى 2: توثيق المنصات العالمية',
    twoFactorSecurity: 'الأمان ثنائي الخطوات (2FA)',
    changePassword: 'تعيين كلمة السر',
    telegramSignalBot: 'بوت إشارات التليجرام',
    logout: 'تسجيل الخروج',
    memberSince: 'عضو منذ',
    systemNode: 'عقدة النظام',
    netWorth: 'إجمالي الصافي التراكمي',

    // KYC Enhanced
    kycTitle: 'التوثيق المؤسسي للهوية الرقمية',
    kycSubtitle: 'التحقق البيومتري والذكاء الاصطناعي للمستندات',
    selectDocType: 'اختر نوع الوثيقة',
    passport: 'جواز السفر 🛂',
    nationalId: 'الهوية الوطنية 💳',
    driversLicense: 'رخصة القيادة 🚘',
    legalName: 'الاسم القانوني الكامل',
    docNumber: 'رقم الوثيقة',
    country: 'دولة الجنسية',
    phone: 'رقم الهاتف المحمول',
    docFront: 'رفع الوجه الأمامي للوثيقة',
    docBack: 'رفع الوجه الخلفي للوثيقة',
    startFaceMatch: 'بدء الفحص البيومتري للوجه',
    scanningDoc: 'جاري مسح بيانات الوثيقة (OCR)...',
    matchingFace: 'جاري مطابقة ملامح الوجه البيومترية...',
    antiFraudCheck: 'جاري فحص نظام الأمان ومنع الاحتيال...',
    kycSuccess: 'تمت الموافقة على التوثيق! تم فتح المستوى 2 VIP.',
    limitUnlocked: 'حد السحب اليومي: 50,000 USDT',
    submitKyc: 'إرسال للموافقة الفورية بالذكاء الاصطناعي'
  }
};

export function getTranslation(lang: Language, key: string): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}
