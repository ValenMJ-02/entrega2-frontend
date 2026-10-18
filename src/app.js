// nginx reenvía todo lo que empiece por /api/ al backend (ver nginx.conf)
const API = "/api";

const dinero = (valor) =>
  Number(valor).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 2 });

function mostrar({ resultado = "", busqueda = "", error = "" }) {
  document.getElementById("resultado").textContent = resultado;
  document.getElementById("busqueda").textContent = busqueda;
  document.getElementById("error").textContent = error;
}

async function pedir(ruta, opciones) {
  const respuesta = await fetch(`${API}${ruta}`, opciones);
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(cuerpo.detalle || "No se pudo completar la operación");
  }
  return cuerpo;
}

async function cargarUsuarios() {
  const usuarios = await pedir("/usuarios");
  const opciones = usuarios.map((u) => new Option(`${u.nombre} (ID ${u.id_usuario})`, u.id_usuario));
  document.getElementById("usuario").replaceChildren(...opciones);
}

async function guardarMeta(evento) {
  evento.preventDefault();
  const valor = (id) => document.getElementById(id).value;
  try {
    const meta = await pedir("/metas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: Number(valor("usuario")),
        meta: Number(valor("meta")),
        plazo: Number(valor("plazo")),
        extra: Number(valor("extra") || 0),
        mes_extra: Number(valor("mes_extra") || 0),
      }),
    });
    mostrar({ resultado: `Meta #${meta.id_meta} guardada. Cuota mensual: ${dinero(meta.cuota_mensual)}` });
  } catch (error) {
    mostrar({ error: error.message });
  }
}

async function buscarMeta(evento) {
  evento.preventDefault();
  try {
    const meta = await pedir(`/metas/${Number(document.getElementById("id_meta").value)}`);
    mostrar({
      busqueda: `Meta #${meta.id_meta}: ${dinero(meta.meta)} en ${meta.plazo} meses. Cuota mensual: ${dinero(meta.cuota_mensual)}`,
    });
  } catch (error) {
    mostrar({ error: error.message });
  }
}

document.getElementById("form-meta").addEventListener("submit", guardarMeta);
document.getElementById("form-buscar").addEventListener("submit", buscarMeta);
cargarUsuarios().catch((error) => mostrar({ error: error.message }));