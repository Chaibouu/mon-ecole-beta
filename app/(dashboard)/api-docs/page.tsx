export default function ApiDocsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Documentation API</h1>
      <p>Cette page recense les endpoints disponibles et leurs paramètres.</p>
      <p className="text-sm">Toutes les routes protégées requièrent les headers: Authorization: Bearer &lt;token&gt; et x-school-id: &lt;schoolId&gt;.</p>
      <p className="text-sm">La sélection de l'école active peut se faire via POST /api/active-school avec {`{ schoolId }`} dans le body.</p>
      
      <section className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-medium text-blue-800">📱 Authentification Hybride</h2>
        <p className="text-blue-700">Le système supporte maintenant l'authentification par <strong>email OU téléphone</strong>.</p>
        <ul className="list-disc pl-6 text-blue-700">
          <li><strong>Format téléphone</strong>: +227XXXXXXXX (ex: +22712345678)</li>
          <li><strong>Rétrocompatibilité</strong>: Les emails existants continuent de fonctionner</li>
          <li><strong>Détection automatique</strong>: Le système détecte le format saisi</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-medium">/api/auth/login</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Authentification utilisateur (email OU téléphone)</li>
          <li><b>POST</b>: Connexion avec {`{ email?, phone?, password, rememberMe? }`}</li>
          <li><b>Format téléphone</b>: +227XXXXXXXX</li>
          <li><b>Rétrocompatibilité</b>: Accepte les emails existants</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",  // OU
  "phone": "+22712345678",      // OU (un des deux requis)
  "password": "motdepasse123",
  "rememberMe": true
}`}</pre>
      </section>
      
      <section>
        <h2 className="text-xl font-medium">/api/active-school</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Définir l'école active pour l'utilisateur connecté</li>
          <li><b>POST</b>: Sélectionner une école {`{ schoolId }`}</li>
          <li><b>Vérification</b>: L'utilisateur doit être rattaché à cette école (sauf SUPER_ADMIN)</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/active-school
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolId": "school-uuid"
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/academic-years</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des années scolaires par école</li>
          <li><b>GET</b>: Liste des années scolaires</li>
          <li><b>POST</b> (ADMIN): Créer {`{ name, startDate, endDate, isActive? }`}</li>
          <li><b>GET /[id]</b>: Détail d'une année scolaire</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier une année scolaire</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer une année scolaire</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/academic-years
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "name": "2024-2025",
  "startDate": "2024-09-01",
  "endDate": "2025-06-30",
  "isActive": true
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/terms</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des périodes/trimestres</li>
          <li><b>GET</b>: Liste des périodes (paramètre optionnel academicYearId)</li>
          <li><b>POST</b> (ADMIN): Créer {`{ academicYearId, name, order, startDate, endDate }`}</li>
          <li><b>GET /[id]</b>: Détail d'une période</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier une période</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer une période</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/terms?academicYearId=<id>
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/schools</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des établissements (SUPER_ADMIN)</li>
          <li><b>GET</b>: Liste des écoles</li>
          <li><b>POST</b>: Créer une école {`{ code, name, address?, phone?, email? }`}</li>
          <li><b>GET /[id]</b>: Détail d'une école</li>
          <li><b>PATCH /[id]</b> (SUPER_ADMIN ou ADMIN de l'école): Modifier une école</li>
          <li><b>DELETE /[id]</b> (SUPER_ADMIN): Suppression logique d'une école</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Exemple requête POST</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/schools
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ALP",
  "name": "École Alpha",
  "address": "Centre Ville",
  "phone": "+221 ...",
  "email": "contact@alpha.school"
}`}</pre>
          </div>
          <div>
            <div className="font-mono text-sm">Exemple réponse 201</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
{
  "school": { "id": "...", "code": "ALP", "name": "École Alpha", ... }
}`}</pre>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/grade-levels</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Niveaux/sections par école</li>
          <li><b>GET</b>: Liste des niveaux</li>
          <li><b>POST</b> (ADMIN): Créer un niveau {`{ name, code? }`}</li>
          <li><b>GET /[id]</b>: Détail d'un niveau</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier un niveau</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer un niveau</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/grade-levels
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/classrooms</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Classes par niveau</li>
          <li><b>GET</b>: Liste des classes</li>
          <li><b>POST</b> (ADMIN): Créer {`{ name, gradeLevelId, capacity? }`}</li>
          <li><b>GET /[id]</b>: Détail d'une classe</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier une classe</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer une classe</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/classrooms
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "name": "6ème A",
  "gradeLevelId": "...",
  "capacity": 40
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/subjects</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Matières par école</li>
          <li><b>GET</b>: Liste des matières</li>
          <li><b>POST</b> (ADMIN): Créer {`{ name, code? }`}</li>
          <li><b>GET /[id]</b>: Détail d'une matière</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier une matière</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer une matière</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/classroom-subjects</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Coefficient de matière par classe</li>
          <li><b>GET</b>: Coefficients par classe (param classroomId)</li>
          <li><b>POST</b> (ADMIN): Upsert {`{ classroomId, subjectId, coefficient }`}</li>
          <li><b>DELETE</b> (ADMIN): Supprimer un coefficient (param classroomId & subjectId)</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/classroom-subjects?classroomId=<id>
Authorization: Bearer <token>
x-school-id: <schoolId>

DELETE /api/classroom-subjects?classroomId=<id>&subjectId=<id>
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/subject-categories</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des catégories de matières par école</li>
          <li><b>GET</b>: Liste des catégories de matières</li>
          <li><b>POST</b> (ADMIN): Créer une catégorie {`{ name, description? }`}</li>
          <li><b>GET /[id]</b>: Détail d'une catégorie</li>
          <li><b>PATCH /[id]</b> (ADMIN): Modifier une catégorie</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer une catégorie</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/subject-categories
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "name": "Sciences",
  "description": "Matières scientifiques"
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/payments/[id]</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Détail d'un paiement spécifique</li>
          <li><b>GET</b>: Récupérer les détails complets d'un paiement</li>
          <li><b>PUT</b> (ADMIN): Modifier un paiement existant</li>
          <li><b>DELETE</b> (ADMIN): Supprimer un paiement</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/payments/cm123...
Authorization: Bearer <token>
x-school-id: <schoolId>

Réponse:
{
  "payment": {
    "id": "...",
    "amountCents": 10000000,
    "method": "CASH",
    "paidAt": "2024-12-15T10:30:00Z",
    "student": { "name": "Jean Dupont", ... },
    "feeSchedule": { "itemName": "Frais T1", ... }
  }
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/schools/active</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion de l'école actuellement active</li>
          <li><b>GET</b> (ADMIN/TEACHER): Détail de l'école active</li>
          <li><b>PATCH</b> (ADMIN): Modifier l'école active</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/schools/active
Authorization: Bearer <token>
x-school-id: <schoolId>

PATCH /api/schools/active
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "name": "Nouveau nom",
  "address": "Nouvelle adresse"
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/attendance-records/analytics</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Statistiques de présence par classe/matière</li>
          <li><b>GET</b>: Analytics avec filtres (classroomId, subjectId, from, to)</li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/attendance-records/analytics?classroomId=...&from=2024-01-01&to=2024-12-31
Authorization: Bearer <token>
x-school-id: <schoolId>

Réponse:
{
  "analytics": {
    "totalSessions": 150,
    "averageAttendanceRate": 85.5,
    "studentStats": [...],
    "dailyTrends": [...],
    "subjectBreakdown": [...]
  }
}`}</pre>
      </section>
        <section>
          <h2 className="text-xl font-medium">📱 Endpoints Application Mobile</h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-medium mb-2">🔴 Consultation de présence en temps réel</p>
            <p className="text-sm text-gray-700 mb-3">Ces endpoints sont spécialement conçus pour l'application mobile afin de permettre aux parents de consulter la présence de leurs enfants en temps réel.</p>
            
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/attendance/realtime</p>
              <p className="text-sm mb-2"><b>Objectif :</b> Permettre aux parents de voir en temps réel si leur enfant est présent en cours</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm mb-2">🕐 Logique de fonctionnement :</p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    <li>Détection automatique du cours en cours selon l'heure actuelle</li>
                    <li>Comparaison avec l'emploi du temps de l'enfant</li>
                    <li>Vérification si le professeur a pris la présence</li>
                    <li>Retour du statut ou "non disponible"</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">📋 Cas d'usage :</p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    <li><b>8h10 :</b> Parent consulte → Cours de 8h-9h → Statut de présence</li>
                    <li><b>12h :</b> Parent consulte → Cours de 12h-13h → Statut de présence</li>
                    <li><b>Pas de cours :</b> Message "Aucun cours en cours actuellement"</li>
                    <li><b>Présence non prise :</b> Message "Présence non encore prise"</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-medium text-sm mb-2">📝 Exemple de requête :</p>
                <pre className="bg-gray-100 p-2 rounded text-xs">{`GET /api/parent/children/cm123.../attendance/realtime
Authorization: Bearer <token>
x-school-id: <schoolId>

Réponse si cours en cours et présence prise :
{
  "student": { "name": "Jean Dupont", "classroom": {...} },
  "currentSession": {
    "subject": "Mathématiques",
    "teacher": "Prof. Dupont",
    "startTime": "08:00",
    "endTime": "09:00"
  },
  "attendance": {
    "status": "PRESENT",
    "statusText": "Présent",
    "recordedAt": "2024-01-15T08:15:00Z"
  },
  "message": "Présent en cours",
  "timestamp": "2024-01-15T08:30:00Z"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium">Endpoints Parents</h2>
          <div className="text-sm space-y-4">
            <p className="text-gray-600">Tous ces endpoints requièrent une authentification avec un compte parent et les headers Authorization + x-school-id.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children</p>
              <p><b>Description :</b> Récupère la liste des enfants du parent connecté avec leurs informations scolaires</p>
              <p><b>Authentification :</b> Requise (rôle PARENT)</p>
              <p><b>Cas d'usage :</b> Application mobile pour afficher la liste des enfants</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "children": [{
    "id": "string",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "matricule": "2024001",
    "classroom": {
      "name": "6ème A",
      "gradeLevel": "Sixième"
    }
  }]
}`}</pre>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/payments</p>
              <p><b>Description :</b> Récupère la situation financière complète d'un enfant</p>
              <p><b>Authentification :</b> Requise (parent de cet enfant)</p>
              <p><b>Headers optionnels :</b> x-academic-year-id pour une année spécifique</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "student": { "id": "string", "user": {...} },
  "paymentSummary": {
    "totalDue": 500000,
    "totalPaid": 200000,
    "remainingBalance": 300000,
    "feeSchedules": [{
      "id": "string",
      "itemName": "Frais de scolarité",
      "amountCents": 500000,
      "status": "partial",
      "totalPaid": 200000,
      "remainingAmount": 300000,
      "payments": [...],
      "installments": [...]
    }]
  }
}`}</pre>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/timetable</p>
              <p><b>Description :</b> Récupère l'emploi du temps d'un enfant</p>
              <p><b>Authentification :</b> Requise (parent de cet enfant)</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "student": { "id": "string", "user": {...} },
  "classroom": { "name": "string", "gradeLevel": {...} },
  "timetable": {
    "MONDAY": [
      {
        "id": "string",
        "subject": { "name": "Mathématiques" },
        "teacher": { "user": { "name": "Prof. Dupont" } },
        "startTime": "2024-01-01T08:00:00Z",
        "endTime": "2024-01-01T09:00:00Z"
      }
    ],
    "TUESDAY": [...],
    ...
  },
  "timetableEntries": [...]
}`}</pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/grades</p>
              <p><b>Description :</b> Récupère les notes et moyennes d'un enfant</p>
              <p><b>Authentification :</b> Requise (parent de cet enfant)</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "student": { "id": "string", "user": {...} },
  "grades": [{
    "id": "string",
    "score": 15.5,
    "assessment": {
      "title": "Devoir de mathématiques",
      "subject": { "name": "Mathématiques" },
      "term": { "name": "1er Trimestre" }
    }
  }],
  "subjectAverages": [{
    "subject": "Mathématiques",
    "average": 14.2,
    "gradeCount": 5
  }],
  "termAverages": [{
    "termName": "1er Trimestre",
    "average": 13.8,
    "gradeCount": 15,
    "subjectCount": 3
  }],
  "overallAverage": 14.1,
  "totalGrades": 20
}`}</pre>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/attendance</p>
              <p><b>Description :</b> Récupère l'assiduité d'un enfant</p>
              <p><b>Authentification :</b> Requise (parent de cet enfant)</p>
              <p><b>Paramètres optionnels :</b> ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD ou ?month=YYYY-MM</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "student": { "id": "string", "user": {...} },
  "attendanceRecords": [{
    "id": "string",
    "status": "PRESENT|ABSENT|LATE|EXCUSED",
    "date": "2024-01-15T00:00:00Z",
    "timetableEntry": {
      "subject": { "name": "Mathématiques" },
      "teacher": { "user": { "name": "Prof. Dupont" } }
    }
  }],
  "statistics": {
    "totalRecords": 20,
    "presentCount": 18,
    "absentCount": 1,
    "lateCount": 1,
    "excusedCount": 0,
    "attendanceRate": 90.0
  },
  "recordsByDate": {
    "2024-01-15": [...],
    "2024-01-16": [...]
  },
  "subjectStats": {
    "Mathématiques": {
      "total": 5,
      "present": 5,
      "absent": 0
    }
  }
}`}</pre>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/parent/children/[studentId]/attendance/realtime</p>
              <p><b>Description :</b> Consultation de présence en temps réel selon l'heure actuelle</p>
              <p><b>Authentification :</b> Requise (rôle PARENT)</p>
              <p><b>Fonctionnalités :</b></p>
              <ul className="list-disc pl-4 text-xs">
                <li>Détection automatique du cours en cours selon l'heure actuelle</li>
                <li>Vérification si le professeur a pris la présence</li>
                <li>Retour du statut de présence ou "non disponible"</li>
                <li>Informations complètes sur le cours (matière, professeur, horaires)</li>
              </ul>
              <p><b>Cas d'usage :</b> Application mobile pour consultation instantanée</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "student": {
    "id": "string",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "classroom": {
      "name": "6ème A",
      "gradeLevel": "Sixième"
    }
  },
  "currentSession": {
    "subject": "Mathématiques",
    "teacher": "Prof. Dupont",
    "startTime": "08:00",
    "endTime": "09:00",
    "classroom": "6ème A",
    "dayOfWeek": 1,
    "date": "2024-01-15"
  },
  "attendance": {
    "status": "PRESENT",
    "statusText": "Présent",
    "recordedAt": "2024-01-15T08:15:00Z",
    "recordedBy": "Prof. Dupont",
    "comments": "À l'heure"
  },
  "message": "Présent en cours",
  "timestamp": "2024-01-15T08:30:00Z"
}`}</pre>
              <p><b>États possibles :</b></p>
              <ul className="list-disc pl-4 text-xs">
                <li><b>Aucun cours :</b> currentSession: null, message: "Aucun cours en cours actuellement"</li>
                <li><b>Présence non prise :</b> attendance: null, message: "Présence non encore prise par le professeur"</li>
                <li><b>Présence prise :</b> attendance: {"{...}"}, message: "Présent en cours" / "Absent du cours" / etc.</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-medium mb-2">Actions côté client disponibles</p>
              <p><b>Fichier :</b> actions/parent-dashboard.ts</p>
              <p><b>Fonctions disponibles :</b></p>
              <ul className="list-disc pl-4 mt-2">
                <li><code>getParentChildren()</code> - Liste des enfants</li>
                <li><code>getChildPayments(studentId)</code> - Situation financière</li>
                <li><code>getChildTimetable(studentId)</code> - Emploi du temps</li>
                <li><code>getChildGrades(studentId)</code> - Notes et moyennes</li>
                <li><code>getChildAttendance(studentId, options?)</code> - Assiduité</li>
                <li><code>getChildSummary(studentId)</code> - Résumé complet (toutes les infos)</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">Ces actions utilisent automatiquement makeAuthenticatedRequest avec les bons headers.</p>
              
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium">Endpoints Enseignants</h2>
          <div className="text-sm space-y-4">
            <p className="text-gray-600">Tous ces endpoints requièrent une authentification avec un compte enseignant et les headers Authorization + x-school-id.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/teacher/classes</p>
              <p><b>Description :</b> Récupère toutes les classes où l'enseignant a des cours avec les élèves et matières</p>
              <p><b>Authentification :</b> Requise (rôle TEACHER)</p>
              <p><b>Headers optionnels :</b> x-academic-year-id pour une année spécifique</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "teacher": {
    "id": "string",
    "user": { "name": "string", "email": "string" }
  },
  "classes": [{
    "classroom": {
      "id": "string",
      "name": "6ème A",
      "gradeLevel": { "name": "6ème" }
    },
    "students": [{
      "id": "string",
      "user": { "name": "string" },
      "matricule": "2024001",
      "gender": "MALE",
      "enrollment": {
        "id": "string",
        "academicYear": { "name": "2024-2025" }
      }
    }],
    "subjects": ["Mathématiques", "Français"],
    "timetableEntries": [{
      "id": "string",
      "subject": { "name": "Mathématiques" },
      "dayOfWeek": "MONDAY",
      "startTime": "2024-01-01T08:00:00Z",
      "endTime": "2024-01-01T09:00:00Z"
    }],
    "studentCount": 25
  }],
  "totalClasses": 3,
  "totalStudents": 75
}`}</pre>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/teacher/classes/[classroomId]/students</p>
              <p><b>Description :</b> Récupère les élèves d'une classe spécifique avec leurs statistiques d'assiduité</p>
              <p><b>Authentification :</b> Requise (enseignant ayant accès à cette classe)</p>
              <p><b>Headers optionnels :</b> x-academic-year-id pour une année spécifique</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "classroom": {
    "id": "string",
    "name": "6ème A",
    "gradeLevel": { "name": "6ème" }
  },
  "students": [{
    "id": "string",
    "user": { "name": "string" },
    "matricule": "2024001",
    "gender": "MALE",
    "dateOfBirth": "2010-05-15",
    "enrollment": {
      "id": "string",
      "academicYear": { "name": "2024-2025" }
    },
    "attendanceStats": {
      "totalRecords": 20,
      "presentCount": 18,
      "attendanceRate": 90.0
    }
  }],
  "totalStudents": 25
}`}</pre>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/teacher/timetable</p>
              <p><b>Description :</b> Récupère l'emploi du temps de l'enseignant organisé par jour</p>
              <p><b>Authentification :</b> Requise (rôle TEACHER)</p>
              <p><b>Headers optionnels :</b> x-academic-year-id pour une année spécifique</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "teacher": {
    "id": "string",
    "user": { "name": "string" }
  },
  "timetable": {
    "MONDAY": [{
      "id": "string",
      "subject": { "name": "Mathématiques" },
      "classroom": {
        "name": "6ème A",
        "gradeLevel": { "name": "6ème" }
      },
      "startTime": "2024-01-01T08:00:00Z",
      "endTime": "2024-01-01T09:00:00Z",
      "academicYear": { "name": "2024-2025" }
    }],
    "TUESDAY": [...],
    "WEDNESDAY": [...],
    "THURSDAY": [...],
    "FRIDAY": [...],
    "SATURDAY": [...],
    "SUNDAY": [...]
  },
  "timetableEntries": [...],
  "statistics": {
    "totalClasses": 15,
    "totalHoursPerWeek": 25.5,
    "subjectCount": 3,
    "classroomCount": 5,
    "subjectBreakdown": {
      "Mathématiques": 8,
      "Français": 4,
      "Sciences": 3
    },
    "classBreakdown": {
      "6ème A": 5,
      "6ème B": 4,
      "5ème A": 6
    }
  }
}`}</pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/teacher/assessments</p>
              <p><b>Description :</b> Récupère les évaluations créées par l'enseignant avec statistiques</p>
              <p><b>Authentification :</b> Requise (rôle TEACHER)</p>
              <p><b>Paramètres optionnels :</b> ?classroomId=...&subjectId=...&termId=...</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "teacher": {
    "id": "string",
    "user": { "name": "string" }
  },
  "assessments": [{
    "id": "string",
    "title": "Devoir de mathématiques",
    "description": "Exercices sur les fractions",
    "type": "HOMEWORK",
    "coefficient": 2,
    "assignedAt": "2024-01-15T00:00:00Z",
    "dueAt": "2024-01-20T00:00:00Z",
    "isBlocked": false,
    "subject": { "name": "Mathématiques" },
    "classroom": {
      "name": "6ème A",
      "gradeLevel": { "name": "6ème" }
    },
    "term": { "name": "1er Trimestre" },
    "statistics": {
      "totalGrades": 25,
      "averageScore": 14.2,
      "maxScore": 18,
      "minScore": 8,
      "gradedStudents": 25,
      "pendingGrades": 0
    },
    "grades": [{
      "id": "string",
      "score": 15.5,
      "student": {
        "id": "string",
        "user": { "name": "Jean Dupont" },
        "matricule": "2024001"
      }
    }]
  }],
  "statistics": {
    "totalAssessments": 10,
    "totalGrades": 250,
    "subjectBreakdown": {
      "Mathématiques": 6,
      "Français": 4
    },
    "averageGradesPerAssessment": 25.0
  }
}`}</pre>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium mb-2">GET /api/teacher/attendance</p>
              <p><b>Description :</b> Récupère les enregistrements d'assiduité pour un cours/date</p>
              <p><b>Authentification :</b> Requise (enseignant ayant accès à cette classe)</p>
              <p><b>Paramètres requis :</b> ?date=YYYY-MM-DD&classroomId=...</p>
              <p><b>Paramètres optionnels :</b> ?timetableEntryId=...</p>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "date": "2024-01-15T00:00:00Z",
  "classroomId": "string",
  "timetableEntryId": "string",
  "students": [{
    "id": "string",
    "user": { "name": "string" },
    "matricule": "2024001",
    "gender": "MALE"
  }],
  "attendanceRecords": [{
    "id": "string",
    "status": "PRESENT|ABSENT|LATE|EXCUSED",
    "notes": "À l'heure",
    "date": "2024-01-15T00:00:00Z",
    "student": {
      "id": "string",
      "user": { "name": "Jean Dupont" }
    },
    "timetableEntry": {
      "subject": { "name": "Mathématiques" }
    }
  }],
  "totalStudents": 25,
  "recordedCount": 20
}`}</pre>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="font-medium mb-2">POST /api/teacher/attendance</p>
              <p><b>Description :</b> Enregistre l'assiduité des élèves pour un cours/date</p>
              <p><b>Authentification :</b> Requise (enseignant ayant accès à cette classe)</p>
              <p><b>Body :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "classroomId": "string",
  "date": "2024-01-15",
  "timetableEntryId": "string", // Optionnel
  "attendanceData": [
    {
      "studentId": "string",
      "status": "PRESENT|ABSENT|LATE|EXCUSED",
      "notes": "À l'heure" // Optionnel
    },
    {
      "studentId": "string",
      "status": "ABSENT",
      "notes": "Maladie"
    }
  ]
}`}</pre>
              <p><b>Réponse :</b></p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">{`{
  "success": true,
  "recordsCreated": 25,
  "records": [{
    "id": "string",
    "studentId": "string",
    "status": "PRESENT",
    "notes": "À l'heure",
    "date": "2024-01-15T00:00:00Z",
    "student": {
      "id": "string",
      "user": { "name": "Jean Dupont" }
    }
  }]
}`}</pre>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-medium mb-2">Actions côté client disponibles</p>
              <p><b>Fichier :</b> actions/teacher-dashboard.ts</p>
              <p><b>Fonctions disponibles :</b></p>
              <ul className="list-disc pl-4 mt-2">
                <li><code>getTeacherClasses()</code> - Liste des classes de l'enseignant</li>
                <li><code>getClassStudents(classroomId)</code> - Élèves d'une classe</li>
                <li><code>getTeacherTimetable()</code> - Emploi du temps</li>
                <li><code>getTeacherAssessments(filters?)</code> - Évaluations créées</li>
                <li><code>getAttendanceRecords(params)</code> - Enregistrements d'assiduité</li>
                <li><code>createAttendanceRecords(data)</code> - Enregistrer l'assiduité</li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">Ces actions utilisent automatiquement makeAuthenticatedRequest avec les bons headers.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-medium">Endpoints École Active</h2>
        <ul className="list-disc pl-6">
          <li>
            <b>/api/schools/active/students</b>: Gestion des élèves de l'école active
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN/TEACHER): Liste des élèves</li>
              <li><b>POST</b> (ADMIN): Créer un élève avec compte utilisateur</li>
            </ul>
          </li>
          <li>
            <b>/api/schools/active/teachers</b>: Gestion des enseignants de l'école active
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN): Liste des enseignants</li>
              <li><b>POST</b> (ADMIN): Créer un enseignant avec compte utilisateur</li>
            </ul>
          </li>
          <li>
            <b>/api/schools/active/parents</b>: Gestion des parents de l'école active
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN/TEACHER): Liste des parents</li>
              <li><b>POST</b> (ADMIN): Créer un parent avec compte utilisateur</li>
            </ul>
          </li>
          <li>
            <b>/api/schools/active/students/[id]</b>: Gestion individuelle des élèves
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN/TEACHER): Détail d'un élève</li>
              <li><b>PATCH</b> (ADMIN): Modifier un élève</li>
              <li><b>DELETE</b> (ADMIN): Supprimer un élève</li>
            </ul>
          </li>
          <li>
            <b>/api/schools/active/teachers/[id]</b>: Gestion individuelle des enseignants
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN): Détail d'un enseignant</li>
              <li><b>PATCH</b> (ADMIN): Modifier un enseignant</li>
              <li><b>DELETE</b> (ADMIN): Supprimer un enseignant</li>
            </ul>
          </li>
          <li>
            <b>/api/schools/active/parents/[id]</b>: Gestion individuelle des parents
            <ul className="list-disc pl-6">
              <li><b>GET</b> (ADMIN/TEACHER): Détail d'un parent</li>
              <li><b>PATCH</b> (ADMIN): Modifier un parent</li>
              <li><b>DELETE</b> (ADMIN): Supprimer un parent</li>
            </ul>
          </li>
        </ul>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/schools/active/students
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "user": {
    "email": "student@example.com",
    "phone": "+22712345678",  // Optionnel
    "name": "Jean Dupont",
    "password": "motdepasse123"
  },
  "profile": {
    "matricule": "2024001",
    "gender": "MALE",
    "dateOfBirth": "2010-05-15",
    "placeOfBirth": "Dakar"
  }
}`}</pre>
      </section>
      <section>
        <h2 className="text-xl font-medium">Endpoints avec CRUD complet</h2>
        <ul className="list-disc pl-6">
          <li>
            <b>/api/teacher-assignments</b>: Affectations enseignant↔matière↔classe
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des affectations (param classroomId optionnel)</li>
              <li><b>POST</b> (ADMIN): Créer une affectation</li>
              <li><b>GET /[id]</b>: Détail d'une affectation</li>
              <li><b>PATCH /[id]</b> (ADMIN): Modifier une affectation</li>
              <li><b>DELETE /[id]</b> (ADMIN): Supprimer une affectation</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/teacher-assignments
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "teacherId": "...",
  "subjectId": "...",
  "classroomId": "...",
  "academicYearId": "..."
}`}</pre>
          </li>
          <li>
            <b>/api/enrollments</b>: Inscriptions élèves
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des inscriptions (param classroomId/studentId optionnels)</li>
              <li><b>POST</b> (ADMIN): Créer une inscription (avec abonnement mobile optionnel)</li>
              <li><b>GET /[id]</b>: Détail d'une inscription</li>
              <li><b>PATCH /[id]</b> (ADMIN): Modifier une inscription (ex: isMobileSubscribed)</li>
              <li><b>DELETE /[id]</b> (ADMIN): Supprimer une inscription</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/enrollments
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "studentId": "...",
  "classroomId": "...",
  "academicYearId": "...",
  "isMobileSubscribed": true // optionnel, défaut false
}`}</pre>
          </li>
          <li>
            <div className="font-mono text-sm">Exemple réponse GET</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/enrollments?classroomId=...
