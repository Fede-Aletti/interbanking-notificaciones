# 📱 Sistema de Notificaciones Interbanking

Un sistema completo de notificaciones push desarrollado en React Native que simula un entorno bancario real con diferentes tipos de alertas y funcionalidades avanzadas.

![Showcase](./assets/showcase-gif.gif)

## ⚡ Quick Start

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar la app
npm start

# 3. En la consola, verificar que diga "Using Expo Go"
#    Si no, presionar 's' para cambiar modo

# 4. Escanear QR con Expo Go app o cámara del móvil
```

🎯 **¡Listo!** Las notificaciones funcionan perfectamente en Expo Go.

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
Elegí Zustand sobre Context API por su simplicidad y mejor performance:
- Store minimalista sin boilerplate
- Subscripciones automáticas optimizadas
- TypeScript nativo con tipado completo
- Mejor debugging y developer experience

### **Arquitectura de Notificaciones**
Diseño que simula un sistema real:
- **Push Notifications**: Van directo al listado (simula FCM/APNS)
- **Server Notifications**: Van a cola pending (simula polling de backend)
- **Programmed Notifications**: Sistema de delay para testing

### **Manejo de Timers**
Implementación de múltiples timers controlados:
- Auto-checking cada 10 segundos para detectar nuevas notificaciones
- Auto-generación cada 15 segundos para simular actividad del servidor

## 📦 Instalación y Configuración

### **Prerrequisitos**
```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli >= 6.0.0
```

### **Instalación Rápida**
```bash
# Clonar el repositorio
git clone https://github.com/Fede-Aletti/interbanking-notificaciones.git
cd interbanking-notificaciones

# Instalar dependencias
npm install

# Levantar la app
npm start
```

## 🚀 **Cómo Ejecutar la App**

### **Opción 1: Expo Go (Recomendado para Testing Rápido) 📱**

1. **Instala Expo Go** en tu dispositivo móvil
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Ejecuta el servidor**:
   ```bash
   npm start
   ```

3. **Verifica que uses Expo Go**:
   - La consola debe mostrar: `› Using Expo Go`
   - Si no, presiona `s` para cambiar a Expo Go

4. **Escanea el QR**:
   - **iOS**: Abre la cámara y escanea el QR
   - **Android**: Abre Expo Go y escanea desde la app

✅ **¡Las notificaciones SÍ funcionan en Expo Go!** Aunque aparezca una advertencia de que "no se soportan push notifications", las notificaciones programadas y simuladas funcionan perfectamente.

### **Opción 2: Simuladores/Emuladores 🖥️**

#### **iOS Simulator**
```bash
npm run ios
# O desde la consola: presiona 'i'
```

#### **Android Emulator**
```bash
npm run android
# O desde la consola: presiona 'a'
```

### **Opción 3: Development Build (Avanzado) 🔧**

Para notificaciones push reales en producción:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Build para Android
eas build --profile development --platform android

# Build para iOS (requiere cuenta Apple Developer)
eas build --profile development --platform ios
```

## 🧪 **Testing de Notificaciones**

### **En Expo Go (iOS/Android)**
- ✅ Notificaciones programadas funcionan
- ✅ Notificaciones inmediatas funcionan
- ✅ Pull-to-refresh funciona
- ⚠️ Advertencia aparece pero se puede ignorar

### **En Simuladores**
- ✅ Notificaciones programadas funcionan
- ✅ Todas las funcionalidades disponibles
- ⚠️ No hay notificaciones push reales del sistema

### **En Development Build**
- ✅ Todas las funcionalidades
- ✅ Notificaciones push reales del sistema
- ✅ Testing completo de producción

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

## 🔍 **Verificar que Todo Funciona**

### **Logs que Debes Ver**
Cuando la app se inicia correctamente, verás en la consola:
```bash
› Using Expo Go                                    # ✅ Modo correcto
LOG  🔔 Inicializando notificaciones...           # ✅ Sistema iniciando
LOG  ✅ Canal de Android configurado               # ✅ Android listo
WARN ⚠️ Simulador detectado - Las notificaciones...# ⚠️ Normal en simulador
LOG  📱 Simulando notificación programada en 5s   # ✅ Programada creada
```

### **Comandos de la Consola**
- `s` → Cambiar entre Expo Go y Development Build
- `r` → Recargar la app
- `i` → Abrir en iOS Simulator
- `a` → Abrir en Android Emulator
- `w` → Abrir en navegador web

### **Testing Workflow**

#### **Flujo de Testing Completo**
1. **Push Inmediato**: Ir a Simulador → "Push Inmediato" → Aparece instantáneamente
2. **Notificaciones Programadas**: "Programar (5s)" → Esperar 5s → Banner azul aparece
3. **Servidor**: "Crear Notificación del Servidor" → Pull-to-refresh en Notificaciones
4. **Background Recovery**: Minimizar app → Programar → Volver → Auto-recovery funciona

#### **¿Cómo Saber si Funcionan las Programadas?**
1. Ve a la pestaña **"Simulador"**
2. Presiona **"Programar (5s)"** en cualquier tipo
3. **Quédate en la app** (no salgas)
4. Después de 5 segundos → aparece **banner azul** "Nuevas notificaciones disponibles"
5. Ve a **"Notificaciones"** → **Pull-to-refresh** → la ves en el listado

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

### **Escenarios de Testing**
1. **App en foreground**: Todas las notificaciones funcionan normalmente
2. **App en background**: Recovery automático al volver
3. **App cerrada**: Notificaciones aparecen en bandeja del sistema
4. **Pull-to-refresh**: Sincronización manual de notificaciones del servidor

## 🔮 Próximas Posibles Mejoras

- [ ] **Firebase integration**: FCM completo para push reales
- [ ] **Offline support**: Queue de notificaciones sin conexión
- [ ] **Rich notifications**: Imágenes y botones en notificaciones
- [ ] **Categories**: Filtrado por tipo de notificación
- [ ] **Search**: Búsqueda en histórico de notificaciones
- [ ] **Analytics**: Tracking de interacciones y engagement

## 📄 Licencia

Este proyecto es parte de un challenge técnico para interbanking y Sooft.

---

**Desarrollado usando React Native, Expo y TypeScript**
