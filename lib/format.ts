/**
 * Formate un montant en centimes en devise FCFA
 */
export function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("XOF", "FCFA");
}

/**
 * Formate une date en français
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR");
}

/**
 * Formate une date avec l'heure en français
 */
export function formatDateTime(date: string | Date): string {
  return (
    new Date(date).toLocaleDateString("fr-FR") +
    " à " +
    new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}










