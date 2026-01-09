import { createContext, useContext } from 'react';

export type Language = 'en' | 'es' | 'fr';

export interface Translations {
  // Navigation
  home: string;
  timeline: string;
  symptomsNav: string;
  messages: string;
  forum: string;
  profile: string;
  back: string;
  scheduleAppointment: string;

  // Common
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  submit: string;
  close: string;
  next: string;
  previous: string;
  search: string;
  mobileAccess: string;
  accessOnMobile: string;
  scanQRCode: string;
  howToUse: string;
  copyUrl: string;
  mobileOptimized: string;
  fullFeatures: string;

  // Home page
  welcomeBack: string;
  pregnancyJourney: string;
  currentWeek: string;
  daysUntilDue: string;
  quickActions: string;
  logSymptoms: string;
  trackMood: string;
  recentActivity: string;
  viewTimeline: string;
  checkMessages: string;
  browseEducation: string;
  schedulingSection: string;
  schedulingDescription: string;
  bookAppointment: string;

  // Symptoms
  symptomTracking: string;
  logNewSymptoms: string;
  commonSymptoms: string;
  customSymptom: string;
  addSymptom: string;
  severityLevel: string;
  moodScore: string;
  notes: string;
  logSymptomsAction: string;
  symptomHistory: string;
  analytics: string;
  totalLogs: string;
  averageMood: string;
  topSymptoms: string;
  moodTrend: string;

  // Messages
  messaging: string;
  conversations: string;
  newMessage: string;
  typeMessage: string;
  sendMessage: string;
  markAsRead: string;
  emergency: string;
  clinician: string;

  // Forum
  communityForum: string;
  categories: string;
  allCategories: string;
  general: string;
  nutrition: string;
  exercise: string;
  symptomsCategory: string;
  postpartum: string;
  createNewThread: string;
  threadTitle: string;
  threadContent: string;
  createThread: string;
  replies: string;
  lastReply: string;

  // Profile
  personalProfile: string;
  pregnancyInfo: string;
  babyName: string;
  dueDate: string;
  currentWeekProfile: string;
  isHighRisk: string;
  profileNotes: string;
  contactInfo: string;
  firstName: string;
  lastName: string;
  email: string;

  // Timeline
  pregnancyTimeline: string;
  weekByWeek: string;
  milestones: string;
  education: string;
  completed: string;
  upcoming: string;
  overdue: string;

  // Error messages
  error: string;
  unauthorized: string;
  loginAgain: string;
  failedToLoad: string;
  tryAgain: string;

  // Success messages
  success: string;
  saved: string;
  updated: string;
  created: string;
  deleted: string;

  // Supplements
  supplements: string;
  supplementsTitle: string;
  supplementsDescription: string;
  searchSupplements: string;
  cartTotal: string;
  items: string;
  checkout: string;
  supplementsTab: string;
  wellnessTab: string;
  packsTab: string;
  backorder: string;
  weight: string;
  addToCart: string;
  wellnessSupport: string;
  learnMore: string;
  wellnessPack: string;
  viewDetails: string;
  emptyCart: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    home: 'Home',
    timeline: 'Timeline',
    symptomsNav: 'Symptoms',
    messages: 'Messages',
    forum: 'Forum',
    profile: 'Profile',
    back: 'Back',
    scheduleAppointment: 'Schedule Appointment',

    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    submit: 'Submit',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    mobileAccess: 'Mobile Access',
    accessOnMobile: 'Access on Mobile',
    scanQRCode: 'Scan the QR code with your phone\'s camera to access Moore Maternal Care on your mobile device.',
    howToUse: 'How to use:',
    copyUrl: 'Or copy the URL to share manually',
    mobileOptimized: 'Mobile Optimized',
    fullFeatures: 'Full pregnancy tracking features, optimized for mobile use with touch-friendly controls and offline capability.',

    // Home page
    welcomeBack: 'Welcome back',
    pregnancyJourney: 'Your Pregnancy Journey',
    currentWeek: 'Current Week',
    daysUntilDue: 'Days Until Due',
    quickActions: 'Quick Actions',
    logSymptoms: 'Log Symptoms',
    logSymptomsAction: 'Log Symptoms',
    trackMood: 'Track Mood',
    recentActivity: 'Recent Activity',
    viewTimeline: 'View Timeline',
    checkMessages: 'Check Messages',
    browseEducation: 'Browse Education',
    schedulingSection: 'Appointment Scheduling',
    schedulingDescription: 'Book your next appointment with Moore OB/GYN for personalized care throughout your pregnancy journey.',
    bookAppointment: 'Book Appointment',