Authorization: Bearer <token>
x-school-id: <schoolId>

{
  "enrollments": [
    {
      "id": "...",
      "status": "ACTIVE",
      "isMobileSubscribed": false,
      "student": { "id": "...", "user": { "name": "..." } },
      "classroom": { "id": "...", "name": "6ème A" },
      "academicYear": { "id": "...", "name": "2024-2025" }
    }
  ]
}`}</pre>
          </li>
          <li>
            <b>/api/timetable-entries</b>: Emploi du temps
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des créneaux (param classroomId/day optionnels)</li>
              <li><b>POST</b> (ADMIN): Créer un créneau</li>
              <li><b>GET /[id]</b>: Détail d'un créneau</li>
              <li><b>PATCH /[id]</b> (ADMIN): Modifier un créneau</li>
              <li><b>DELETE /[id]</b> (ADMIN): Supprimer un créneau</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/timetable-entries
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "classroomId": "...",
  "subjectId": "...",
  "teacherId": "...",
  "dayOfWeek": "MONDAY",
  "startTime": "2025-09-02T08:00:00Z",
  "endTime": "2025-09-02T10:00:00Z"
}`}</pre>
          </li>
          <li>
            <b>/api/attendance-records</b>: Présences
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des présences (param studentId/from/to optionnels)</li>
              <li><b>POST</b> (ADMIN/TEACHER): Enregistrer une présence</li>
              <li><b>GET /[id]</b>: Détail d'un enregistrement</li>
              <li><b>PATCH /[id]</b> (ADMIN/TEACHER): Modifier un enregistrement</li>
              <li><b>DELETE /[id]</b> (ADMIN/TEACHER): Supprimer un enregistrement</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/attendance-records
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "studentId": "...",
  "date": "2025-09-02",
  "status": "PRESENT",
  "timetableEntryId": "...",
  "notes": "À l'heure"
}`}</pre>
          </li>
          <li>
            <b>/api/assessments</b>: Devoirs/évaluations
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des évaluations (param classroomId/termId optionnels)</li>
              <li><b>POST</b> (ADMIN/TEACHER): Créer une évaluation</li>
              <li><b>GET /[id]</b>: Détail d'une évaluation</li>
              <li><b>PATCH /[id]</b> (ADMIN/TEACHER): Modifier une évaluation</li>
              <li><b>DELETE /[id]</b> (ADMIN/TEACHER): Supprimer une évaluation</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/assessments
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "subjectId": "...",
  "classroomId": "...",
  "termId": "...",
  "title": "Devoir maison #1",
  "type": "HOMEWORK",
  "coefficient": 2
}`}</pre>
          </li>
          <li>
            <b>/api/student-grades</b>: Notes
            <ul className="list-disc pl-6">
              <li><b>GET</b>: Liste des notes (param studentId/termId optionnels)</li>
              <li><b>POST</b> (ADMIN/TEACHER): Enregistrer une note</li>
              <li><b>GET /[id]</b>: Détail d'une note</li>
              <li><b>PATCH /[id]</b> (ADMIN/TEACHER): Modifier une note</li>
              <li><b>DELETE /[id]</b> (ADMIN/TEACHER): Supprimer une note</li>
            </ul>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/student-grades
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "assessmentId": "...",
  "studentId": "...",
  "score": 15
}`}</pre>
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/fee-schedules</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des frais scolaires par niveau/classe</li>
          <li><b>GET</b>: Liste des frais scolaires (param gradeLevelId/classroomId optionnels)</li>
          <li><b>POST</b> (ADMIN): Créer des frais scolaires avec tranches optionnelles</li>
          <li><b>PUT /[id]</b> (ADMIN): Modifier des frais scolaires et leurs tranches</li>
          <li><b>DELETE /[id]</b> (ADMIN): Supprimer des frais scolaires</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Créer des frais avec tranches</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/fee-schedules
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "gradeLevelId": "...",
  "itemName": "Frais de scolarité T1",
  "amountCents": 20000000,
  "dueDate": "2024-12-31",
  "installments": [
    {
      "name": "1ère tranche",
      "amountCents": 10000000,
      "dueDate": "2024-10-15"
    },
    {
      "name": "2ème tranche", 
      "amountCents": 10000000,
      "dueDate": "2024-12-15"
    }
  ]
}`}</pre>
          </div>
          <div>
            <div className="font-mono text-sm">Réponse 201</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
{
  "feeSchedule": {
    "id": "...",
    "itemName": "Frais de scolarité T1",
    "amountCents": 20000000,
    "gradeLevel": { "id": "...", "name": "6ème" },
    "installments": [...]
  }
}`}</pre>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/payments</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Gestion des paiements des élèves</li>
          <li><b>GET</b>: Liste des paiements avec filtres (studentId, method, dateFrom, dateTo, etc.)</li>
          <li><b>POST</b> (ADMIN/TEACHER/PARENT): Enregistrer un paiement</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Enregistrer un paiement</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
POST /api/payments
Authorization: Bearer <token>
x-school-id: <schoolId>
Content-Type: application/json

{
  "studentId": "...",
  "feeScheduleId": "...",
  "amountCents": 10000000,
  "method": "CASH",
  "notes": "Paiement 1ère tranche"
}`}</pre>
          </div>
          <div>
            <div className="font-mono text-sm">Filtrer les paiements</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/payments?studentId=...&method=CASH&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
          </div>
        </div>
        <p className="text-sm mt-2"><b>Méthodes de paiement</b>: CASH, BANK_TRANSFER, MOBILE_MONEY, CHECK, CARD</p>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/payments/analytics</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Statistiques des paiements par école</li>
          <li><b>GET</b>: Analytics complètes avec filtres optionnels</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Obtenir les analytics</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/payments/analytics?gradeLevelId=...&dateFrom=2024-01-01
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
          </div>
          <div>
            <div className="font-mono text-sm">Réponse 200</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
{
  "analytics": {
    "totalExpected": 50000000,
    "totalCollected": 30000000,
    "collectionRate": 60.0,
    "pendingAmount": 20000000,
    "overdueAmount": 5000000,
    "statusCounts": {
      "PAID": 15,
      "PARTIALLY_PAID": 8,
      "PENDING": 12,
      "OVERDUE": 3
    },
    "paymentMethods": {
      "CASH": { "count": 25, "amount": 20000000 },
      "BANK_TRANSFER": { "count": 10, "amount": 10000000 }
    },
    "monthlyTrends": [...]
  }
}`}</pre>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/students/[id]</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Détails complets d'un élève avec toutes ses informations</li>
          <li><b>GET</b>: Profil, inscriptions, paiements, notes, assiduité, emploi du temps, parents</li>
          <li><b>Authentification</b>: ADMIN, TEACHER (avec accès à la classe), PARENT (de cet élève)</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Obtenir tous les détails d'un élève</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/students/cmf9lqfc90002rgfd7lxbv22f
Authorization: Bearer <token>
x-school-id: <schoolId>
x-academic-year-id: <academicYearId> // Optionnel

Réponse:
{
  "student": {
    "id": "string",
    "user": { "name": "string", "email": "string" },
    "matricule": "2024001",
    "gender": "MALE",
    "dateOfBirth": "2010-05-15",
    "placeOfBirth": "Dakar",
    "address": "123 Rue Example",
    "phone": "+22712345678",
    "emergencyContact": "Papa Dupont",
    "emergencyPhone": "+22787654321",
    "medicalInfo": "Aucun problème médical",
    "allergies": "Aucune allergie connue"
  },
  "currentEnrollment": {
    "id": "string",
    "classroom": {
      "name": "6ème A",
      "gradeLevel": { "name": "6ème" }
    },
    "academicYear": { "name": "2024-2025" },
    "status": "ACTIVE"
  },
  "allEnrollments": [...],
  "timetable": {
    "classroom": { "name": "6ème A", "gradeLevel": {...} },
    "timetable": {
      "MONDAY": [
        {
          "id": "string",
          "subject": { "name": "Mathématiques" },
          "teacher": { "user": { "name": "Prof. Dupont" } },
          "startTime": "2024-01-01T08:00:00Z",
          "endTime": "2024-01-01T09:00:00Z"
        }
      ],
      "TUESDAY": [...],
      ...
    },
    "timetableEntries": [...]
  },
  "parents": [
    {
      "id": "string",
      "user": { "name": "Papa Dupont", "email": "papa@example.com" },
      "relationship": "FATHER"
    }
  ],
  "paymentSummary": {
    "totalDue": 20000000,
    "totalPaid": 10000000,
    "balance": 10000000,
    "feeScheduleCount": 3,
    "recentPayments": [...]
  },
  "attendanceSummary": {
    "totalRecords": 50,
    "presentCount": 45,
    "absentCount": 3,
    "lateCount": 2,
    "excusedCount": 0,
    "attendanceRate": 90.0,
    "recentRecords": [...],
    "recordsBySubject": {
      "Mathématiques": {
        "total": 15,
        "present": 14,
        "absent": 1,
        "late": 0,
        "excused": 0
      }
    }
  },
  "academicSummary": {
    "totalGrades": 25,
    "averageScore": 14.2,
    "maxScore": 18,
    "minScore": 8,
    "overallAverage": 14.2,
    "subjectAverages": [
      {
        "subject": "Mathématiques",
        "average": 15.5,
        "gradeCount": 8
      }
    ],
    "termAverages": [
      {
        "termName": "1er Trimestre",
        "average": 14.2,
        "gradeCount": 25,
        "subjectCount": 5
      }
    ],
    "recentGrades": [...],
    "gradesBySubject": {...},
    "gradesByTerm": {...}
  },
  "statistics": {
    "totalEnrollments": 2,
    "totalPayments": 5,
    "totalGrades": 25,
    "totalAttendanceRecords": 50,
    "parentsCount": 2
  }
}`}</pre>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">/api/students/[id]/payments</h2>
        <ul className="list-disc pl-6">
          <li><b>Objectif</b>: Détail des paiements d'un élève spécifique</li>
          <li><b>GET</b>: Résumé complet avec frais applicables, paiements, et statuts</li>
        </ul>
        <div className="mt-2 grid gap-2">
          <div>
            <div className="font-mono text-sm">Obtenir les paiements d'un élève</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
