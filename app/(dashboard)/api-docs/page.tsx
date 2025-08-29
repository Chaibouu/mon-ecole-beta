export default function ApiDocsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Documentation API</h1>
      <p>Cette page recense les endpoints disponibles et leurs paramètres.</p>
      <p className="text-sm">Toutes les routes protégées requièrent les headers: Authorization: Bearer &lt;token&gt; et x-school-id: &lt;schoolId&gt;.</p>
      <p className="text-sm">La sélection de l'école active peut se faire via POST /api/active-school avec {`{ schoolId }`} dans le body.</p>
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
              <li><b>POST</b> (ADMIN): Créer une inscription</li>
              <li><b>GET /[id]</b>: Détail d'une inscription</li>
              <li><b>PATCH /[id]</b> (ADMIN): Modifier une inscription</li>
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
  "academicYearId": "..."
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
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">Astuce: Réponses d'erreur renvoient {`{ error: "message" }`} avec code HTTP adapté (400/401/403).</p>
    </div>
  );
}


