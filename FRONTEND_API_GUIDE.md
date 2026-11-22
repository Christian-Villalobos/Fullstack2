# 🚀 Guía de Integración Backend API para Frontend (PoE Shop)

> **Documento optimizado para Desarrolladores Frontend y Asistentes de IA (Cursor, Claude, Copilot, ChatGPT).**  
> Esta guía contiene todas las especificaciones técnicas, endpoints, contratos de datos (TypeScript), manejo de errores y ejemplos de uso para consumir la API de la tienda Path of Exile.

---

## 📌 1. Información General y Conexión

- **Base URL (Gateway):** `http://localhost:8080` *(Todas las peticiones deben apuntar a este puerto)*.
- **Microservicios involucrados:**
  - **Gateway:** Puerto `8080` (Punto de entrada único con CORS configurado).
  - **Monolito:** Puerto `8081` (Enrutado internamente como `lb://monolito`).
  - **Eureka Server:** Puerto `8761`.
- **Documentación Swagger / OpenAPI interactiva:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON Spec:** `http://localhost:8080/v3/api-docs`

### 🌐 Configuración CORS
El Gateway ya tiene habilitado CORS para los siguientes orígenes:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Create React App / Next.js)
- Dominios de despliegue: `*.vercel.app`, `*.onrender.com`, `*.netlify.app`
- Credenciales: `allowCredentials: true`
- Métodos permitidos: `GET, POST, PUT, DELETE, PATCH, OPTIONS`

---

## 🔐 2. Modelo de Autenticación y Estado en el Frontend

- El backend implementa **autenticación sin estado (Stateless)** basada en identificación de usuario.
- Al hacer **Login** o **Registro**, el backend devuelve un objeto `AuthResponse` con el `id`, `name`, `email` y `role` (`ROLE_USER` o `ROLE_ADMIN`).
- **Recomendación para el Frontend:** Guardar este objeto en `localStorage` o en el store global (`Zustand`, `Redux` o `React Context`). Muchos endpoints (como carrito, checkout y perfil) requieren el `userId` en la URL (`/api/v1/cart/{userId}`).

---

## ⚠️ 3. Formato Estándar de Respuestas de Error

El backend cuenta con un `GlobalExceptionHandler` unificado. Todos los errores controlados devuelven código **`HTTP 400 Bad Request`**:

### Error de Negocio / Credenciales / Stock:
```json
{
  "message": "Credenciales inválidas"
}
```

### Error de Validación de Formulario (Jakarta Validation):
El objeto contiene los campos específicos con error y un campo `message` con el primer error para facilitar el renderizado de alertas:
```json
{
  "email": "Formato de correo no válido",
  "password": "La contraseña debe tener al menos 4 caracteres",
  "message": "Formato de correo no válido"
}
```

---

## 📚 4. Catálogo Detallado de Endpoints

---

### 🔑 4.1 Autenticación (`/api/v1/auth`)

#### 1. Registro de Usuario
- **Método:** `POST`
- **Ruta:** `/api/v1/auth/register`
- **Body:**
```json
{
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "password": "mypassword123"
}
```
- **Validaciones:**
  - `name`: No vacío, 2 a 100 caracteres.
  - `email`: Formato email válido, no registrado previamente.
  - `password`: Mínimo 4 caracteres.
- **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": 1,
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "role": "ROLE_USER"
}
```

#### 2. Inicio de Sesión
- **Método:** `POST`
- **Ruta:** `/api/v1/auth/login`
- **Body:**
```json
{
  "email": "exile@wraeclast.com",
  "password": "mypassword123"
}
```
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": 1,
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "role": "ROLE_USER"
}
```

#### 3. Recuperar / Restablecer Contraseña
- **Método:** `POST`
- **Ruta:** `/api/v1/auth/reset-password`
- **Body:**
```json
{
  "email": "exile@wraeclast.com",
  "newPassword": "newSecretPassword"
}
```
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "message": "Contraseña restablecida con éxito"
}
```

---

### 👤 4.2 Perfil y Cuenta de Usuario (`/api/v1/users`)

#### 1. Obtener Perfil de Usuario
- **Método:** `GET`
- **Ruta:** `/api/v1/users/{userId}`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": 1,
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "role": "ROLE_USER"
}
```

#### 2. Actualizar Nombre / IGN
- **Método:** `PUT`
- **Ruta:** `/api/v1/users/{userId}/profile`
- **Body:**
```json
{
  "name": "ExileGod2026"
}
```
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "id": 1,
  "name": "ExileGod2026",
  "email": "exile@wraeclast.com",
  "role": "ROLE_USER"
}
```

#### 3. Cambiar Contraseña (Seguridad)
- **Método:** `PATCH`
- **Ruta:** `/api/v1/users/{userId}/change-password`
- **Body:**
```json
{
  "currentPassword": "mypassword123",
  "newPassword": "myNewSuperPassword"
}
```
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```
- **Error si la contraseña actual no coincide (`400 Bad Request`):**
```json
{
  "message": "La contraseña actual no es correcta."
}
```

---

