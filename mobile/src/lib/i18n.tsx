import React, { createContext, useContext, useState } from "react";

export type Language = "en" | "es" | "fr";

export interface Translations {
  home: string;
  timeline: string;
  symptomsNav: string;
  messages: string;
  forum: string;
  profile: string;
  back: string;
  scheduleAppointment: string;
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
  welcomeBack: string;
  pregnancyJourney: string;
  currentWeek: string;
  daysUntilDue: string;
  quickActions: string;
  logSymptoms: string;
  logSymptomsAction: string;
  trackMood: string;
  recentActivity: string;
  viewTimeline: string;
  checkMessages: string;
  browseEducation: string;
  schedulingSection: string;
  schedulingDescription: string;
  bookAppointment: string;
  symptomTracking: string;
  logNewSymptoms: string;
  commonSymptoms: string;
  customSymptom: string;
  addSymptom: string;
  severityLevel: string;
  moodScore: string;
  notes: string;
  symptomHistory: string;
  analytics: string;
  totalLogs: string;
  averageMood: string;
  topSymptoms: string;
  moodTrend: string;
  messaging: string;
  conversations: string;
  newMessage: string;
  typeMessage: string;
  sendMessage: string;
  emergency: string;
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
  personalProfile: string;
  pregnancyInfo: string;
  babyName: string;
  dueDate: string;
  isHighRisk: string;
  profileNotes: string;
  contactInfo: string;
  firstName: string;
  lastName: string;
  email: string;
  pregnancyTimeline: string;
  milestones: string;
  education: string;
  completed: string;
  upcoming: string;
  error: string;
  failedToLoad: string;
  tryAgain: string;
  success: string;
  saved: string;
  supplements: string;
  supplementsDescription: string;
  searchSupplements: string;
  addToCart: string;
  viewDetails: string;
  checkout: string;
  items: string;
  emptyCart: string;
}

const en: Translations = {
  home: "Home",
  timeline: "Timeline",
  symptomsNav: "Symptoms",
  messages: "Messages",
  forum: "Forum",
  profile: "Profile",
  back: "Back",
  scheduleAppointment: "Schedule Appointment",
  loading: "Loading...",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  submit: "Submit",
  close: "Close",
  next: "Next",
  previous: "Previous",
  search: "Search",
  welcomeBack: "Welcome back",
  pregnancyJourney: "Your Pregnancy Journey",
  currentWeek: "Current Week",
  daysUntilDue: "Days Until Due",
  quickActions: "Quick Actions",
  logSymptoms: "Log Symptoms",
  logSymptomsAction: "Log Symptoms",
  trackMood: "Track Mood",
  recentActivity: "Recent Activity",
  viewTimeline: "View Timeline",
  checkMessages: "Check Messages",
  browseEducation: "Browse Education",
  schedulingSection: "Appointment Scheduling",
  schedulingDescription:
    "Book your next appointment with Moore OB/GYN for personalized care throughout your pregnancy journey.",
  bookAppointment: "Book Appointment",
  symptomTracking: "Symptom Tracking",
  logNewSymptoms: "Log New Symptoms",
  commonSymptoms: "Common Symptoms",
  customSymptom: "Custom symptom",
  addSymptom: "Add Symptom",
  severityLevel: "Severity Level",
  moodScore: "Mood Score",
  notes: "Notes",
  symptomHistory: "Symptom History",
  analytics: "Analytics",
  totalLogs: "Total Logs",
  averageMood: "Average Mood",
  topSymptoms: "Top Symptoms",
  moodTrend: "Mood Trend",
  messaging: "Messaging",
  conversations: "Conversations",
  newMessage: "New Message",
  typeMessage: "Type your message...",
  sendMessage: "Send",
  emergency: "Emergency",
  communityForum: "Community Forum",
  categories: "Categories",
  allCategories: "All Categories",
  general: "General",
  nutrition: "Nutrition",
  exercise: "Exercise",
  symptomsCategory: "Symptoms",
  postpartum: "Postpartum",
  createNewThread: "Create New Thread",
  threadTitle: "Thread Title",
  threadContent: "Thread Content",
  createThread: "Create Thread",
  replies: "Replies",
  lastReply: "Last Reply",
  personalProfile: "Personal Profile",
  pregnancyInfo: "Pregnancy Information",
  babyName: "Baby Name",
  dueDate: "Due Date",
  isHighRisk: "High Risk Pregnancy",
  profileNotes: "Notes",
  contactInfo: "Contact Information",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  pregnancyTimeline: "Pregnancy Timeline",
  milestones: "Milestones",
  education: "Education",
  completed: "Completed",
  upcoming: "Upcoming",
  error: "Error",
  failedToLoad: "Failed to load",
  tryAgain: "Please try again",
  success: "Success",
  saved: "Saved successfully",
  supplements: "Supplements",
  supplementsDescription:
    "Prenatal vitamins and wellness products recommended for your pregnancy journey",
  searchSupplements: "Search supplements...",
  addToCart: "Add to Cart",
  viewDetails: "View Details",
  checkout: "Checkout",
  items: "items",
  emptyCart: "Your cart is empty",
};