GET /api/students/cmf9lqfc90002rgfd7lxbv22f/payments
Authorization: Bearer <token>
x-school-id: <schoolId>`}</pre>
          </div>
          <div>
            <div className="font-mono text-sm">Réponse 200</div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{`
{
  "student": {
    "id": "...",
    "name": "Jean Dupont",
    "matricule": "2024001",
    "currentEnrollment": {
      "classroom": {
        "name": "6ème A",
        "gradeLevel": { "name": "6ème" }
      }
    }
  },
  "summary": {
    "totalDue": 20000000,
    "totalPaid": 10000000,
    "balance": 10000000,
    "feeScheduleCount": 2,
    "paidFeeScheduleCount": 1,
    "overdueCount": 0
  },
  "feeSchedulesByStatus": {
    "paid": [...],
    "partiallyPaid": [...],
    "pending": [...],
    "overdue": [...]
  },
  "recentPayments": [...],
  "upcomingPayments": [...]
}`}</pre>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">Logique des frais et tranches</h2>
        <div className="text-sm space-y-2">
          <p><b>Frais principaux vs Tranches :</b></p>
          <ul className="list-disc pl-6">
            <li><b>Frais principal</b>: isInstallment = false, parentFeeId = null</li>
            <li><b>Tranche</b>: isInstallment = true, parentFeeId = ID du frais principal</li>
            <li>Les tranches ont un installmentOrder (1, 2, 3...)</li>
          </ul>
          <p><b>Options de paiement :</b></p>
          <ul className="list-disc pl-6">
            <li>Paiement <b>complet</b>: directement sur le frais principal</li>
            <li>Paiement <b>par tranches</b>: sur chaque tranche individuellement</li>
            <li>Les deux options sont disponibles simultanément</li>
          </ul>
          <p><b>Calcul des statuts :</b></p>
          <ul className="list-disc pl-6">
            <li><b>PAID</b>: Montant payé supérieur ou égal au montant dû</li>
            <li><b>PARTIALLY_PAID</b>: Montant payé entre 0 et le montant dû</li>
            <li><b>PENDING</b>: Aucun paiement, échéance future</li>
            <li><b>OVERDUE</b>: Aucun paiement, échéance dépassée</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">Schémas de validation</h2>
        <p className="text-sm">Tous les endpoints utilisent Zod pour la validation des données avec des schémas de mise à jour partielle (PATCH) :</p>
        <ul className="list-disc pl-6 text-sm">
          <li><b>AcademicYearUpdateSchema</b>: Mise à jour partielle des années scolaires</li>
          <li><b>TermUpdateSchema</b>: Mise à jour partielle des périodes</li>
          <li><b>GradeLevelUpdateSchema</b>: Mise à jour partielle des niveaux</li>
          <li><b>ClassroomUpdateSchema</b>: Mise à jour partielle des classes</li>
          <li><b>SubjectUpdateSchema</b>: Mise à jour partielle des matières</li>
          <li><b>TeacherAssignmentUpdateSchema</b>: Mise à jour partielle des affectations</li>
          <li><b>EnrollmentUpdateSchema</b>: Mise à jour partielle des inscriptions</li>
          <li><b>TimetableEntryUpdateSchema</b>: Mise à jour partielle de l'emploi du temps</li>
          <li><b>AttendanceRecordUpdateSchema</b>: Mise à jour partielle des présences</li>
          <li><b>AssessmentUpdateSchema</b>: Mise à jour partielle des évaluations</li>
          <li><b>StudentGradeUpdateSchema</b>: Mise à jour partielle des notes</li>
          <li><b>FeeScheduleCreateSchema</b>: Création des frais scolaires avec tranches</li>
          <li><b>FeeScheduleUpdateSchema</b>: Mise à jour partielle des frais scolaires</li>
          <li><b>PaymentCreateSchema</b>: Création des paiements</li>
          <li><b>PaymentFiltersSchema</b>: Filtres pour la liste des paiements</li>
          <li><b>PaymentAnalyticsFiltersSchema</b>: Filtres pour les analytics</li>
          <li><b>SubjectCategoryCreateSchema</b>: Création des catégories de matières</li>
          <li><b>SubjectCategoryUpdateSchema</b>: Mise à jour des catégories de matières</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-medium text-orange-600">⚠️ Changements récents</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Refactoring du système de paiements (Décembre 2024) :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><b>❌ SUPPRIMÉ</b>: Model Invoice et endpoints associés</li>
            <li><b>✅ NOUVEAU</b>: Les paiements sont directement liés aux FeeSchedule</li>
            <li><b>✅ NOUVEAU</b>: Support des tranches de paiement (installments)</li>
            <li><b>✅ NOUVEAU</b>: Analytics en temps réel basées sur les paiements</li>
            <li><b>✅ NOUVEAU</b>: Statuts de paiement calculés dynamiquement</li>
            <li><b>✅ NOUVEAU</b>: Endpoints /api/payments/[id] pour gestion individuelle</li>
            <li><b>✅ NOUVEAU</b>: Endpoints /api/subject-categories pour catégories de matières</li>
              <li><b>✅ NOUVEAU</b>: Endpoints /api/schools/active/* pour gestion école active</li>
              <li><b>✅ NOUVEAU</b>: Analytics de présence /api/attendance-records/analytics</li>
              <li><b>✅ NOUVEAU</b>: Endpoints /api/parents/* pour espace parent</li>
              <li><b>✅ NOUVEAU</b>: Dashboard parent avec vue d'ensemble des enfants</li>
              <li><b>✅ NOUVEAU</b>: Contrôle d'accès parent aux données de ses enfants uniquement</li>
              <li><b>🔄 MODIFIÉ</b>: Terminologie "structure de frais" → "frais scolaires"</li>
          </ul>
          <p className="mt-2 text-orange-700">
            <b>Migration :</b> Les anciennes factures ont été converties en paiements. 
            Aucun changement requis côté client pour les endpoints existants.
          </p>
        </div>
      </section>
      <p className="text-sm text-muted-foreground">Astuce: Réponses d'erreur renvoient {`{ error: "message" }`} avec code HTTP adapté (400/401/403).</p>
    </div>
  );
}


