/**
 * src/lib/i18n.js
 * ═══════════════════════════════════════════════════════════════
 * Pathfinder Internationalisation System
 *
 * 12 languages covering ~5.2 billion speakers:
 *   en  English        · Global default
 *   es  Spanish        · 500M speakers, LatAm startup scene
 *   fr  French         · Sub-Saharan Africa + Europe
 *   pt  Portuguese     · Brazil (5th largest startup ecosystem) + Africa
 *   ar  Arabic         · MENA region, right-to-left
 *   hi  Hindi          · India, world's largest founder population
 *   sw  Swahili        · East + Central Africa
 *   id  Indonesian     · Southeast Asia, 270M people
 *   de  German         · Europe's largest economy
 *   it  Italian        · Europe
 *   zh  Mandarin       · China + global diaspora
 *   ja  Japanese       · Japan
 *
 * The LLM (chat-director) handles ALL conversational translation
 * automatically via the system prompt — just tell it the language.
 * This file only covers static UI strings (buttons, labels, errors).
 * ═══════════════════════════════════════════════════════════════
 */

export const SUPPORTED_LANGUAGES = [
  { code:"en", name:"English",    nativeName:"English",    flag:"🇬🇧", dir:"ltr" },
  { code:"es", name:"Spanish",    nativeName:"Español",    flag:"🇪🇸", dir:"ltr" },
  { code:"fr", name:"French",     nativeName:"Français",   flag:"🇫🇷", dir:"ltr" },
  { code:"pt", name:"Portuguese", nativeName:"Português",  flag:"🇧🇷", dir:"ltr" },
  { code:"ar", name:"Arabic",     nativeName:"العربية",    flag:"🇸🇦", dir:"rtl" },
  { code:"hi", name:"Hindi",      nativeName:"हिन्दी",     flag:"🇮🇳", dir:"ltr" },
  { code:"sw", name:"Swahili",    nativeName:"Kiswahili",  flag:"🇰🇪", dir:"ltr" },
  { code:"id", name:"Indonesian", nativeName:"Bahasa",     flag:"🇮🇩", dir:"ltr" },
  { code:"de", name:"German",     nativeName:"Deutsch",    flag:"🇩🇪", dir:"ltr" },
  { code:"it", name:"Italian",    nativeName:"Italiano",   flag:"🇮🇹", dir:"ltr" },
  { code:"zh", name:"Mandarin",   nativeName:"中文",        flag:"🇨🇳", dir:"ltr" },
  { code:"ja", name:"Japanese",   nativeName:"日本語",      flag:"🇯🇵", dir:"ltr" },
];

/**
 * Translation table.
 * Keys are semantic identifiers — add new keys here as the UI grows.
 * Every key MUST have an "en" entry as the fallback.
 */
