# Live Streaming App - BroadcastHub

تطبيق بث مباشر احترافي يشبه Yala و Ahlaan و Pigo Live و SuperLive مع دعم الدردشة الصوتية والهدايا الافتراضية.

## 🎯 المميزات الرئيسية

- **البث المباشر** - بث عالي الجودة
- **الدردشة الصوتية** - غرف صوتية عامة وخاصة
- **نظام الهدايا** - عملات وألماس مع نظام توزيع أرباح
- **نظام الدفع** - Shaam Cash, Sureaty Cash, Binance
- **لوحة التحكم** - إدارة كاملة من قبل Admin
- **غرف الدردشة** - عامة وخاصة

## 📱 التقنيات المستخدمة

### Backend
- **Node.js + Express** - خادم الويب
- **MongoDB** - قاعدة البيانات
- **Socket.io** - الدردشة الحية
- **JWT** - المصادقة
- **Agora SDK** - البث المباشر والدردشة الصوتية

### Mobile
- **Flutter** - تطبيق iOS و Android موحد
- **GetX** - إدارة الحالة
- **Socket.io client** - الاتصال الحي

### Admin Dashboard
- **React** - واجهة الإدارة
- **Redux** - إدارة الحالة
- **Axios** - طلبات HTTP

## 📂 هيكل المشروع

```
live-streaming-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── app.js
│   └── package.json
├── mobile/
│   ├── lib/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── models/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── main.dart
│   └── pubspec.yaml
├── admin-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── docs/
    └── API.md
```

## 🚀 البدء السريع

### Backend
```bash
cd backend
npm install
npm start
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm start
```

## 📖 التوثيق

انظر [API Documentation](./docs/API.md)

## 💰 نظام الأرباح

- المستخدم يشتري العملات والألماس
- عندما يتلقى هدايا: **30% للتطبيق، 70% للمستخدم**
- طرق السحب: Shaam Cash, Sureaty Cash, Binance

## 👤 المؤلف

aayhamdiko-rgb

## 📝 الترخيص

MIT License
