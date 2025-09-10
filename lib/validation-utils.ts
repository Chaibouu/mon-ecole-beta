/**
 * Utilitaires de validation pour l'authentification
 */

/**
 * Détecte si une chaîne est un numéro de téléphone international
 * @param value - La chaîne à vérifier
 * @returns true si c'est un numéro de téléphone valide
 */
export const isPhoneNumber = (value: string): boolean => {
  // Validation stricte pour le Niger (format exact)
  if (isNigerianPhone(value)) {
    return true;
  }

  // Validation générale pour les autres pays
  // Commence par + suivi d'un chiffre de 1-9, puis 6-14 chiffres supplémentaires
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  return phoneRegex.test(value);
};

/**
 * Détecte si une chaîne est un email valide
 * @param value - La chaîne à vérifier
 * @returns true si c'est un email valide
 */
export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Détecte si une chaîne est un identifiant valide (email ou téléphone)
 * @param value - La chaîne à vérifier
 * @returns true si c'est un email ou un téléphone valide
 */
export const isValidIdentifier = (value: string): boolean => {
  return isEmail(value) || isPhoneNumber(value);
};

/**
 * Détermine le type d'identifiant (email ou phone)
 * @param value - La chaîne à analyser
 * @returns 'email' | 'phone' | 'unknown'
 */
export const getIdentifierType = (
  value: string
): "email" | "phone" | "unknown" => {
  if (isEmail(value)) return "email";
  if (isPhoneNumber(value)) return "phone";
  return "unknown";
};

/**
 * Valide un numéro de téléphone nigérien spécifiquement
 * @param value - Le numéro à vérifier
 * @returns true si c'est un numéro nigérien valide
 */
export const isNigerianPhone = (value: string): boolean => {
  const nigerianPhoneRegex = /^\+227[0-9]{8}$/;
  return nigerianPhoneRegex.test(value);
};

/**
 * Valide un numéro de téléphone français spécifiquement
 * @param value - Le numéro à vérifier
 * @returns true si c'est un numéro français valide
 */
export const isFrenchPhone = (value: string): boolean => {
  const frenchPhoneRegex = /^\+33[1-9][0-9]{8}$/;
  return frenchPhoneRegex.test(value);
};

/**
 * Obtient le pays d'un numéro de téléphone basé sur l'indicatif
 * @param value - Le numéro de téléphone
 * @returns Le nom du pays ou 'Unknown'
 */
export const getCountryFromPhone = (value: string): string => {
  if (!isPhoneNumber(value)) return "Unknown";

  const countryCodes: Record<string, string> = {
    "+227": "Niger",
    "+33": "France",
    "+1": "États-Unis/Canada",
    "+44": "Royaume-Uni",
    "+49": "Allemagne",
    "+86": "Chine",
    "+91": "Inde",
    "+234": "Nigeria",
    "+225": "Côte d'Ivoire",
    "+226": "Burkina Faso",
    "+228": "Togo",
    "+229": "Bénin",
    "+230": "Maurice",
    "+231": "Libéria",
    "+232": "Sierra Leone",
    "+233": "Ghana",
    "+235": "Tchad",
    "+236": "République centrafricaine",
    "+237": "Cameroun",
    "+238": "Cap-Vert",
    "+239": "São Tomé-et-Príncipe",
    "+240": "Guinée équatoriale",
    "+241": "Gabon",
    "+242": "République du Congo",
    "+243": "République démocratique du Congo",
    "+244": "Angola",
    "+245": "Guinée-Bissau",
    "+246": "Territoire britannique de l'océan Indien",
    "+248": "Seychelles",
    "+249": "Soudan",
    "+250": "Rwanda",
    "+251": "Éthiopie",
    "+252": "Somalie",
    "+253": "Djibouti",
    "+254": "Kenya",
    "+255": "Tanzanie",
    "+256": "Ouganda",
    "+257": "Burundi",
    "+258": "Mozambique",
    "+260": "Zambie",
    "+261": "Madagascar",
    "+262": "Réunion",
    "+263": "Zimbabwe",
    "+264": "Namibie",
    "+265": "Malawi",
    "+266": "Lesotho",
    "+267": "Botswana",
    "+268": "Eswatini",
    "+269": "Comores",
    "+290": "Sainte-Hélène",
    "+291": "Érythrée",
    "+297": "Aruba",
    "+298": "Îles Féroé",
    "+299": "Groenland",
  };

  // Extraire l'indicatif (commence par + suivi de 1-3 chiffres)
  const match = value.match(/^\+(\d{1,3})/);
  if (!match) return "Unknown";

  const code = "+" + match[1];
  return countryCodes[code] || "Unknown";
};