const T = {
  // ── Auth screen ────────────────────────────────────────────
  app_tagline: {
    en:"From first idea to funded venture — guided by AI.",
    es:"De la primera idea a la empresa financiada — guiado por IA.",
    fr:"De la première idée à l'entreprise financée — guidé par l'IA.",
    pt:"Da primeira ideia à empresa financiada — guiado por IA.",
    ar:"من الفكرة الأولى إلى المشروع الممول — بتوجيه من الذكاء الاصطناعي.",
    hi:"पहले विचार से वित्त पोषित उद्यम तक — AI द्वारा निर्देशित।",
    sw:"Kutoka wazo la kwanza hadi biashara iliyofadhiliwa — ikiongozwa na AI.",
    id:"Dari ide pertama hingga usaha yang didanai — dipandu AI.",
    de:"Von der ersten Idee zum finanzierten Unternehmen — KI-gestützt.",
    it:"Dalla prima idea all'impresa finanziata — guidato dall'IA.",
    zh:"从第一个想法到获得投资——由AI引导。",
    ja:"最初のアイデアから資金調達まで — AIがガイド。",
  },
  sign_in_to_continue: {
    en:"Sign in to continue",
    es:"Inicia sesión para continuar",
    fr:"Connectez-vous pour continuer",
    pt:"Entre para continuar",
    ar:"سجّل الدخول للمتابعة",
    hi:"जारी रखने के लिए साइन इन करें",
    sw:"Ingia ili kuendelea",
    id:"Masuk untuk melanjutkan",
    de:"Anmelden um fortzufahren",
    it:"Accedi per continuare",
    zh:"登录以继续",
    ja:"続けるにはサインイン",
  },
  continue_with_google: {
    en:"Continue with Google", es:"Continuar con Google",   fr:"Continuer avec Google",
    pt:"Continuar com Google",  ar:"المتابعة مع Google",   hi:"Google से जारी रखें",
    sw:"Endelea na Google",     id:"Lanjutkan dengan Google", de:"Mit Google fortfahren",
    it:"Continua con Google",   zh:"使用 Google 继续",         ja:"Googleで続ける",
  },
  continue_with_apple: {
    en:"Continue with Apple",  es:"Continuar con Apple",   fr:"Continuer avec Apple",
    pt:"Continuar com Apple",   ar:"المتابعة مع Apple",    hi:"Apple से जारी रखें",
    sw:"Endelea na Apple",      id:"Lanjutkan dengan Apple", de:"Mit Apple fortfahren",
    it:"Continua con Apple",    zh:"使用 Apple 继续",          ja:"Appleで続ける",
  },
  continue_with_meta: {
    en:"Continue with Meta",   es:"Continuar con Meta",    fr:"Continuer avec Meta",
    pt:"Continuar com Meta",    ar:"المتابعة مع Meta",     hi:"Meta से जारी रखें",
    sw:"Endelea na Meta",       id:"Lanjutkan dengan Meta",  de:"Mit Meta fortfahren",
    it:"Continua con Meta",     zh:"使用 Meta 继续",           ja:"Metaで続ける",
  },
  authenticating: {
    en:"Authenticating…", es:"Autenticando…", fr:"Authentification…",
    pt:"Autenticando…",   ar:"جارٍ المصادقة…", hi:"प्रमाणीकरण हो रहा है…",
    sw:"Inathibitisha…",  id:"Mengautentikasi…", de:"Authentifizierung…",
    it:"Autenticazione…", zh:"正在验证…",          ja:"認証中…",
  },

  // ── Onboarding ─────────────────────────────────────────────
  choose_your_architect: {
    en:"Choose Your Architect",   es:"Elige Tu Arquitecto",
    fr:"Choisissez Votre Architecte", pt:"Escolha Seu Arquiteto",
    ar:"اختر معماري مشروعك",      hi:"अपना आर्किटेक्ट चुनें",
    sw:"Chagua Msanifu Wako",      id:"Pilih Arsitek Anda",
    de:"Wähle deinen Architekten", it:"Scegli il tuo Architetto",
    zh:"选择您的架构师",              ja:"アーキテクトを選ぶ",
  },
  accountability_contract: {
    en:"Accountability Contract",  es:"Contrato de Responsabilidad",
    fr:"Contrat d'Engagement",     pt:"Contrato de Responsabilidade",
    ar:"عقد المساءلة",             hi:"जवाबदेही अनुबंध",
    sw:"Mkataba wa Uwajibikaji",   id:"Kontrak Akuntabilitas",
    de:"Verantwortlichkeitsvertrag", it:"Contratto di Responsabilità",
    zh:"问责合同",                    ja:"責任契約",
  },
  i_accept_the_consequences: {
    en:"I accept the consequences",
    es:"Acepto las consecuencias",
    fr:"J'accepte les conséquences",
    pt:"Aceito as consequências",
    ar:"أقبل العواقب",
    hi:"मैं परिणाम स्वीकार करता हूँ",
    sw:"Ninakubali matokeo",
    id:"Saya menerima konsekuensinya",
    de:"Ich akzeptiere die Konsequenzen",
    it:"Accetto le conseguenze",
    zh:"我接受后果",
    ja:"私は結果を受け入れます",
  },

  // ── Home screen ────────────────────────────────────────────
  start_new_project: {
    en:"Start a New Project",      es:"Comenzar Nuevo Proyecto",
    fr:"Démarrer un Nouveau Projet", pt:"Iniciar Novo Projeto",
    ar:"ابدأ مشروعًا جديدًا",      hi:"नया प्रोजेक्ट शुरू करें",
    sw:"Anza Mradi Mpya",           id:"Mulai Proyek Baru",
    de:"Neues Projekt starten",    it:"Avvia Nuovo Progetto",
    zh:"开始新项目",                  ja:"新しいプロジェクトを開始",
  },
  analyze_my_data: {
    en:"Analyze My Data",   es:"Analizar Mis Datos",
    fr:"Analyser Mes Données", pt:"Analisar Meus Dados",
    ar:"تحليل بياناتي",     hi:"मेरा डेटा विश्लेषण करें",
    sw:"Changanua Data Yangu", id:"Analisis Data Saya",
    de:"Meine Daten analysieren", it:"Analizza i Miei Dati",
    zh:"分析我的数据",          ja:"データを分析する",
  },
  project_hub: {
    en:"Project Hub", es:"Centro de Proyecto", fr:"Hub du Projet",
    pt:"Hub do Projeto", ar:"مركز المشروع", hi:"प्रोजेक्ट हब",
    sw:"Kitovu cha Mradi", id:"Hub Proyek", de:"Projekt-Hub",
    it:"Hub del Progetto", zh:"项目中心", ja:"プロジェクトハブ",
  },

  // ── Preflight ──────────────────────────────────────────────
  preflight_title: {
    en:"Prepare Your Environment",  es:"Prepara Tu Entorno",
    fr:"Préparez Votre Environnement", pt:"Prepare Seu Ambiente",
    ar:"جهّز بيئتك",               hi:"अपना वातावरण तैयार करें",
    sw:"Andaa Mazingira Yako",      id:"Persiapkan Lingkungan Anda",
    de:"Bereite deine Umgebung vor", it:"Prepara il Tuo Ambiente",
    zh:"准备您的环境",                 ja:"環境を整える",
  },
  hold_to_confirm: {
    en:"Hold to Confirm (Voice Verified)",
    es:"Mantén para Confirmar (Verificado por Voz)",
    fr:"Maintenir pour Confirmer (Vérifié par Voix)",
    pt:"Segure para Confirmar (Verificado por Voz)",
    ar:"اضغط مطولاً للتأكيد (التحقق الصوتي)",
    hi:"पुष्टि करने के लिए होल्ड करें (वॉयस वेरिफाइड)",
    sw:"Shika Kuthibitisha (Imethibitishwa na Sauti)",
    id:"Tahan untuk Konfirmasi (Diverifikasi Suara)",
    de:"Halten zum Bestätigen (Sprachverifiziert)",
    it:"Tieni per Confermare (Verificato Vocalmente)",
    zh:"长按确认（语音验证）",
    ja:"長押しで確認（音声認証）",
  },
  affirmation: {
    en:"My environment is clear. I commit the next 90 minutes entirely to my venture.",
    es:"Mi entorno está despejado. Me comprometo los próximos 90 minutos completamente con mi empresa.",
    fr:"Mon environnement est dégagé. Je consacre les 90 prochaines minutes entièrement à mon projet.",
    pt:"Meu ambiente está limpo. Me comprometo os próximos 90 minutos inteiramente com meu negócio.",
    ar:"بيئتي صافية. أكرّس التسعين دقيقة القادمة كليًّا لمشروعي.",
    hi:"मेरा वातावरण स्पष्ट है। मैं अगले 90 मिनट पूरी तरह अपने उद्यम को समर्पित करता हूँ।",
    sw:"Mazingira yangu ni wazi. Ninajitolea dakika 90 zijazo kabisa kwa biashara yangu.",
    id:"Lingkungan saya sudah bersih. Saya mendedikasikan 90 menit berikutnya sepenuhnya untuk usaha saya.",
    de:"Meine Umgebung ist frei. Ich widme die nächsten 90 Minuten vollständig meinem Vorhaben.",
    it:"Il mio ambiente è libero. Dedico i prossimi 90 minuti interamente alla mia impresa.",
    zh:"我的环境已清理干净。我将接下来的90分钟完全投入到我的创业中。",
    ja:"環境は整っています。次の90分を完全に私のベンチャーに捧げます。",
  },

  // ── Sprint / Chat ──────────────────────────────────────────
  sprint_active: {
    en:"Ultradian Sprint Active",  es:"Sprint Ultradiano Activo",
    fr:"Sprint Ultradien Actif",   pt:"Sprint Ultradiano Ativo",
    ar:"الجولة المكثفة نشطة",     hi:"अल्ट्राडियन स्प्रिंट सक्रिय",
    sw:"Sprint ya Ultradian Inaendelea", id:"Sprint Ultradian Aktif",
    de:"Ultradianischer Sprint Aktiv", it:"Sprint Ultradiano Attivo",
    zh:"超昼夜冲刺进行中",            ja:"ウルトラディアン・スプリント稼働中",
  },
  sprint_warning: {
    en:"⚠️ 5 Min Remaining — Save Now",
    es:"⚠️ 5 Min Restantes — Guarda Ahora",
    fr:"⚠️ 5 Min Restantes — Sauvegardez",
    pt:"⚠️ 5 Min Restantes — Salve Agora",
    ar:"⚠️ 5 دقائق متبقية — احفظ الآن",
    hi:"⚠️ 5 मिनट शेष — अभी सेव करें",
    sw:"⚠️ Dakika 5 Zimebaki — Hifadhi Sasa",
    id:"⚠️ 5 Menit Tersisa — Simpan Sekarang",
    de:"⚠️ 5 Min Verbleibend — Jetzt Speichern",
    it:"⚠️ 5 Min Rimanenti — Salva Ora",
    zh:"⚠️ 剩余5分钟 — 立即保存",
    ja:"⚠️ 残り5分 — 今すぐ保存",
  },
  sprint_complete: {
    en:"🔒 Sprint Complete",       es:"🔒 Sprint Completado",
    fr:"🔒 Sprint Terminé",        pt:"🔒 Sprint Concluído",
    ar:"🔒 الجولة مكتملة",        hi:"🔒 स्प्रिंट पूर्ण",
    sw:"🔒 Sprint Imekamilika",    id:"🔒 Sprint Selesai",
    de:"🔒 Sprint Abgeschlossen",  it:"🔒 Sprint Completato",
    zh:"🔒 冲刺完成",               ja:"🔒 スプリント完了",
  },
  readiness: {
    en:"Readiness", es:"Preparación", fr:"Préparation",
    pt:"Prontidão", ar:"الجاهزية",   hi:"तत्परता",
    sw:"Utayari",   id:"Kesiapan",    de:"Bereitschaft",
    it:"Prontezza", zh:"准备度",       ja:"レディネス",
  },
  message_placeholder: {
    en:"Message your AI partner…", es:"Escríbele a tu socio IA…",
    fr:"Écrivez à votre partenaire IA…", pt:"Mensagem ao seu parceiro IA…",
    ar:"راسل شريكك الذكي…",        hi:"अपने AI पार्टनर को संदेश करें…",
    sw:"Tuma ujumbe kwa mshirika wako wa AI…", id:"Pesan ke mitra AI Anda…",
    de:"Nachricht an deinen KI-Partner…", it:"Messaggio al tuo partner IA…",
    zh:"给您的AI伙伴发消息…",          ja:"AIパートナーにメッセージ…",
  },

  // ── Lockout ────────────────────────────────────────────────
  lockout_title: {
    en:"Sprint Complete",        es:"Sprint Completado",
    fr:"Sprint Terminé",         pt:"Sprint Concluído",
    ar:"الجولة مكتملة",         hi:"स्प्रिंट पूर्ण",
    sw:"Sprint Imekamilika",     id:"Sprint Selesai",
    de:"Sprint Abgeschlossen",   it:"Sprint Completato",
    zh:"冲刺完成",                 ja:"スプリント完了",
  },
  lockout_body: {
    en:"You are locked out for 20 minutes to replenish neurochemicals. Walk away from the screen.",
    es:"Estás bloqueado por 20 minutos para reponer neuroquímicos. Aléjate de la pantalla.",
    fr:"Vous êtes bloqué 20 minutes pour reconstituer vos neurochimiques. Éloignez-vous de l'écran.",
    pt:"Você está bloqueado por 20 minutos para repor os neuroquímicos. Afaste-se da tela.",
    ar:"أنت محجوب لمدة 20 دقيقة لتجديد المواد الكيميائية العصبية. ابتعد عن الشاشة.",
    hi:"न्यूरोकेमिकल्स को फिर से भरने के लिए आप 20 मिनट के लिए लॉक हैं। स्क्रीन से दूर जाएं।",
    sw:"Umefungiwa kwa dakika 20 ili kujaza tena kemikali za neva. Toka kwenye skrini.",
    id:"Anda dikunci selama 20 menit untuk mengisi ulang neurokimia. Menjauh dari layar.",
    de:"Du bist 20 Minuten gesperrt, um Neurochemikalien aufzufüllen. Geh vom Bildschirm weg.",
    it:"Sei bloccato per 20 minuti per ricaricare i neurochimici. Allontanati dallo schermo.",
    zh:"您被锁定20分钟以补充神经化学物质。请远离屏幕。",
    ja:"神経化学物質を補充するため20分間ロックされています。画面から離れてください。",
  },

  // ── Settings / Walk of Shame ────────────────────────────────
  downgrade_tier: {
    en:"Downgrade Accountability Tier", es:"Bajar Nivel de Responsabilidad",
    fr:"Rétrograder le Niveau d'Engagement", pt:"Rebaixar Nível de Responsabilidade",
    ar:"خفّض مستوى المساءلة",            hi:"जवाबदेही स्तर कम करें",
    sw:"Punguza Kiwango cha Uwajibikaji",  id:"Turunkan Tingkat Akuntabilitas",
    de:"Verantwortlichkeitsstufe Herabsetzen", it:"Abbassa il Livello di Responsabilità",
    zh:"降低问责级别",                        ja:"説明責任レベルを下げる",
  },
  walk_of_shame_phrase: {
    en:"I am lowering my standards because the work is too hard",
    es:"Estoy bajando mis estándares porque el trabajo es demasiado difícil",
    fr:"Je baisse mes exigences parce que le travail est trop difficile",
    pt:"Estou baixando meus padrões porque o trabalho é muito difícil",
    ar:"أنا أخفّض معاييري لأن العمل صعب جدًا",
    hi:"मैं अपने मानकों को कम कर रहा हूँ क्योंकि काम बहुत कठिन है",
    sw:"Ninapunguza viwango vyangu kwa sababu kazi ni ngumu sana",
    id:"Saya menurunkan standar saya karena pekerjaannya terlalu sulit",
    de:"Ich senke meine Standards, weil die Arbeit zu schwer ist",
    it:"Sto abbassando i miei standard perché il lavoro è troppo difficile",
    zh:"我正在降低标准，因为工作太难了",
    ja:"仕事が難しすぎるから基準を下げます",
  },

  // ── Notifications / Proactive nudges ──────────────────────
  notif_permission_title: {
    en:"Stay Accountable",     es:"Mantente Responsable",
    fr:"Restez Responsable",   pt:"Mantenha-se Responsável",
    ar:"ابقَ مسؤولاً",        hi:"जिम्मेदार रहें",
    sw:"Baki na Uwajibikaji",  id:"Tetap Bertanggung Jawab",
    de:"Bleib Verantwortlich",  it:"Rimani Responsabile",
    zh:"保持问责",               ja:"責任を持ち続けましょう",
  },
  notif_permission_body: {
    en:"Allow notifications so your AI Director can check in when you go quiet.",
    es:"Permite notificaciones para que tu Director IA pueda contactarte cuando guardes silencio.",
    fr:"Autorisez les notifications pour que votre Directeur IA puisse vous contacter quand vous êtes inactif.",
    pt:"Permita notificações para que seu Diretor IA possa verificar quando você ficar em silêncio.",
    ar:"اسمح بالإشعارات حتى يتمكن مديرك الذكي من التحقق منك عند توقفك.",
    hi:"नोटिफिकेशन की अनुमति दें ताकि आपका AI डायरेक्टर चेक इन कर सके जब आप शांत हो जाएं।",
    sw:"Ruhusu arifa ili Mkurugenzi wako wa AI aweze kukuangalia unaponyamaza.",
    id:"Izinkan notifikasi agar Direktur AI Anda dapat memeriksa ketika Anda diam.",
    de:"Erlaube Benachrichtigungen, damit dein KI-Direktor einchecken kann, wenn du still bist.",
    it:"Consenti notifiche così il tuo Direttore IA può controllarti quando sei silenzioso.",
    zh:"允许通知，这样您的AI主任可以在您沉默时签到。",
    ja:"通知を許可して、AIディレクターが静かになったときにチェックインできるようにしましょう。",
  },
  enable_notifications: {
    en:"Enable Notifications",    es:"Activar Notificaciones",
    fr:"Activer les Notifications", pt:"Ativar Notificações",
    ar:"تفعيل الإشعارات",         hi:"नोटिफिकेशन सक्षम करें",
    sw:"Wezesha Arifa",            id:"Aktifkan Notifikasi",
    de:"Benachrichtigungen Aktivieren", it:"Attiva Notifiche",
    zh:"启用通知",                    ja:"通知を有効にする",
  },

  // ── Course screen ──────────────────────────────────────────
  mandatory_training: {
    en:"Mandatory Training",       es:"Entrenamiento Obligatorio",
    fr:"Formation Obligatoire",    pt:"Treinamento Obrigatório",
    ar:"تدريب إلزامي",            hi:"अनिवार्य प्रशिक्षण",
    sw:"Mafunzo ya Lazima",        id:"Pelatihan Wajib",
    de:"Pflichtschulung",          it:"Formazione Obbligatoria",
    zh:"必修课程",                   ja:"必須トレーニング",
  },
  complete_module: {
    en:"Complete Module →",        es:"Completar Módulo →",
    fr:"Compléter le Module →",    pt:"Completar Módulo →",
    ar:"أكمل الوحدة ←",           hi:"मॉड्यूल पूर्ण करें →",
    sw:"Kamilisha Moduli →",       id:"Selesaikan Modul →",
    de:"Modul Abschließen →",      it:"Completa Modulo →",
    zh:"完成模块 →",                 ja:"モジュールを完了 →",
  },
  finish_course: {
    en:"Finish Course & Return to Chat",
    es:"Terminar Curso y Volver al Chat",
    fr:"Terminer le Cours et Retourner au Chat",
    pt:"Terminar Curso e Voltar ao Chat",
    ar:"أنهِ الدورة وعُد إلى المحادثة",
    hi:"कोर्स समाप्त करें और चैट पर वापस जाएं",
    sw:"Maliza Kozi na Rudi kwenye Mazungumzo",
    id:"Selesaikan Kursus & Kembali ke Chat",
    de:"Kurs Beenden & Zum Chat Zurückkehren",
    it:"Finisci il Corso & Torna alla Chat",
    zh:"完成课程并返回聊天",
    ja:"コースを終了してチャットに戻る",
  },

  // ── General ────────────────────────────────────────────────
  sign_out: {
    en:"Sign Out",   es:"Cerrar Sesión", fr:"Se Déconnecter",
    pt:"Sair",       ar:"تسجيل الخروج", hi:"साइन आउट",
    sw:"Toka",       id:"Keluar",        de:"Abmelden",
    it:"Esci",       zh:"退出登录",        ja:"サインアウト",
  },
  cancel: {
    en:"Cancel",  es:"Cancelar", fr:"Annuler",
    pt:"Cancelar", ar:"إلغاء", hi:"रद्द करें",
    sw:"Ghairi",   id:"Batal",  de:"Abbrechen",
    it:"Annulla",  zh:"取消",    ja:"キャンセル",
  },
  save: {
    en:"Save",   es:"Guardar", fr:"Enregistrer",
    pt:"Salvar", ar:"حفظ",    hi:"सेव करें",
    sw:"Hifadhi", id:"Simpan", de:"Speichern",
    it:"Salva",  zh:"保存",    ja:"保存",
  },
  language: {
    en:"Language", es:"Idioma", fr:"Langue",
    pt:"Idioma",   ar:"اللغة", hi:"भाषा",
    sw:"Lugha",    id:"Bahasa", de:"Sprache",
    it:"Lingua",   zh:"语言",   ja:"言語",
  },
};