### 💎 4.3 Catálogo de Productos / Orbes (`/api/v1/products` y `/api/v2/products`)

#### 1. Listar Todos los Orbes Activos (Catálogo Tienda)
- **Método:** `GET`
- **Ruta:** `/api/v1/products`
- **Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Divine Orb",
    "price": 0.85,
    "imageUrl": "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png",
    "altText": "Divine Orb Currency",
    "stock": 500,
    "active": true
  },
  {
    "id": 2,
    "name": "Mirror of Kalandra",
    "price": 120.00,
    "imageUrl": "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyDuplicate.png",
    "altText": "Mirror of Kalandra",
    "stock": 10,
    "active": true
  }
]
```

#### 2. Obtener Detalle de un Orbe
- **Método:** `GET`
- **Ruta:** `/api/v1/products/{id}`
- **Respuesta Exitosa (`200 OK`):** Objeto `ProductResponse`.

#### 3. Crear Producto (Administrador)
- **Método:** `POST`
- **Ruta:** `/api/v1/products`
- **Body:**
```json
{
  "name": "Exalted Orb",
  "price": 0.25,
  "imageUrl": "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png",
  "altText": "Exalted Orb",
  "stock": 1000,
  "active": true
}
```
- **Respuesta Exitosa (`201 Created`):** Objeto `ProductResponse` creado.

#### 4. Actualizar Stock de un Producto
- **Método:** `PATCH`
- **Ruta:** `/api/v1/products/{id}/stock?quantity=750`
- **Query Params:** `quantity` (Integer >= 0)
- **Respuesta Exitosa (`200 OK`):** Objeto `ProductResponse` con el nuevo stock.

#### 5. Catálogo V2 con Hipermedios (HATEOAS)
- **Método:** `GET`
- **Ruta:** `/api/v2/products` y `/api/v2/products/{id}`
- **Descripción:** Devuelve los orbes acompañados de enlaces de navegación (`_links.self`, `_links.update-stock`, etc.). Ideal si se requiere navegación hipermedia.

---

### 🛒 4.4 Carrito de Compras (`/api/v1/cart`)

#### 1. Obtener Carrito del Usuario
- **Método:** `GET`
- **Ruta:** `/api/v1/cart/{userId}`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "cartId": 1,
  "userId": 1,
  "items": [
    {
      "id": 10,
      "productId": 1,
      "productName": "Divine Orb",
      "unitPrice": 0.85,
      "quantity": 10,
      "subtotal": 8.50,
      "imageUrl": "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png"
    }
  ],
  "totalAmount": 8.50
}
```

#### 2. Agregar Producto al Carrito
- **Método:** `POST`
- **Ruta:** `/api/v1/cart/{userId}/items`
- **Body:**
```json
{
  "productId": 1,
  "quantity": 5
}
```
- **Validación:** Si se solicita más cantidad que el stock disponible, devuelve `400 Bad Request` con mensaje de stock insuficiente.
- **Respuesta Exitosa (`200 OK`):** Objeto `CartResponse` actualizado.

#### 3. Modificar Cantidad de un Ítem en el Carrito
- **Método:** `PATCH`
- **Ruta:** `/api/v1/cart/{userId}/items/{itemId}?quantity=8`
- **Query Params:** `quantity` (Integer). *Nota: Si `quantity <= 0`, el backend elimina el ítem automáticamente.*
- **Respuesta Exitosa (`200 OK`):** Objeto `CartResponse` actualizado.

#### 4. Eliminar un Ítem del Carrito
- **Método:** `DELETE`
- **Ruta:** `/api/v1/cart/{userId}/items/{itemId}`
- **Respuesta Exitosa (`200 OK`):** Objeto `CartResponse` actualizado.

#### 5. Vaciar el Carrito Completo
- **Método:** `DELETE`
- **Ruta:** `/api/v1/cart/{userId}`
- **Respuesta Exitosa (`200 OK`):** Objeto `CartResponse` vacío (`items: []`, `totalAmount: 0.00`).

---

### 📦 4.5 Órdenes y Checkout (`/api/v1/orders`)

#### 1. Realizar Checkout (Crear Orden a partir del Carrito)
- **Método:** `POST`
- **Ruta:** `/api/v1/orders/checkout/{userId}`
- **Comportamiento del Backend:**
  1. Verifica que el carrito no esté vacío.
  2. Valida stock en tiempo real.
  3. Descuenta el inventario automáticamente.
  4. Congela el precio unitario de cada ítem en la orden.
  5. Vacía el carrito del usuario.
  6. Asigna número de orden único (ej. `ORD-2026-X8F1`) y estado inicial `PENDING`.