    // Symptoms
    symptomTracking: 'Symptom Tracking',
    logNewSymptoms: 'Log New Symptoms',
    commonSymptoms: 'Common Symptoms',
    customSymptom: 'Custom symptom',
    addSymptom: 'Add Symptom',
    severityLevel: 'Severity Level',
    moodScore: 'Mood Score',
    notes: 'Notes',
    symptomHistory: 'Symptom History',
    analytics: 'Analytics',
    totalLogs: 'Total Logs',
    averageMood: 'Average Mood',
    topSymptoms: 'Top Symptoms',
    moodTrend: 'Mood Trend',

    // Messages
    messaging: 'Messaging',
    conversations: 'Conversations',
    newMessage: 'New Message',
    typeMessage: 'Type your message...',
    sendMessage: 'Send Message',
    markAsRead: 'Mark as Read',
    emergency: 'Emergency',
    clinician: 'Clinician',

    // Forum
    communityForum: 'Community Forum',
    categories: 'Categories',
    allCategories: 'All Categories',
    general: 'General',
    nutrition: 'Nutrition',
    exercise: 'Exercise',
    symptomsCategory: 'Symptoms',
    postpartum: 'Postpartum',
    createNewThread: 'Create New Thread',
    threadTitle: 'Thread Title',
    threadContent: 'Thread Content',
    createThread: 'Create Thread',
    replies: 'Replies',
    lastReply: 'Last Reply',

    // Profile
    personalProfile: 'Personal Profile',
    pregnancyInfo: 'Pregnancy Information',
    babyName: 'Baby Name',
    dueDate: 'Due Date',
    currentWeekProfile: 'Current Week',
    isHighRisk: 'High Risk Pregnancy',
    profileNotes: 'Notes',
    contactInfo: 'Contact Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',

    // Timeline
    pregnancyTimeline: 'Pregnancy Timeline',
    weekByWeek: 'Week by Week',
    milestones: 'Milestones',
    education: 'Education',
    completed: 'Completed',
    upcoming: 'Upcoming',
    overdue: 'Overdue',

    // Error messages
    error: 'Error',
    unauthorized: 'Unauthorized',
    loginAgain: 'Please log in again',
    failedToLoad: 'Failed to load',
    tryAgain: 'Please try again',

    // Success messages
    success: 'Success',
    saved: 'Saved successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
    deleted: 'Deleted successfully',

