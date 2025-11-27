BEGIN;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-18',
    'Gestión Financiera',
    'Panel para dar seguimiento a becas, desembolsos y patrocinadores.',
    '/0-18/financial_management',
    'group',
    NULL,
    14,
    NULL
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-18-1',
    'Becas y Desembolsos',
    'Registro maestro de becas, convenios y pagos realizados.',
    '/0-18-1/scholarships',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cash-stack" viewBox="0 0 16 16"><path d="M14 4.5H2a1 1 0 0 0-1 1V12h1V6h12v6h1V5.5a1 1 0 0 0-1-1"/><path d="M16 12.5H4a1 1 0 0 0-1 1V15a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5a1 1 0 0 0-1-1m-6 1.25a1.75 1.75 0 1 1 .001 3.501A1.75 1.75 0 0 1 10 13.75"/></svg>',
    1,
    '0-18'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-18-2',
    'Patrocinadores',
    'Catálogo de patrocinadores, aportes y contratos.',
    '/0-18-2/sponsors',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-heart" viewBox="0 0 16 16"><path d="M9.682 8.119c.145.09.29.188.434.292.145-.104.29-.201.435-.292 1.364-.84 2.461-1.516 2.461-2.508A1.86 1.86 0 0 0 11.153 3.7a2.3 2.3 0 0 0-1.528.61 2.3 2.3 0 0 0-1.528-.61 1.86 1.86 0 0 0-1.86 1.91c0 .992 1.097 1.669 2.462 2.509"/><path d="M4.5 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m0 6C2 8 1 9.5 1 11v1.938C1 13.52 1.48 14 2.063 14H6.5c-.313-.558-.5-1.198-.5-1.938 0-1.522.8-2.695 1.547-3.565-.65-.41-1.393-.63-2.047-.63zM9.5 8c-.447 0-.862.073-1.239.204.407.439.739.878.986 1.266.32.489.503.889.503 1.472V12c0 .755.248 1.451.663 2h3.525c.583 0 1.062-.48 1.062-1.063V12c0-2-1-4-4.5-4"/></svg>',
    2,
    '0-18'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-18-3',
    'Compromisos de Aporte',
    'Seguimiento a promesas de donación y pagos programados.',
    '/0-18-3/pledges',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1H4z"/><path d="M9.854 8.354a.5.5 0 0 0-.708-.708L7.5 9.293 6.854 8.646a.5.5 0 1 0-.708.708L7.5 10.707z"/><path d="M9.5 1a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5h.5A1.5 1.5 0 0 1 12.5 3.5V4H3.5v-.5A1.5 1.5 0 0 1 5 2h.5a.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z"/></svg>',
    3,
    '0-18'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-19',
    'Documentación',
    'Control de expedientes y evidencia presentada por los becarios.',
    '/0-19/document_management',
    'group',
    NULL,
    15,
    NULL
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-19-1',
    'Documentos Estudiantiles',
    'Repositorio de constancias, contratos y demás archivos subidos.',
    '/0-19-1/student_documents',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder2-open" viewBox="0 0 16 16"><path d="M.5 3A1.5 1.5 0 0 1 2 1.5h2.672a1.5 1.5 0 0 1 1.2.6l.96 1.2H14a1 1 0 0 1 1 1V5H2a1 1 0 0 0-.894.553L0 9.5V3z"/><path d="M0 13.5V10l1.528-3.056A2 2 0 0 1 3.316 6H15a1 1 0 0 1 .949 1.316l-1.5 5A1 1 0 0 1 13.5 13H1a1 1 0 0 1-1-1"/></svg>',
    1,
    '0-19'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-19-2',
    'Validación de Requisitos',
    'Bandeja para aprobar o rechazar documentos obligatorios.',
    '/0-19-2/requirements_validation',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16"><path d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .708-.708L7 8.293l2.646-2.647a.5.5 0 0 1 .708 0"/><path d="M3.612 15.443c-.396.108-.792.046-1.098-.283a1.78 1.78 0 0 1-.27-1.588c.187-.675.02-1.338-.312-1.87-.332-.531-.9-.95-1.617-1.05a1.78 1.78 0 0 1-1.362-.93 1.78 1.78 0 0 1 .05-1.645c.333-.53.495-1.192.31-1.866-.186-.676-.02-1.338.312-1.87.332-.53.9-.95 1.617-1.05.717-.1 1.284-.52 1.617-1.05.332-.532.498-1.194.312-1.87a1.78 1.78 0 0 1 .27-1.588c.306-.33.702-.392 1.098-.283.68.187 1.354.02 1.886-.312.53-.333.95-.9 1.05-1.617.1-.717.52-1.284 1.05-1.617.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.531-.332 1.193-.498 1.87-.312.675.186 1.338.02 1.87-.312.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.53-.332.95-.9 1.05-1.617.1-.717.52-1.284 1.05-1.617.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.53-.332.95-.9 1.05-1.617.1-.717.52-1.284 1.05-1.617C14.2.021 14.862-.145 15.538.04c.676.186 1.338.02 1.87-.312.532-.332 1.194-.498 1.87-.312.676.186 1.338.02 1.87-.312.332-.18.8-.323 1.203-.323.403 0 .87.144 1.204.324"/></svg>',
    2,
    '0-19'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-20',
    'Configuración',
    'Catálogos y parámetros operativos del sistema.',
    '/0-20/settings',
    'group',
    NULL,
    16,
    NULL
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-20-1',
    'Catálogos',
    'Mantenimiento de carreras, tipos de solicitud, estados y demás catálogos.',
    '/0-20-1/catalogs',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-collection" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M2 8h12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/></svg>',
    1,
    '0-20'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

INSERT INTO PUBLIC."MENU_OPTION"
  ("CREATED_AT", "CREATED_BY", "STATE", "MENU_OPTION_ID", "NAME", "DESCRIPTION", "PATH", "TYPE", "ICON", "ORDER", "PARENT_ID")
VALUES
  (
    NOW(),
    NULL,
    'A',
    '0-20-2',
    'Plantillas y Notificaciones',
    'Configuración de plantillas de correo, recordatorios y alertas.',
    '/0-20-2/templates',
    'item',
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16"><path d="M8 16a2 2 0 0 0 1.985-1.75H6.015A2 2 0 0 0 8 16m.5-14.5a.5.5 0 0 0-1 0V2.1a4.5 4.5 0 0 0-3.5 4.4v2.086l-.447.894A.5.5 0 0 0 3.5 10h9a.5.5 0 0 0 .447-.724L12.5 8.586V6.5a4.5 4.5 0 0 0-3.5-4.4z"/></svg>',
    2,
    '0-20'
  )
ON CONFLICT ("MENU_OPTION_ID") DO NOTHING;

COMMIT;
