# 📱 Sistema de Notificaciones Interbanking

Un sistema completo de notificaciones push desarrollado en React Native que simula un entorno bancario real con diferentes tipos de alertas y funcionalidades avanzadas.

## ✨ Características Principales

### 🔔 **Sistema de Notificaciones**
- **Pull-to-refresh inteligente**: Las notificaciones del servidor requieren actualización manual
- **Notificaciones automáticas**: Se generan cada 15 segundos para simular actividad del backend
- **Indicador visual**: Banner que aparece cuando hay notificaciones nuevas disponibles
- **Estado persistente**: Distinción visual entre leídas/no leídas con contador en tiempo real

### 📋 **Inbox Avanzado**
- **Lista optimizada**: FlatList con renderizado eficiente para gran cantidad de notificaciones
- **Múltiples tipos**: Security, Transaction, System, Promotion, Urgent con iconos distintivos
- **Prioridades visuales**: Indicadores de alta prioridad y colores por categoría
- **Timestamps relativos**: Formato intuitivo (5m, 2h, 1d) que se actualiza automáticamente

### 🎮 **Simulador Completo**
- **Tres tipos de envío**:
  - Push inmediato (aparece al instante)
  - Notificaciones programadas (5 segundos de delay)
  - Notificaciones del servidor (requieren pull-to-refresh)
- **Estadísticas en tiempo real**: Contador de total, leídas y no leídas
- **Acciones globales**: Marcar todas como leídas y limpiar todas

### 🔄 **Gestión de Estados**
- **Background recovery**: Detecta notificaciones perdidas cuando la app vuelve del background
- **Prevención de duplicados**: Sistema de identificadores únicos
- **Auto-verificación**: Chequeo automático cada 10 segundos
- **Limpieza automática**: Remove notificaciones procesadas del sistema

## 🛠️ Decisiones Técnicas

### **Estado Global con Zustand**
Elegimos Zustand sobre Context API por su simplicidad y mejor performance:
- Store minimalista sin boilerplate
- Subscripciones automáticas optimizadas
- TypeScript nativo con tipado completo
- Mejor debugging y developer experience

### **React Navigation vs Expo Router**
Migración de Expo Router a React Navigation por:
- **Compatibilidad**: Mayor soporte con notificaciones push
- **Flexibilidad**: Control total sobre la navegación
- **Performance**: Mejor manejo de modales y transiciones
- **Ecosystem**: Más plugins y documentación disponible

### **Arquitectura de Notificaciones**
Diseño que simula un sistema real:
- **Push Notifications**: Van directo al listado (simula FCM/APNS)
- **Server Notifications**: Van a cola pending (simula polling de backend)
- **Programmed Notifications**: Sistema de delay para testing

### **Manejo de Timers**
Implementación de múltiples timers controlados:
- Auto-checking cada 10 segundos para detectar nuevas notificaciones
- Auto-generación cada 15 segundos para simular actividad del servidor
- Cleanup automático para evitar memory leaks

## 📦 Instalación y Configuración

### **Prerrequisitos**
```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0
```

### **Instalación**
```bash
# Clonar el repositorio
git clone [repository-url]
cd interbanking-notificaciones

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
```

### **Ejecución por Plataforma**

#### **iOS (Simulator)**
```bash
npm run ios
```

#### **Android (Emulator/Device)**
```bash
npm run android
```

#### **Web**
```bash
npm run web
```

### **Testing en Dispositivo Real**

#### **Expo Go (Limitado)**
```bash
# Escanear QR desde Expo Go
npm start
```
⚠️ **Nota**: Expo Go en SDK 53+ no soporta notificaciones push reales.

#### **Development Build (Recomendado)**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Crear build de desarrollo
eas build --profile development --platform android

# O para iOS (requiere cuenta de desarrollador)
eas build --profile development --platform ios
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── ui/                 # Componentes reutilizables
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Typography.tsx
│   ├── EmptyState.tsx      # Estado vacío
│   └── NotificationTabIcon.tsx
├── hooks/
│   ├── useNotifications.ts # Hook principal de notificaciones
│   └── useColorScheme.ts   # Detección de tema
├── navigation/
│   ├── AppNavigator.tsx    # Stack principal
│   ├── TabNavigator.tsx    # Tabs de navegación
│   └── types.ts           # Tipos de navegación
├── screens/
│   ├── NotificationsScreen.tsx    # Lista principal
│   ├── NotificationDetailScreen.tsx
│   └── SimulatorScreen.tsx        # Generador de notificaciones
├── store/
│   └── useNotificationStore.ts    # Estado global con Zustand
├── types/
│   └── notifications.ts           # Tipos TypeScript
└── constants/
    └── Colors.ts                  # Paleta de colores
