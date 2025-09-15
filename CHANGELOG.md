# Mon École – Changelog

Toutes les modifications notables de ce projet seront documentées ici.

## [Unreleased]
- Ajouter des tests unitaires supplémentaires pour toutes les nouvelles routes (coverage accru)
- Étendre la page API Docs avec des exemples pour toutes les routes
- Implémenter les endpoints de gestion des utilisateurs et profils
- Ajouter la gestion des notifications et paramètres d'école

## [0.3.0] - CRUD complet & validation avancée
### Ajouté
- **Endpoints CRUD complets** avec GET/PATCH/DELETE pour toutes les ressources :
  - `/api/academic-years/[id]` (GET/PATCH/DELETE)
  - `/api/terms/[id]` (GET/PATCH/DELETE)
  - `/api/subjects/[id]` (GET/PATCH/DELETE)
  - `/api/grade-levels/[id]` (GET/PATCH/DELETE)
  - `/api/classrooms/[id]` (GET/PATCH/DELETE)
  - `/api/teacher-assignments/[id]` (GET/PATCH/DELETE)
  - `/api/enrollments/[id]` (GET/PATCH/DELETE)
  - `/api/timetable-entries/[id]` (GET/PATCH/DELETE)
  - `/api/attendance-records/[id]` (GET/PATCH/DELETE)
  - `/api/assessments/[id]` (GET/PATCH/DELETE)
  - `/api/student-grades/[id]` (GET/PATCH/DELETE)
- **Endpoint école active** : `/api/active-school` (POST) pour définir l'école active
- **DELETE pour classroom-subjects** : Suppression des coefficients matière/classe
- **Schémas Zod de mise à jour** : Validation partielle pour tous les PATCH endpoints
- **Documentation API complète** : Mise à jour de la page `/api-docs` avec tous les nouveaux endpoints
- **Contrôles d'accès granulaires** : Rôles spécifiques par endpoint (ADMIN, TEACHER, etc.)

### Modifié
- **Validation renforcée** : Tous les endpoints utilisent des schémas Zod de mise à jour partielle
- **Gestion des dates** : Conversion automatique string → Date pour les champs temporels
- **Cohérence multi-tenant** : Vérification systématique de l'appartenance à l'école via `x-school-id`
- **Année scolaire active** : Logique d'exclusivité (activer une année désactive les autres)

## [0.2.0] - Initial multi-tenant & endpoints académiques
### Ajouté
- Modèle Prisma multi-établissement (School, UserSchool, AcademicYear, Term, GradeLevel, Classroom, Subject, ClassroomSubject, TeacherProfile, TeacherAssignment, Enrollment, TimetableEntry, AttendanceRecord, Assessment, StudentGrade, ReportCard, FeeSchedule, Invoice, Payment, Notification, SchoolSetting)
- Endpoints (avec Zod & ACL):
  - /api/academic-years (GET/POST)
  - /api/terms (GET/POST)
  - /api/schools (GET/POST – SUPER_ADMIN)
  - /api/users (POST – SUPER_ADMIN)
  - /api/user-schools (POST – SUPER_ADMIN)
  - /api/grade-levels (GET/POST)
  - /api/classrooms (GET/POST)
  - /api/subjects (GET/POST)
  - /api/classroom-subjects (GET/POST)
  - /api/teacher-assignments (GET/POST)
  - /api/enrollments (GET/POST)
  - /api/timetable-entries (GET/POST)
  - /api/attendance-records (GET/POST)
  - /api/assessments (GET/POST)
  - /api/student-grades (GET/POST)
- Page front de documentation API: `/(dashboard)/api-docs`
- Tests unitaires Jest de base: schools, classrooms; setup Jest
- Setup Playwright + test e2e smoke
- Seed complet multi-écoles avec données réalistes

### Supprimé
- Blog (modèles Prisma, pages, composants)
- Messagerie (modèles Prisma désactivés)

### Modifié
- Middleware API: exige `x-school-id` pour routes protégées
- ACL: `requireSchoolRole` avec accès global SUPER_ADMIN
- Navigation: retiré Blogs

## [0.1.0] - Starter
- Next.js 15, React 19, Auth JWT, Tailwind, Zod de base