- **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": 1,
  "orderNumber": "ORD-2026-A4B7C9",
  "userId": 1,
  "userName": "ExileSlayer",
  "userEmail": "exile@wraeclast.com",
  "totalAmount": 8.50,
  "status": "PENDING",
  "createdAt": "2026-11-22T17:30:00",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Divine Orb",
      "priceAtPurchase": 0.85,
      "quantity": 10,
      "subtotal": 8.50,
      "imageUrl": "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png"
    }
  ]
}
```

#### 2. Obtener Historial de Órdenes del Usuario
- **Método:** `GET`
- **Ruta:** `/api/v1/orders/user/{userId}`
- **Respuesta Exitosa (`200 OK`):** Lista `OrderResponse[]` ordenada por fecha descendente.

#### 3. Obtener Detalle de Orden por Código
- **Método:** `GET`
- **Ruta:** `/api/v1/orders/{orderNumber}` (ej. `/api/v1/orders/ORD-2026-A4B7C9`)
- **Respuesta Exitosa (`200 OK`):** Objeto `OrderResponse`.

#### 4. Listado General de Órdenes (Administrador)
- **Método:** `GET`
- **Ruta:** `/api/v1/orders`
- **Respuesta Exitosa (`200 OK`):** Lista con todas las órdenes registradas en el sistema.

#### 5. Actualizar Estado de la Orden (Administrador)
- **Método:** `PATCH`
- **Ruta:** `/api/v1/orders/{orderId}/status`
- **Body:**
```json
{
  "status": "COMPLETED"
}
```
- **Valores posibles de `status`:**
  - `PENDING`: Esperando entrega/trade in-game.
  - `COMPLETED`: Orbes entregados al jugador.
  - `CANCELLED`: Cancelada (Nota: el backend restaura automáticamente el stock a los productos).
- **Respuesta Exitosa (`200 OK`):** Objeto `OrderResponse` con el estado actualizado.

---

### 💬 4.6 Contacto y Soporte (`/api/v1/contact`)

#### 1. Enviar Mensaje de Contacto / Ticket
- **Método:** `POST`
- **Ruta:** `/api/v1/contact`
- **Body:**
```json
{
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "subject": "Duda con entrega in-game",
  "message": "Hola, ya pagué mi orden ORD-2026-A4B7C9, ¿dónde nos encontramos en el juego?"
}
```
- **Validaciones:**
  - `name`: 2 a 100 caracteres.
  - `email`: Formato email válido.
  - `subject`: 3 a 150 caracteres.
  - `message`: Mínimo 10 caracteres.
- **Respuesta Exitosa (`201 Created`):**
```json
{
  "id": 1,
  "name": "ExileSlayer",
  "email": "exile@wraeclast.com",
  "subject": "Duda con entrega in-game",
  "message": "Hola, ya pagué mi orden ORD-2026-A4B7C9, ¿dónde nos encontramos en el juego?",
  "status": "UNREAD",
  "createdAt": "2026-11-22T17:35:00"
}
```

#### 2. Bandeja de Mensajes de Soporte (Admin)
- **Método:** `GET`
- **Ruta:** `/api/v1/contact` o con filtro `/api/v1/contact?status=UNREAD`
- **Query Params opcionales:** `status` (`UNREAD`, `IN_REVIEW`, `RESOLVED`).
- **Respuesta Exitosa (`200 OK`):** Lista `ContactResponse[]`.

#### 3. Detalle de Mensaje Específico
- **Método:** `GET`
- **Ruta:** `/api/v1/contact/{id}`
- **Respuesta Exitosa (`200 OK`):** Objeto `ContactResponse`.

#### 4. Cambiar Estado del Ticket
- **Método:** `PATCH`
- **Ruta:** `/api/v1/contact/{id}/status`
- **Body:**
```json
{
  "status": "RESOLVED"
}
```
- **Valores posibles de `status`:** `UNREAD`, `IN_REVIEW`, `RESOLVED`.
- **Respuesta Exitosa (`200 OK`):** Objeto `ContactResponse`.

---

## 💻 5. Modelos y Tipos TypeScript Listos para el Frontend

Puedes copiar este archivo en tu frontend (por ejemplo en `src/types/api.ts`):

```typescript
// ==========================================
// ENUMS
// ==========================================
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export type MessageStatus = 'UNREAD' | 'IN_REVIEW' | 'RESOLVED';

// ==========================================
// USUARIO Y AUTENTICACIÓN
// ==========================================
export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==========================================
// PRODUCTOS
// ==========================================
export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  altText?: string;
  stock: number;
  active: boolean;
}

export interface ProductRequest {
  name: string;
  price: number;
  imageUrl?: string;
  altText?: string;
  stock: number;
  active?: boolean;
}

// ==========================================
// CARRITO DE COMPRAS
// ==========================================
export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  items: CartItemResponse[];
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

// ==========================================
// ÓRDENES Y CHECKOUT
// ==========================================
export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ==========================================
// CONTACTO Y SOPORTE
// ==========================================
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface UpdateMessageStatusRequest {
  status: MessageStatus;
}

// ==========================================
// ERRORES DEL BACKEND
// ==========================================
export interface ApiError {
  message: string;
  [fieldName: string]: string; // Para errores de campos de formulario específicos
}
```

---

## 🛠️ 6. Ejemplo de Cliente Axios Recomendado para React

Puedes copiar este archivo en `src/api/client.ts`:

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para extraer mensaje de error legible
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const message = errorData?.message || 'Error inesperado en el servidor';
    return Promise.reject(new Error(message));
  }
);
```