const es: Translations = {
  home: "Inicio",
  timeline: "Cronología",
  symptomsNav: "Síntomas",
  messages: "Mensajes",
  forum: "Foro",
  profile: "Perfil",
  back: "Atrás",
  scheduleAppointment: "Programar Cita",
  loading: "Cargando...",
  save: "Guardar",
  cancel: "Cancelar",
  delete: "Eliminar",
  edit: "Editar",
  submit: "Enviar",
  close: "Cerrar",
  next: "Siguiente",
  previous: "Anterior",
  search: "Buscar",
  welcomeBack: "Bienvenida de nuevo",
  pregnancyJourney: "Tu Viaje de Embarazo",
  currentWeek: "Semana Actual",
  daysUntilDue: "Días Hasta el Parto",
  quickActions: "Acciones Rápidas",
  logSymptoms: "Registrar Síntomas",
  logSymptomsAction: "Registrar Síntomas",
  trackMood: "Seguir Estado de Ánimo",
  recentActivity: "Actividad Reciente",
  viewTimeline: "Ver Cronología",
  checkMessages: "Revisar Mensajes",
  browseEducation: "Explorar Educación",
  schedulingSection: "Programación de Citas",
  schedulingDescription:
    "Reserva tu próxima cita con Moore OB/GYN para recibir atención personalizada durante tu embarazo.",
  bookAppointment: "Reservar Cita",
  symptomTracking: "Seguimiento de Síntomas",
  logNewSymptoms: "Registrar Nuevos Síntomas",
  commonSymptoms: "Síntomas Comunes",
  customSymptom: "Síntoma personalizado",
  addSymptom: "Agregar Síntoma",
  severityLevel: "Nivel de Gravedad",
  moodScore: "Puntuación del Estado de Ánimo",
  notes: "Notas",
  symptomHistory: "Historial de Síntomas",
  analytics: "Análisis",
  totalLogs: "Registros Totales",
  averageMood: "Estado de Ánimo Promedio",
  topSymptoms: "Síntomas Principales",
  moodTrend: "Tendencia del Estado de Ánimo",
  messaging: "Mensajería",
  conversations: "Conversaciones",
  newMessage: "Nuevo Mensaje",
  typeMessage: "Escribe tu mensaje...",
  sendMessage: "Enviar",
  emergency: "Emergencia",
  communityForum: "Foro Comunitario",
  categories: "Categorías",
  allCategories: "Todas las Categorías",
  general: "General",
  nutrition: "Nutrición",
  exercise: "Ejercicio",
  symptomsCategory: "Síntomas",
  postpartum: "Postparto",
  createNewThread: "Crear Nuevo Hilo",
  threadTitle: "Título del Hilo",
  threadContent: "Contenido del Hilo",
  createThread: "Crear Hilo",
  replies: "Respuestas",
  lastReply: "Última Respuesta",
  personalProfile: "Perfil Personal",
  pregnancyInfo: "Información del Embarazo",
  babyName: "Nombre del Bebé",
  dueDate: "Fecha de Parto",
  isHighRisk: "Embarazo de Alto Riesgo",
  profileNotes: "Notas",
  contactInfo: "Información de Contacto",
  firstName: "Nombre",
  lastName: "Apellido",
  email: "Correo Electrónico",
  pregnancyTimeline: "Cronología del Embarazo",
  milestones: "Hitos",
  education: "Educación",
  completed: "Completado",
  upcoming: "Próximo",
  error: "Error",
  failedToLoad: "Error al cargar",
  tryAgain: "Por favor, inténtalo de nuevo",
  success: "Éxito",
  saved: "Guardado exitosamente",
  supplements: "Suplementos",
  supplementsDescription:
    "Vitaminas prenatales y productos de bienestar recomendados para tu embarazo",
  searchSupplements: "Buscar suplementos...",
  addToCart: "Agregar al Carrito",
  viewDetails: "Ver Detalles",
  checkout: "Pagar",
  items: "artículos",
  emptyCart: "Tu carrito está vacío",
};

