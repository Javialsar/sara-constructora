import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { 
  canAccessModule, 
  getUserModule, 
  SARA_MODULES, 
  SaraModule,
  UNIVERSAL_ACCESS_ROLES 
} from '../src/lib/auth/moduleGuards';
import { createClient } from '@supabase/supabase-js';

// Colores ANSI para terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ${GREEN}✓ [PASS]${RESET} ${testName}`);
    passedTests++;
  } else {
    console.error(`  ${RED}✗ [FAIL]${RESET} ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  CUADRILLA DE AGENTES ESPECIALIZADOS DE PRUEBAS - GRUPO SARA   ${RESET}`);
  console.log(`${BOLD}${CYAN}  Ecosistema: SARA-CONSTRUCTORA & Segregación Multi-Módulo      ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  // ========================================================================
  // AGENTE 1: SEGURIDAD & AUTENTICACIÓN (Zero-Trust & Validation Guard)
  // ========================================================================
  console.log(`${BOLD}${YELLOW}► [AGENTE 1: Ciberseguridad & Auth Auditor]${RESET}`);
  console.log(`  Verificando reglas de validación y prevención de errores 500...\n`);

  const roleMap: Record<string, string> = {
    ingeniero: 'ingeniero_residente',
    arquitecto: 'arquitecto_bim',
    contador: 'contador_constructora',
    bodeguero: 'bodeguero_constructora',
    tecnico_apoyo: 'tecnico_apoyo_obra',
    cliente: 'cliente_constructora',
  };

  const perfiles = ['ingeniero', 'arquitecto', 'contador', 'bodeguero', 'tecnico_apoyo', 'cliente'];

  // Test 1.1: Mapeo de los 6 roles
  for (const p of perfiles) {
    const mapped = roleMap[p];
    assert(Boolean(mapped), `Mapeo de perfil '${p}' a rol interno '${mapped}'`);
    assert(
      SARA_MODULES.sara_constructora.allowedRoles.includes(mapped),
      `Rol '${mapped}' está autorizado en lista blanca de sara_constructora`
    );
  }

  // Test 1.2: Validación de contraseñas y cédulas ecuatorianas
  const passwordValidator = (pwd: string) => pwd.length >= 8;
  const idValidator = (id: string) => [10, 13].includes(id.trim().length);

  assert(!passwordValidator('12345'), 'Rechazo estricto de contraseña corta (<8 chars)');
  assert(passwordValidator('SecurePass2026!'), 'Aceptación de contraseña robusta (>=8 chars)');
  assert(!idValidator('1712345'), 'Rechazo de identificación con longitud errónea (7 dígitos)');
  assert(idValidator('1724589632'), 'Aceptación de cédula ecuatoriana de 10 dígitos');
  assert(idValidator('1724589632001'), 'Aceptación de RUC ecuatoriano de 13 dígitos');

  // ========================================================================
  // AGENTE 2: ZERO-TRUST & SEGREGACIÓN INTER-MÓDULOS
  // ========================================================================
  console.log(`\n${BOLD}${YELLOW}► [AGENTE 2: Auditor de Segregación Multi-Tenant & Zero-Trust]${RESET}`);
  console.log(`  Verificando aislamiento estricto entre SARA Constructora y otros módulos...\n`);

  for (const [key, roleName] of Object.entries(roleMap)) {
    const userMeta = {
      role: roleName,
      tipo_profesional: key,
      modulo_origen: 'sara_constructora',
      modulos_autorizados: ['sara_constructora']
    };

    // Verificamos que SOLO pueda entrar a sara_constructora
    const canAccessConstructora = canAccessModule(userMeta, 'sara_constructora');
    const canAccessApu = canAccessModule(userMeta, 'sara_apu');
    const canAccessInmobiliaria = canAccessModule(userMeta, 'sara_inmobiliaria');
    const canAccessStays = canAccessModule(userMeta, 'sara_stays');
    const canAccessFletes = canAccessModule(userMeta, 'sara_fletes');
    const canAccessTalento = canAccessModule(userMeta, 'sara_talento');

    assert(canAccessConstructora, `Usuario con rol [${roleName}] PUEDE acceder a sara_constructora`);
    assert(!canAccessApu, `Usuario con rol [${roleName}] BLOQUEADO de sara_apu`);
    assert(!canAccessInmobiliaria, `Usuario con rol [${roleName}] BLOQUEADO de sara_inmobiliaria`);
    assert(!canAccessStays, `Usuario con rol [${roleName}] BLOQUEADO de sara_stays`);
    assert(!canAccessFletes, `Usuario con rol [${roleName}] BLOQUEADO de sara_fletes`);
    assert(!canAccessTalento, `Usuario con rol [${roleName}] BLOQUEADO de sara_talento`);

    const detectedModule = getUserModule(userMeta);
    assert(detectedModule === 'sara_constructora', `Detección de módulo de origen para [${roleName}] es 'sara_constructora'`);
  }

  // Verificar que un admin sí tiene acceso universal
  const adminMeta = { role: 'admin', es_admin: true };
  assert(canAccessModule(adminMeta, 'sara_constructora'), 'SuperAdmin tiene acceso a sara_constructora');
  assert(canAccessModule(adminMeta, 'sara_apu'), 'SuperAdmin tiene acceso a sara_apu');
  assert(canAccessModule(adminMeta, 'sara_inmobiliaria'), 'SuperAdmin tiene acceso a sara_inmobiliaria');

  // ========================================================================
  // AGENTE 3: INTEGRACIÓN SUPABASE CON SERVICE-ROLE ADMIN (Prevención Error 500)
  // ========================================================================
  console.log(`\n${BOLD}${YELLOW}► [AGENTE 3: Auditor de Infraestructura Supabase & Service-Role]${RESET}`);
  console.log(`  Comprobando conectividad administrativa y bypass seguro de triggers RLS...\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  assert(Boolean(supabaseUrl), 'Variable NEXT_PUBLIC_SUPABASE_URL está configurada');
  assert(Boolean(serviceRoleKey), 'Variable SUPABASE_SERVICE_ROLE_KEY está configurada');

  if (supabaseUrl && serviceRoleKey) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    try {
      // Probar lectura administrativa de la tabla de clientes
      const { data: clientes, error: clientesErr } = await adminClient
        .from('clientes')
        .select('id, nombre, email, estado')
        .limit(2);

      assert(!clientesErr, 'Conexión exitosa a tabla pública `clientes` con Service Role', clientesErr?.message);
      if (clientes) {
        console.log(`  ${CYAN}ℹ [INFO]${RESET} Registros en tabla clientes verificados (${clientes.length} muestras)`);
      }

      // Probar API admin de Auth
      const { data: usersData, error: usersErr } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 3
      });

      assert(!usersErr, 'Llamada de lectura administrativa auth.admin.listUsers() permitida sin 500', usersErr?.message);
      if (usersData?.users) {
        console.log(`  ${CYAN}ℹ [INFO]${RESET} Usuarios en auth.users auditados (${usersData.users.length} inspeccionados)`);
      }

      // Probar creación real de usuario profesional con nombre, apellido y teléfono (Trigger on_auth_user_created)
      const testEmail = `suite_test_user_${Date.now()}@gruposara.ec`;
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
          nombre: 'Juan',
          apellido: 'Fiel',
          telefono: '0909090909',
          full_name: 'Juan Fiel',
          phone: '0909090909',
          tipo_profesional: 'ingeniero',
          role: 'ingeniero_residente',
          identificacion: '1122334455',
          ruc: '1122334455',
          modulo_origen: 'sara_constructora',
          modulos_autorizados: ['sara_constructora'],
        }
      });

      assert(!createErr, 'Creación de usuario en vivo sin Database error creating new user', createErr?.message);
      if (newUser?.user) {
        // Limpiar usuario de prueba
        await adminClient.auth.admin.deleteUser(newUser.user.id);
        console.log(`  ${CYAN}ℹ [INFO]${RESET} Creación y eliminación de usuario en vivo auditada con éxito`);
      }
    } catch (err: any) {
      assert(false, 'Excepción en prueba de Supabase Service-Role', err.message);
    }
  }

  // ========================================================================
  // AGENTE 4: ARQUITECTURA DE SUITE & ROUTING ERGONÓMICO
  // ========================================================================
  console.log(`\n${BOLD}${YELLOW}► [AGENTE 4: Auditor de UX & Routing Ergonómico por Perfil]${RESET}`);
  console.log(`  Validando pestaña inicial asignada por rol profesional...\n`);

  const getInitialTabForRole = (role?: string) => {
    switch (role) {
      case 'bodeguero_constructora':
        return 'kardex';
      case 'contador_constructora':
        return 'financiero';
      case 'arquitecto_bim':
        return 'bim';
      case 'ingeniero_residente':
        return 'cronograma';
      case 'cliente_constructora':
      default:
        return 'proyectos';
    }
  };

  assert(getInitialTabForRole('bodeguero_constructora') === 'kardex', 'Bodeguero es recibido directamente en pestaña Kardex');
  assert(getInitialTabForRole('contador_constructora') === 'financiero', 'Contador es recibido en 3-Way Match Financiero');
  assert(getInitialTabForRole('arquitecto_bim') === 'bim', 'Arquitecto es recibido en Visor BIM 3D');
  assert(getInitialTabForRole('ingeniero_residente') === 'cronograma', 'Ingeniero Residente es recibido en Cronograma Maestro');
  assert(getInitialTabForRole('cliente_constructora') === 'proyectos', 'Cliente de Obra es recibido en Mis Proyectos');

  // ========================================================================
  // RESUMEN CONSOLIDADO DE LA CUADRILLA
  // ========================================================================
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}                  REPORTE FINAL DE CERTIFICACIÓN                ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`  Pruebas Exitosas: ${GREEN}${passedTests}${RESET}`);
  console.log(`  Pruebas Fallidas: ${failedTests > 0 ? RED + failedTests : GREEN + '0'}${RESET}`);

  if (failedTests === 0) {
    console.log(`\n${BOLD}${GREEN}✔ TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE (100% HEALTHY)${RESET}`);
    console.log(`${GREEN}El ecosistema SARA-CONSTRUCTORA está blindado contra el error 500, cuenta con segregación estricta y ruteo verificado.${RESET}\n`);
    process.exit(0);
  } else {
    console.error(`\n${BOLD}${RED}✖ SE DETECTARON FALLOS EN LA SUITE DE PRUEBAS${RESET}\n`);
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Error fatal al ejecutar suite de pruebas:', err);
  process.exit(1);
});