    // Supplements
    supplements: 'Supplements',
    supplementsTitle: 'Wellness Supplements',
    supplementsDescription: 'Prenatal vitamins and wellness products recommended for your pregnancy journey',
    searchSupplements: 'Search supplements...',
    cartTotal: 'Cart Total',
    items: 'items',
    checkout: 'Checkout',
    supplementsTab: 'Supplements',
    wellnessTab: 'Wellness',
    packsTab: 'Packs',
    backorder: 'Backorder',
    weight: 'Weight',
    addToCart: 'Add to Cart',
    wellnessSupport: 'Wellness Support',
    learnMore: 'Learn More',
    wellnessPack: 'Wellness Pack',
    viewDetails: 'View Details',
    emptyCart: 'Your cart is empty',
  },
  es: {
    // Navigation
    home: 'Inicio',
    timeline: 'Cronología',
    symptomsNav: 'Síntomas',
    messages: 'Mensajes',
    forum: 'Foro',
    profile: 'Perfil',
    back: 'Atrás',
    scheduleAppointment: 'Programar Cita',

    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    submit: 'Enviar',
    close: 'Cerrar',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    mobileAccess: 'Acceso Móvil',
    accessOnMobile: 'Acceder en Móvil',
    scanQRCode: 'Escanea el código QR con la cámara de tu teléfono para acceder a Moore Maternal Care en tu dispositivo móvil.',
    howToUse: 'Cómo usar:',
    copyUrl: 'O copia la URL para compartir manualmente',
    mobileOptimized: 'Optimizado para Móvil',
    fullFeatures: 'Características completas de seguimiento del embarazo, optimizadas para uso móvil con controles táctiles y capacidad sin conexión.',

    // Home page
    welcomeBack: 'Bienvenida de nuevo',
    pregnancyJourney: 'Tu Viaje de Embarazo',
    currentWeek: 'Semana Actual',
    daysUntilDue: 'Días Hasta el Parto',
    quickActions: 'Acciones Rápidas',
    logSymptoms: 'Registrar Síntomas',
    logSymptomsAction: 'Registrar Síntomas',
    trackMood: 'Seguir Estado de Ánimo',
    recentActivity: 'Actividad Reciente',
    viewTimeline: 'Ver Cronología',
    checkMessages: 'Revisar Mensajes',
    browseEducation: 'Explorar Educación',
    schedulingSection: 'Programación de Citas',
    schedulingDescription: 'Reserva tu próxima cita con Moore OB/GYN para recibir atención personalizada durante tu embarazo.',
    bookAppointment: 'Reservar Cita',

    // Symptoms
    symptomTracking: 'Seguimiento de Síntomas',
    logNewSymptoms: 'Registrar Nuevos Síntomas',
    commonSymptoms: 'Síntomas Comunes',
    customSymptom: 'Síntoma personalizado',
    addSymptom: 'Agregar Síntoma',
    severityLevel: 'Nivel de Gravedad',
    moodScore: 'Puntuación del Estado de Ánimo',
    notes: 'Notas',
    symptomHistory: 'Historial de Síntomas',
    analytics: 'Análisis',
    totalLogs: 'Registros Totales',
    averageMood: 'Estado de Ánimo Promedio',
    topSymptoms: 'Síntomas Principales',
    moodTrend: 'Tendencia del Estado de Ánimo',

    // Messages
    messaging: 'Mensajería',
    conversations: 'Conversaciones',
    newMessage: 'Nuevo Mensaje',
    typeMessage: 'Escribe tu mensaje...',
    sendMessage: 'Enviar Mensaje',
    markAsRead: 'Marcar como Leído',
    emergency: 'Emergencia',
    clinician: 'Médico',

    // Forum
    communityForum: 'Foro Comunitario',
    categories: 'Categorías',
    allCategories: 'Todas las Categorías',
    general: 'General',
    nutrition: 'Nutrición',
    exercise: 'Ejercicio',
    symptomsCategory: 'Síntomas',
    postpartum: 'Postparto',
    createNewThread: 'Crear Nuevo Hilo',
    threadTitle: 'Título del Hilo',
    threadContent: 'Contenido del Hilo',
    createThread: 'Crear Hilo',
    replies: 'Respuestas',
    lastReply: 'Última Respuesta',

    // Profile
    personalProfile: 'Perfil Personal',
    pregnancyInfo: 'Información del Embarazo',
    babyName: 'Nombre del Bebé',
    dueDate: 'Fecha de Parto',
    currentWeekProfile: 'Semana Actual',
    isHighRisk: 'Embarazo de Alto Riesgo',
    profileNotes: 'Notas',
    contactInfo: 'Información de Contacto',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',

    // Timeline
    pregnancyTimeline: 'Cronología del Embarazo',
    weekByWeek: 'Semana por Semana',
    milestones: 'Hitos',
    education: 'Educación',
    completed: 'Completado',
    upcoming: 'Próximo',
    overdue: 'Vencido',

    // Error messages
    error: 'Error',
    unauthorized: 'No autorizado',
    loginAgain: 'Por favor, inicia sesión nuevamente',
    failedToLoad: 'Error al cargar',
    tryAgain: 'Por favor, inténtalo de nuevo',

    // Success messages
    success: 'Éxito',
    saved: 'Guardado exitosamente',
    updated: 'Actualizado exitosamente',
    created: 'Creado exitosamente',
    deleted: 'Eliminado exitosamente',

    // Supplements
    supplements: 'Suplementos',
    supplementsTitle: 'Suplementos de Bienestar',
    supplementsDescription: 'Vitaminas prenatales y productos de bienestar recomendados para tu embarazo',
    searchSupplements: 'Buscar suplementos...',
    cartTotal: 'Total del Carrito',
    items: 'artículos',
    checkout: 'Pagar',
    supplementsTab: 'Suplementos',
    wellnessTab: 'Bienestar',
    packsTab: 'Paquetes',
    backorder: 'Pedido Pendiente',
    weight: 'Peso',
    addToCart: 'Agregar al Carrito',
    wellnessSupport: 'Apoyo al Bienestar',
    learnMore: 'Saber Más',
    wellnessPack: 'Paquete de Bienestar',
    viewDetails: 'Ver Detalles',
    emptyCart: 'Tu carrito está vacío',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    timeline: 'Chronologie',
    symptomsNav: 'Symptômes',
    messages: 'Messages',
    forum: 'Forum',
    profile: 'Profil',
    back: 'Retour',
    scheduleAppointment: 'Prendre Rendez-vous',

    // Common
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    submit: 'Soumettre',
    close: 'Fermer',
    next: 'Suivant',
    previous: 'Précédent',
    search: 'Rechercher',
    mobileAccess: 'Accès Mobile',
    accessOnMobile: 'Accéder sur Mobile',
    scanQRCode: 'Scannez le code QR avec l\'appareil photo de votre téléphone pour accéder à Moore Maternal Care sur votre appareil mobile.',
    howToUse: 'Comment utiliser:',
    copyUrl: 'Ou copiez l\'URL pour partager manuellement',
    mobileOptimized: 'Optimisé pour Mobile',
    fullFeatures: 'Fonctionnalités complètes de suivi de grossesse, optimisées pour une utilisation mobile avec des contrôles tactiles et une capacité hors ligne.',

    // Home page
    welcomeBack: 'Bon retour',
    pregnancyJourney: 'Votre Parcours de Grossesse',
    currentWeek: 'Semaine Actuelle',
    daysUntilDue: 'Jours Jusqu\'à l\'Accouchement',
    quickActions: 'Actions Rapides',
    logSymptoms: 'Enregistrer les Symptômes',
    logSymptomsAction: 'Enregistrer les Symptômes',
    trackMood: 'Suivre l\'Humeur',
    recentActivity: 'Activité Récente',
    viewTimeline: 'Voir la Chronologie',
    checkMessages: 'Vérifier les Messages',
    browseEducation: 'Parcourir l\'Éducation',
    schedulingSection: 'Prise de Rendez-vous',
    schedulingDescription: 'Réservez votre prochain rendez-vous avec Moore OB/GYN pour des soins personnalisés tout au long de votre grossesse.',
    bookAppointment: 'Réserver un Rendez-vous',

    // Symptoms
    symptomTracking: 'Suivi des Symptômes',
    logNewSymptoms: 'Enregistrer de Nouveaux Symptômes',
    commonSymptoms: 'Symptômes Courants',
    customSymptom: 'Symptôme personnalisé',
    addSymptom: 'Ajouter un Symptôme',
    severityLevel: 'Niveau de Gravité',
    moodScore: 'Score d\'Humeur',
    notes: 'Notes',
    symptomHistory: 'Historique des Symptômes',
    analytics: 'Analyses',
    totalLogs: 'Journaux Totaux',
    averageMood: 'Humeur Moyenne',
    topSymptoms: 'Principaux Symptômes',
    moodTrend: 'Tendance de l\'Humeur',

    // Messages
    messaging: 'Messagerie',
    conversations: 'Conversations',
    newMessage: 'Nouveau Message',
    typeMessage: 'Tapez votre message...',
    sendMessage: 'Envoyer le Message',
    markAsRead: 'Marquer comme Lu',
    emergency: 'Urgence',
    clinician: 'Clinicien',

    // Forum
    communityForum: 'Forum Communautaire',
    categories: 'Catégories',
    allCategories: 'Toutes les Catégories',
    general: 'Général',
    nutrition: 'Nutrition',
    exercise: 'Exercice',
    symptomsCategory: 'Symptômes',
    postpartum: 'Post-partum',
    createNewThread: 'Créer un Nouveau Fil',
    threadTitle: 'Titre du Fil',
    threadContent: 'Contenu du Fil',
    createThread: 'Créer un Fil',
    replies: 'Réponses',
    lastReply: 'Dernière Réponse',

    // Profile
    personalProfile: 'Profil Personnel',
    pregnancyInfo: 'Informations sur la Grossesse',
    babyName: 'Nom du Bébé',
    dueDate: 'Date d\'Accouchement',
    currentWeekProfile: 'Semaine Actuelle',
    isHighRisk: 'Grossesse à Haut Risque',
    profileNotes: 'Notes',
    contactInfo: 'Informations de Contact',
    firstName: 'Prénom',
    lastName: 'Nom de Famille',
    email: 'Email',

    // Timeline
    pregnancyTimeline: 'Chronologie de la Grossesse',
    weekByWeek: 'Semaine par Semaine',
    milestones: 'Jalons',
    education: 'Éducation',
    completed: 'Terminé',
    upcoming: 'À Venir',
    overdue: 'En Retard',

    // Error messages
    error: 'Erreur',
    unauthorized: 'Non autorisé',
    loginAgain: 'Veuillez vous reconnecter',
    failedToLoad: 'Échec du chargement',
    tryAgain: 'Veuillez réessayer',

    // Success messages
    success: 'Succès',
    saved: 'Enregistré avec succès',
    updated: 'Mis à jour avec succès',
    created: 'Créé avec succès',
    deleted: 'Supprimé avec succès',

    // Supplements
    supplements: 'Suppléments',
    supplementsTitle: 'Suppléments de Bien-être',
    supplementsDescription: 'Vitamines prénatales et produits de bien-être recommandés pour votre grossesse',
    searchSupplements: 'Rechercher des suppléments...',
    cartTotal: 'Total du Panier',
    items: 'articles',
    checkout: 'Payer',
    supplementsTab: 'Suppléments',
    wellnessTab: 'Bien-être',
    packsTab: 'Packs',
    backorder: 'En Attente',
    weight: 'Poids',
    addToCart: 'Ajouter au Panier',
    wellnessSupport: 'Soutien au Bien-être',
    learnMore: 'En Savoir Plus',
    wellnessPack: 'Pack Bien-être',
    viewDetails: 'Voir les Détails',
    emptyCart: 'Votre panier est vide',
  },
};

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const getTranslations = (language: Language): Translations => {
  return translations[language] || translations.en;
};