/**
 * Detect the best language from:
 *  1. User's saved preference (from Supabase profile)
 *  2. Browser navigator.language
 *  3. Fall back to English
 */
export function detectLanguage(savedPreference) {
  if (savedPreference) {
    const match = SUPPORTED_LANGUAGES.find(l => l.code === savedPreference);
    if (match) return match.code;
  }

  // navigator.language returns e.g. "pt-BR", "zh-CN", "en-US"
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLang) {
    const match = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
    if (match) return match.code;
  }

  return "en";
}

/**
 * Get a translated string. Falls back to English if no translation exists.
 * @param {string} key     — translation key from T above
 * @param {string} lang    — language code e.g. "es"
 * @returns {string}
 */
export function t(key, lang = "en") {
  const entry = T[key];
  if (!entry) {
    console.warn(`[i18n] Missing key: "${key}"`);
    return key;
  }
  return entry[lang] || entry["en"] || key;
}

/**
 * Get the Director language instruction for the system prompt.
 * Injected into the Edge Function system prompt.
 */
export function getDirectorLanguageInstruction(lang) {
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  if (!lang || lang === "en" || !langObj) return "";

  return `\n\n━━━ LANGUAGE DIRECTIVE ━━━
You MUST respond entirely in ${langObj.name} (${langObj.nativeName}).
Every word of replyText must be in ${langObj.name}.
Do NOT mix languages. Do NOT switch to English under any circumstances.
Technical terms (CAC, LTV, MVP, etc.) may remain in English only when no ${langObj.name} equivalent exists.
This directive overrides all other instructions.`;
}

export default { t, detectLanguage, getDirectorLanguageInstruction, SUPPORTED_LANGUAGES };