const fr: Translations = {
  home: "Accueil",
  timeline: "Chronologie",
  symptomsNav: "Symptômes",
  messages: "Messages",
  forum: "Forum",
  profile: "Profil",
  back: "Retour",
  scheduleAppointment: "Prendre Rendez-vous",
  loading: "Chargement...",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  submit: "Soumettre",
  close: "Fermer",
  next: "Suivant",
  previous: "Précédent",
  search: "Rechercher",
  welcomeBack: "Bon retour",
  pregnancyJourney: "Votre Parcours de Grossesse",
  currentWeek: "Semaine Actuelle",
  daysUntilDue: "Jours Jusqu'à l'Accouchement",
  quickActions: "Actions Rapides",
  logSymptoms: "Enregistrer les Symptômes",
  logSymptomsAction: "Enregistrer les Symptômes",
  trackMood: "Suivre l'Humeur",
  recentActivity: "Activité Récente",
  viewTimeline: "Voir la Chronologie",
  checkMessages: "Vérifier les Messages",
  browseEducation: "Parcourir l'Éducation",
  schedulingSection: "Prise de Rendez-vous",
  schedulingDescription:
    "Réservez votre prochain rendez-vous avec Moore OB/GYN pour des soins personnalisés tout au long de votre grossesse.",
  bookAppointment: "Réserver un Rendez-vous",
  symptomTracking: "Suivi des Symptômes",
  logNewSymptoms: "Enregistrer de Nouveaux Symptômes",
  commonSymptoms: "Symptômes Courants",
  customSymptom: "Symptôme personnalisé",
  addSymptom: "Ajouter un Symptôme",
  severityLevel: "Niveau de Gravité",
  moodScore: "Score d'Humeur",
  notes: "Notes",
  symptomHistory: "Historique des Symptômes",
  analytics: "Analyses",
  totalLogs: "Journaux Totaux",
  averageMood: "Humeur Moyenne",
  topSymptoms: "Principaux Symptômes",
  moodTrend: "Tendance de l'Humeur",
  messaging: "Messagerie",
  conversations: "Conversations",
  newMessage: "Nouveau Message",
  typeMessage: "Tapez votre message...",
  sendMessage: "Envoyer",
  emergency: "Urgence",
  communityForum: "Forum Communautaire",
  categories: "Catégories",
  allCategories: "Toutes les Catégories",
  general: "Général",
  nutrition: "Nutrition",
  exercise: "Exercice",
  symptomsCategory: "Symptômes",
  postpartum: "Post-partum",
  createNewThread: "Créer un Nouveau Fil",
  threadTitle: "Titre du Fil",
  threadContent: "Contenu du Fil",
  createThread: "Créer un Fil",
  replies: "Réponses",
  lastReply: "Dernière Réponse",
  personalProfile: "Profil Personnel",
  pregnancyInfo: "Informations sur la Grossesse",
  babyName: "Nom du Bébé",
  dueDate: "Date d'Accouchement",
  isHighRisk: "Grossesse à Haut Risque",
  profileNotes: "Notes",
  contactInfo: "Informations de Contact",
  firstName: "Prénom",
  lastName: "Nom de Famille",
  email: "Email",
  pregnancyTimeline: "Chronologie de la Grossesse",
  milestones: "Jalons",
  education: "Éducation",
  completed: "Terminé",
  upcoming: "À Venir",
  error: "Erreur",
  failedToLoad: "Échec du chargement",
  tryAgain: "Veuillez réessayer",
  success: "Succès",
  saved: "Enregistré avec succès",
  supplements: "Suppléments",
  supplementsDescription:
    "Vitamines prénatales et produits de bien-être recommandés pour votre grossesse",
  searchSupplements: "Rechercher des suppléments...",
  addToCart: "Ajouter au Panier",
  viewDetails: "Voir les Détails",
  checkout: "Payer",
  items: "articles",
  emptyCart: "Votre panier est vide",
};

const translationsMap: Record<Language, Translations> = { en, es, fr };

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextValue>({
  language: "en",
  setLanguage: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const t = translationsMap[language];
  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
