# Frontend - Simulador de Ahorro Programado

Aplicación web del proyecto semestral **Simulador de Ahorro Programado**. Permite calcular cuánto se debe ahorrar cada mes para alcanzar una meta, guardarla y consultarla después.

Este repositorio contiene únicamente el **frontend**. Hace parte de un monorepo que lo referencia como submódulo junto con el backend y la base de datos.

## Tabla de contenido

1. [Tecnologías](#tecnologías)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Funcionalidades](#funcionalidades)
4. [Requisitos](#requisitos)
5. [Cómo descargar](#cómo-descargar)
6. [Cómo ejecutar](#cómo-ejecutar)
7. [Integración con el backend](#integración-con-el-backend)
8. [Imagen en DockerHub](#imagen-en-dockerhub)
9. [Pruebas](#pruebas)
10. [Historias de usuario y responsables](#historias-de-usuario-y-responsables)
11. [Equipo](#equipo)

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| HTML5 | - | Estructura de la página |
| CSS3 | - | Estilos |
| JavaScript (vanilla, sin framework) | ES2020+ | Lógica y llamadas a la API con `fetch` |
| nginx | 1.27 (imagen `nginx:1.27-alpine`) | Servidor web y proxy hacia el backend |
| Docker | 20.10+ | Contenerización |

No requiere Node.js ni `npm install`: son archivos estáticos.

## Estructura del proyecto

```
entrega2-frontend/
├── src/
│   ├── index.html      # Interfaz: formulario de nueva meta y buscador de metas
│   ├── app.js          # Lógica: carga usuarios, guarda y consulta metas vía /api
│   └── estilos.css     # Estilos de la interfaz
├── nginx.conf          # Sirve src/ y reenvía /api/ al servicio backend (puerto 5000)
├── Dockerfile          # Imagen basada en nginx:1.27-alpine
├── .dockerignore
├── .gitignore
└── README.md
```

## Funcionalidades

- **Nueva meta:** el usuario elige un usuario registrado, ingresa la meta (COP), el plazo en meses y, opcionalmente, un abono extra con el mes en que se realiza. Al enviar, el backend calcula la cuota mensual, guarda la meta y el frontend muestra el resultado.
- **Buscar una meta:** consulta una meta guardada por su ID y muestra la meta, el plazo y la cuota mensual.
- Valores monetarios formateados en pesos colombianos (COP).
- Mensajes de error claros cuando el backend rechaza la operación.

## Requisitos

- Git
- Docker y Docker Compose (forma recomendada de ejecutarlo)
- Opcional, para probar solo la interfaz sin Docker: Python 3 o cualquier servidor estático (ver más abajo)

## Cómo descargar

**Opción 1: clonar solo este repositorio**

```bash
git clone https://github.com/ValenMJ-02/entrega2-frontend.git
cd entrega2-frontend
```

**Opción 2: clonar el monorepo completo (frontend + backend + base de datos)**

```bash
git clone --recurse-submodules <URL-DEL-MONOREPO>
```

Si ya lo clonaste sin submódulos:

```bash
git submodule update --init --recursive
```

**Opción 3: descargar la imagen desde DockerHub**

```bash
docker pull <USUARIO-DOCKERHUB>/<NOMBRE-IMAGEN-FRONTEND>:<TAG>
```

## Cómo ejecutar

### Con Docker Compose (sistema completo, recomendado)

Desde la raíz del monorepo:

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | `http://localhost:<PUERTO-FRONTEND>` |
| Backend (Swagger) | `http://localhost:<PUERTO-BACKEND>/<RUTA-SWAGGER>` |

> El servicio del backend **debe llamarse `backend`** en el `docker-compose.yml` y escuchar en el puerto **5000**, porque `nginx.conf` reenvía `/api/` a `http://backend:5000`.

### Solo el frontend con Docker

```bash
docker build -t frontend-ahorro .
docker run -p 8080:80 frontend-ahorro
```

Abrir `http://localhost:8080`. La interfaz carga, pero las llamadas a `/api/` fallarán si no hay un contenedor `backend` en la misma red de Docker.

### Solo la interfaz, sin Docker

```bash
cd src
python3 -m http.server 8080
```

Sirve los archivos, pero `/api/` no estará disponible (el proxy lo hace nginx).

## Integración con el backend

nginx reenvía todas las peticiones que empiezan por `/api/` al backend, por lo que el frontend usa rutas relativas y no necesita configurar URLs ni CORS.

| Método | Ruta (desde el navegador) | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Lista de usuarios para llenar el selector |
| POST | `/api/metas` | Crea y guarda una meta; devuelve `id_meta` y `cuota_mensual` |
| GET | `/api/metas/{id_meta}` | Consulta una meta guardada |

Cuerpo del `POST /api/metas`:

```json
{
  "id_usuario": 1,
  "meta": 5000000,
  "plazo": 12,
  "extra": 0,
  "mes_extra": 0
}
```

### Flujo completo de prueba (frontend → backend → base de datos)

1. Abrir el frontend en el navegador; el selector se llena con los usuarios que vienen de la base de datos (`GET /api/usuarios`).
2. Completar el formulario "Nueva meta" y presionar **Calcular y guardar**.
3. El frontend envía `POST /api/metas`; el backend calcula la cuota y la guarda en la base de datos.
4. Se muestra "Meta #N guardada. Cuota mensual: $X".
5. En "Buscar una meta", ingresar el ID N y presionar **Buscar** (`GET /api/metas/N`): se muestra la misma información leída desde la base de datos.

<!-- Agregar aquí capturas de pantalla del flujo -->

## Imagen en DockerHub

- Frontend: `https://hub.docker.com/r/<USUARIO-DOCKERHUB>/<NOMBRE-IMAGEN-FRONTEND>`

Para publicar una nueva versión:

```bash
docker login
docker build -t <USUARIO-DOCKERHUB>/<NOMBRE-IMAGEN-FRONTEND>:<TAG> .
docker push <USUARIO-DOCKERHUB>/<NOMBRE-IMAGEN-FRONTEND>:<TAG>
```

## Pruebas

> Estado actual: pendiente de implementar.

Plan para la entrega:

- **Pruebas unitarias:** funciones de `app.js` (por ejemplo, el formateo de dinero).
- **Pruebas end-to-end (Playwright)** del flujo crítico: crear una meta y luego buscarla por ID.

```bash
npm init playwright@latest
npx playwright test
```

(Requiere el sistema completo levantado con `docker compose up`.)

## Historias de usuario y responsables

| ID | Historia de usuario | Responsable | Estado |
|----|---------------------|-------------|--------|
| HU-01 | Como usuario quiero ingresar mi meta y plazo para saber cuánto debo ahorrar cada mes | <Valentina> | <Hecha> |
| HU-02 | Como usuario quiero agregar un abono extra para ver cómo cambia mi cuota | <Valentina> | <Hecha> |
| HU-03 | Como usuario quiero buscar una meta guardada por su ID para consultarla después | <Valentina> | <Hecha> |