```

## 🎨 Design System

### **Tipografía**
- **Font Family**: Urbanist (Google Fonts)
- **Variants**: h1, h2, h3, subtitle, body, caption, button, overline
- **Weights**: 100-900 disponibles

### **Colores**
```typescript
// Principales
Purple: '#8B5CF6'    // Interbanking brand
Blue: '#3B82F6'      // Information
Green: '#10B981'     // Success
Red: '#EF4444'       // Error/Danger
Orange: '#F59E0B'    // Warning

// Grises
Dark: '#1E293B'      // Titles
Medium: '#374151'    // Body text
Light: '#6B7280'     // Captions
```

### **Componentes**
- **Cards**: Default, elevated, unread variants
- **Buttons**: Primary, secondary, danger, success, outline
- **Badges**: Color-coded con auto-sizing
- **Typography**: Sistema consistente con line-height optimizado

## 🔧 Configuración Avanzada

### **Notificaciones Push Reales**

#### **Firebase Setup**
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Cloud Messaging
3. Descargar configuración:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)

#### **Actualizar app.json**
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/images/icon.png",
        "color": "#8B5CF6"
      }],
      ["@react-native-firebase/app", {
        "android": {
          "googleServicesFile": "./google-services.json"
        },
        "ios": {
          "googleServicesFile": "./GoogleService-Info.plist"
        }
      }]
    ]
  }
}
```

### **Testing Workflow**

#### **Flujo de Testing Completo**
1. **Push Inmediato**: Crear desde simulador → Aparece instantáneamente
2. **Notificaciones Programadas**: Crear → Esperar 5s → Llega como push
3. **Servidor**: Crear → Esperar 10s → Banner aparece → Pull-to-refresh
4. **Background Recovery**: Salir de app → Programar → Volver → Auto-recovery

## 📱 Funcionalidades por Pantalla

### **Notifications Screen**
- Lista de notificaciones con pull-to-refresh
- Banner de nuevas notificaciones disponibles
- Badge en tab con contador de no leídas
- Navegación a detalle con marcado automático como leída

### **Simulator Screen**
- 5 tipos de notificaciones con botones duales
- Sección especial para notificaciones del servidor
- Estadísticas en tiempo real
- Acciones globales (marcar todas, limpiar)

### **Detail Screen**
- Información completa con metadata
- Datos adicionales en formato JSON
- Acciones de eliminación
- Navegación optimizada

## 🚀 Performance

### **Optimizaciones Implementadas**
- **FlatList optimizada**: keyExtractor y renderizado eficiente
- **Memoización**: useCallback en handlers críticos
- **Cleanup automático**: Timers y subscriptions
- **State batching**: Actualizaciones agrupadas con Zustand
- **Lazy loading**: Componentes cargados bajo demanda

### **Memory Management**
- Cleanup de timers al desmontar componentes
- Removal de listeners de notificaciones
- Prevención de memory leaks en intervalos
- Gestión eficiente de state updates

## 🧪 Testing

### **Tipos de Notificaciones para Testing**
```typescript
// Push inmediato
simulateNotification('security');

// Programada (5 segundos)
scheduleNotification('Test', 'Body', 'system', 'medium', 5);

// Del servidor (requiere pull-to-refresh)
simulateServerNotification();
```

### **Escenarios de Testing**
1. **App en foreground**: Todas las notificaciones funcionan normalmente
2. **App en background**: Recovery automático al volver
3. **App cerrada**: Notificaciones aparecen en bandeja del sistema
4. **Pull-to-refresh**: Sincronización manual de notificaciones del servidor

## 🔮 Próximas Mejoras

- [ ] **Firebase integration**: FCM completo para push reales
- [ ] **Offline support**: Queue de notificaciones sin conexión
- [ ] **Rich notifications**: Imágenes y botones en notificaciones
- [ ] **Categories**: Filtrado por tipo de notificación
- [ ] **Search**: Búsqueda en histórico de notificaciones
- [ ] **Analytics**: Tracking de interacciones y engagement

## 📄 Licencia

Este proyecto es parte de un challenge técnico y está disponible para fines educativos.

---

**Desarrollado con ❤️ usando React Native, Expo y TypeScript**
