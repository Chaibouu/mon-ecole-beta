type Item = {
  title: string;
  done?: boolean;
  detail?: string;
};

type Section = {
  heading: string;
  items: Item[];
};

const done = true;

const sections: Section[] = [
  {
    heading: "Transversal (Auth/ACL/Infra)",
    items: [
      { title: "Schéma multi-établissement (Prisma)", done },
      { title: "ACL par école (middleware + utils)", done },
      { title: "Désactiver inscription publique (signup)", detail: "Retirer les pages et routes /auth/signup" },
      { title: "Sélecteur d'école côté front + persistance", detail: "stockage local/cookie, header x-school-id sur appels" },
      { title: "CI: lint, type-check, tests unit & e2e" },
      { title: "Observabilité (logs, Sentry)", detail: "erreurs backend + front" },
    ],
  },
  {
    heading: "Administration (Back-office école)",
    items: [
      { title: "CRUD Niveaux (grade-levels)", done },
      { title: "CRUD Classes (classrooms)", done },
      { title: "CRUD Matières (subjects)", done },
      { title: "Coefficients par classe/matière (classroom-subjects)", done },
      { title: "Affectations enseignants (teacher-assignments)", done },
      { title: "Inscriptions élèves (enrollments)", done },
      { title: "Import Excel (élèves, notes, paiements)", detail: "upload, prévisualisation, validation, insertion" },
      { title: "Paramètres école (SchoolSetting)" },
      { title: "Statistiques globales (classes/sections)" },
    ],
  },
  {
    heading: "Enseignants",
    items: [
      { title: "Emploi du temps (timetable-entries)", done },
      { title: "Appel de présence (attendance-records)", done },
      { title: "Saisie des notes (assessments + student-grades)", done },
      { title: "Sécurité saisie notes (auth secondaire)", detail: "MFA courte ou password recheck" },
      { title: "Notifications internes (planning/rappels)" },
      { title: "Statistiques élèves (par classe/matière)" },
    ],
  },
  {
    heading: "Élèves",
    items: [
      { title: "Emploi du temps (vue jour/semaine)" },
      { title: "Résultats, moyennes, rangs", detail: "agrégations par trimestre" },
      { title: "Présences et absences (historique)" },
      { title: "Informations médicales personnelles", detail: "formulaire sécurisé (admin-only visibility)" },
      { title: "Test personnalité / orientation" },
      { title: "Exercices/quiz (phase ultérieure)" },
    ],
  },
  {
    heading: "Parents",
    items: [
      { title: "Suivi présence des enfants (journalier/hebdo)" },
      { title: "Emploi du temps enfants (temps réel)" },
      { title: "Notes et résultats (coeff, moy, rang)" },
      { title: "Bulletins scolaires (PDF)" },
      { title: "Notifications & rappels (devoirs, retards, paiements)" },
      { title: "Communication (désactivée pour l’instant)", detail: "messagerie interne mise en pause" },
      { title: "Pop-ups de sensibilisation" },
      { title: "Paiements & suivi des frais" },
    ],
  },
  {
    heading: "Finance (Frais/Paiements)",
    items: [
      { title: "Paramétrage des frais (fee-schedules)", detail: "par niveau/classe/période" },
      { title: "Factures (invoices)" },
      { title: "Paiements (payments)", detail: "intégration passerelle + webhooks" },
      { title: "Blocage d’accès en cas d’impayés", detail: "logique middleware + UI d’état" },
    ],
  },
  {
    heading: "Bulletins & PDFs",
    items: [
      { title: "Génération bulletins (ReportCard)" },
      { title: "Signature numérique école" },
      { title: "Stockage fichiers (S3/MinIO) + téléchargement" },
      { title: "Job queue (table Job) pour génération asynchrone" },
    ],
  },
  {
    heading: "Notifications",
    items: [
      { title: "CRUD Notifications (Notification)", detail: "web + mobile" },
      { title: "PushDeviceToken (FCM)" },
      { title: "Règles d’envoi par rôle/événement" },
    ],
  },
  {
    heading: "Documentation & Qualité",
    items: [
      { title: "Page API Docs (enrichir en continu)", done },
      { title: "Changelog (CHANGELOG.md)", done },
      { title: "README (corriger Postgres + env)", detail: "remplacer mention MongoDB" },
      { title: "Tests unitaires (couverture accrue)", detail: "toutes routes, services, Zod" },
      { title: "Tests e2e Playwright (scénarios clés)" },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Feuille de route</h1>
      <p className="text-sm text-muted-foreground">
        Liste synthétique des actions à mener, dérivées des user stories. Coche = déjà en place côté back ou structure.
      </p>
      <div className="grid gap-6">
        {sections.map((s) => (
          <section key={s.heading} className="space-y-3">
            <h2 className="text-xl font-medium">{s.heading}</h2>
            <ul className="space-y-2">
              {s.items.map((it) => (
                <li key={it.title} className="flex items-start gap-3">
                  <input type="checkbox" checked={!!it.done} readOnly className="mt-1" />
                  <div>
                    <div className="font-medium">{it.title}</div>
                    {it.detail && <div className="text-sm text-muted-foreground">{it.detail}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}


