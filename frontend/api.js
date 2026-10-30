// Utilidades comunes. Todas las pantallas hablan con el backend a través de api().
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Hace la petición y devuelve { status, datos } SIN lanzar error (lo usa la página de comprobación).
async function peticion(metodo, url, cuerpo) {
  const t0 = performance.now(); let status = 0, datos = null;
  try {
    const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    status = res.status;
    datos = status === 204 ? null : await res.json().catch(() => null);
  } catch (e) { /* servidor apagado o sin red: status 0 */ }
  registrar(metodo, url, status, Math.round(performance.now() - t0));
  return { status, datos };
}

// Devuelve los datos si el código es 2xx; si no, lanza un Error con .status y el mensaje { error } del backend.
async function api(metodo, url, cuerpo) {
  const { status, datos } = await peticion(metodo, url, cuerpo);
  if (status >= 200 && status < 300) return datos;
  const e = new Error(status === 0 ? 'No se pudo conectar con el servidor. ¿Está en marcha?'
    : (datos && datos.error) || 'El servidor respondió sin mensaje. Recuerda devolver { "error": "..." }.');
  e.status = status; throw e;
}

function mostrarError(el, e) { el.hidden = false; el.innerHTML = `<b>Error ${e.status || 'de conexión'}</b>: ${esc(e.message)}`; }
function limpiar(el) { el.hidden = true; el.textContent = ''; }

function montarCabecera(actual) {
  const enlaces = [['index.html', 'Material'], ['material.html', 'Dar de alta'], ['contrato.html', 'Comprobar backend']];
  document.getElementById('cab').innerHTML = `<strong>El Pañol<small>material del taller de Tecnología</small></strong>
    <nav aria-label="Principal">${enlaces.map(([h, t]) => `<a href="${h}"${h === actual ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>`;
}

// Consola de red: muestra cada petición y su código de estado, para ver qué recibe el navegador.
document.body.insertAdjacentHTML('beforeend', '<details id="consola"><summary>Consola de red (<span id="consola-n">0</span> peticiones)</summary><ol></ol></details>');
let totalPeticiones = 0;
function registrar(metodo, url, status, ms) {
  document.getElementById('consola-n').textContent = ++totalPeticiones;
  const ol = document.querySelector('#consola ol'), li = document.createElement('li');
  li.innerHTML = `<code>${metodo} ${esc(url)}</code><b class="st s${String(status)[0]}">${status || 'sin respuesta'}</b> ${ms} ms`;
  ol.prepend(li); while (ol.children.length > 40) ol.lastChild.remove();
}
