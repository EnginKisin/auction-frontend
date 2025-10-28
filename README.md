# Auction Frontend

Bu proje, [auction-backend](https://github.com/EnginKisin/auction-backend) repository'sinin frontend uygulamasıdır. Modern React teknolojileri kullanılarak geliştirilmiş, kullanıcı dostu bir açık artırma platformudur.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama
- Kullanıcı kayıt ve giriş sistemi
- JWT tabanlı güvenli oturum yönetimi
- Otomatik token yenileme
- Korumalı sayfalar ve route'lar

### 🏠 Ana Sayfa
- Aktif açık artırmaların listelenmesi
- Gerçek zamanlı geri sayım sayacı
- Ürün görselleri için carousel
- Responsive tasarım

### 🛍️ Ürün Yönetimi
- Ürün ekleme, düzenleme ve silme
- Çoklu görsel yükleme
- Ürün detay sayfaları
- Ürünlerden açık artırma oluşturma

### 🎯 Açık Artırma Sistemi
- Detaylı açık artırma sayfaları
- Gerçek zamanlı teklif verme
- Geri sayım sayacı ile süre takibi
- Açık artırma durumu gösterimi
- Teklif geçmişi

### 💳 Ödeme Entegrasyonu
- Stripe ödeme sistemi entegrasyonu

### 🎨 Kullanıcı Arayüzü
- Modern ve responsive tasarım
- Toast bildirim sistemi
- Modal ve popup'lar

### 🔒 Güvenlik
- Güvenli API iletişimi
- Token tabanlı yetkilendirme
- XSS ve CSRF koruması
- Input validasyonu

## 🛠️ Teknolojiler

- **Frontend Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.0
- **Routing:** React Router DOM 7.8.0
- **State Management:** React Context API
- **Form Handling:** React Hook Form 7.62.0
- **Validation:** Zod 4.0.16
- **HTTP Client:** Axios 1.11.0
- **Payment:** Stripe React 3.9.0
- **Authentication:** JWT Decode 4.0.16
- **Styling:** CSS3 + CSS Variables
- **Linting:** ESLint 9.32.0

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- npm
- Backend API (auction-backend repository)

## 🚀 Kurulum ve Çalıştırma

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/EnginKisin/auction-frontend.git
cd auction-frontend
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment değişkenlerini ayarlayın
Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_STRIPE_PK=your_stripe_public_key
```

**Not:** API proxy konfigürasyonu `vite.config.js` dosyasında tanımlanmıştır. Frontend, `/api` ile başlayan tüm istekleri `http://localhost:8080` adresindeki backend'e yönlendirir.

### 4. Backend API'yi çalıştırın
[auction-backend](https://github.com/EnginKisin/auction-backend) repository'sini klonlayıp çalıştırın.

### 5. Frontend'i başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
auction-frontend/
├── src/
│   ├── api/                    # API çağrıları
│   │   ├── auctions.js        # Açık artırma API'leri
│   │   └── products.js        # Ürün API'leri
│   ├── context/               # React Context'ler
│   │   ├── AuthContext.jsx    # Kimlik doğrulama
│   │   └── ToastContext.jsx   # Bildirim sistemi
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Yardımcı kütüphaneler
│   │   ├── apiClient.js       # Axios konfigürasyonu
│   │   ├── securityUtils.js   # Güvenlik yardımcıları
│   │   ├── stripe.js          # Stripe konfigürasyonu
│   │   └── ...
│   ├── routes/                # Route tanımları
│   ├── ui/                    # UI bileşenleri
│   │   ├── components/        # Yeniden kullanılabilir bileşenler
│   │   ├── layouts/           # Sayfa düzenleri
│   │   └── pages/             # Sayfa bileşenleri
│   └── main.jsx              # Uygulama giriş noktası
├── public/                    # Statik dosyalar
├── package.json              # Proje bağımlılıkları
├── vite.config.js            # Vite konfigürasyonu (API proxy)
├── eslint.config.js          # ESLint konfigürasyonu
└── README.md                 # Proje dokümantasyonu
```

---

**Not:** Bu frontend uygulaması, auction-backend API'si ile birlikte çalışacak şekilde tasarlanmıştır. Backend olmadan tam işlevsellik sağlanamaz.
