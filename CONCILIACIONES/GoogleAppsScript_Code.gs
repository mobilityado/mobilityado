/**
 * API de usuarios para MasterWeb Pro 4.2
 * Compatible con la estructura mostrada:
 * CONTRASEÑA | USUARIO | NOMBRE | ROL
 *
 * También reconoce las columnas aunque estén en otro orden.
 */
const ID_HOJA_USUARIOS = '1H_iGzONbV-mc0B37_p3XvR62A5wr81mcK8Sn0W4JVDs';
const NOMBRE_PESTANA = ''; // Vacío = usa la primera pestaña. También puedes escribir el nombre exacto.

function doGet(e) {
  try {
    const accion = String((e && e.parameter && e.parameter.accion) || '').trim().toLowerCase();

    if (accion === 'usuarios') {
      const usuarios = obtenerUsuarios_().map(u => ({
        usuario: u.usuario,
        nombre: u.nombre,
        rol: u.rol
      }));
      return json_({ ok: true, usuarios });
    }

    return json_({
      ok: true,
      servicio: 'MasterWeb Pro Usuarios',
      version: '4.2',
      uso: '?accion=usuarios'
    });
  } catch (error) {
    return json_({ ok: false, error: true, mensaje: error.message });
  }
}

function doPost(e) {
  try {
    const datos = leerPeticion_(e);
    const accion = String(datos.accion || '').trim().toLowerCase();

    if (accion !== 'login') {
      return json_({ ok: false, mensaje: 'Acción inválida.' });
    }

    const usuario = normalizar_(datos.usuario);
    const password = String(datos.password || '').trim();

    if (!usuario || !password) {
      return json_({ ok: false, mensaje: 'Usuario y contraseña son obligatorios.' });
    }

    const encontrado = obtenerUsuarios_().find(u =>
      normalizar_(u.usuario) === usuario && String(u.password).trim() === password
    );

    if (!encontrado) {
      return json_({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
    }

    return json_({
      ok: true,
      mensaje: 'Acceso correcto',
      usuario: {
        usuario: encontrado.usuario,
        nombre: encontrado.nombre,
        rol: encontrado.rol
      }
    });
  } catch (error) {
    return json_({ ok: false, error: true, mensaje: error.message });
  }
}

/** Acepta JSON (recomendado) y también formularios URL encoded. */
function leerPeticion_(e) {
  const contenido = String((e && e.postData && e.postData.contents) || '').trim();
  if (contenido) {
    try {
      return JSON.parse(contenido);
    } catch (_) {
      // Compatibilidad con accion=login&usuario=...&password=...
      return contenido.split('&').reduce((obj, parte) => {
        const pos = parte.indexOf('=');
        const clave = decodeURIComponent((pos >= 0 ? parte.slice(0, pos) : parte).replace(/\+/g, ' '));
        const valor = decodeURIComponent((pos >= 0 ? parte.slice(pos + 1) : '').replace(/\+/g, ' '));
        if (clave) obj[clave] = valor;
        return obj;
      }, {});
    }
  }
  return (e && e.parameter) || {};
}

function obtenerUsuarios_() {
  const libro = SpreadsheetApp.openById(ID_HOJA_USUARIOS);
  const hoja = NOMBRE_PESTANA
    ? libro.getSheetByName(NOMBRE_PESTANA)
    : libro.getSheets()[0];

  if (!hoja) throw new Error('No se encontró la pestaña de usuarios.');

  const valores = hoja.getDataRange().getDisplayValues();
  if (valores.length < 2) return [];

  const encabezados = valores[0].map(normalizarEncabezado_);
  const buscarColumna = nombres => {
    for (const nombre of nombres) {
      const indice = encabezados.indexOf(normalizarEncabezado_(nombre));
      if (indice >= 0) return indice;
    }
    return -1;
  };

  const iPassword = buscarColumna(['CONTRASEÑA', 'CONTRASENA', 'PASSWORD', 'CLAVE']);
  const iUsuario = buscarColumna(['USUARIO', 'USER', 'USERNAME', 'NUMERO']);
  const iNombre = buscarColumna(['NOMBRE', 'NAME', 'NOMBRE COMPLETO']);
  const iRol = buscarColumna(['ROL', 'ROLE', 'PERFIL']);

  if (iUsuario < 0 || iPassword < 0) {
    throw new Error('La hoja necesita las columnas USUARIO y CONTRASEÑA.');
  }

  return valores.slice(1).map(fila => ({
    password: String(fila[iPassword] || '').trim(),
    usuario: String(fila[iUsuario] || '').trim(),
    nombre: String(iNombre >= 0 ? fila[iNombre] : fila[iUsuario] || '').trim(),
    rol: String(iRol >= 0 ? fila[iRol] : '').trim()
  })).filter(u => u.usuario);
}

function normalizar_(valor) {
  return String(valor || '').trim().toUpperCase();
}

function normalizarEncabezado_(valor) {
  return normalizar_(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function json_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
