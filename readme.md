# 🎮 MixedChat

<div align="center">

![MixedChat Banner](https://cdn-icons-png.freepik.com/512/17110/17110564.png)

**A lightweight, real-time chat monitoring solution for Kick and Twitch streamers**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebSocket](https://img.shields.io/badge/WebSocket-Enabled-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

[English](#english) | [Türkçe](#turkish)

</div>

---

## English

### 📖 Overview

**MixedChat** is a lightweight, browser-based chat monitoring tool that enables streamers to view real-time chat messages from both **Kick** and **Twitch** platforms simultaneously in a unified interface. Built with vanilla JavaScript and WebSocket APIs, MixedChat provides a clean, distraction-free viewing experience perfect for OBS overlays or standalone monitoring.

### ✨ Features

- **🔄 Real-Time Synchronization**: Instant message updates via WebSocket connections
- **🎨 Platform-Specific Badges**: Displays subscriber, moderator, VIP, verified, and OG badges for Kick
- **😊 Emote Support**: Full support for Kick emotes with inline rendering
- **💬 Reply Threading**: Visual indication of message replies on Kick
- **🎁 Reward Notifications**: Displays Kick channel point redemptions with custom styling
- **🗑️ Optional Message Deletion**: Enable deletable mode for chat moderation
- **🎨 Custom Fonts**: Support for Google Fonts via URL parameters
- **📱 Responsive Design**: Optimized for various screen sizes and OBS browser sources
- **🔌 Auto-Reconnection**: Automatically reconnects on connection loss

### 🚀 Quick Start

#### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server or hosting service (optional, can run directly from file system)

#### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/CilginSinek/MixedChat.git
   cd MixedChat
   ```

2. **Open in browser**:
   - Open `index.html` directly in your browser, or
   - Serve with a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```

3. **Navigate to the app** with URL parameters (see Usage section)

### 📝 Usage

MixedChat uses URL parameters to configure which channels to monitor:

#### Basic Usage

Monitor a single Kick channel:
```
http://localhost:8000/?kick=channelname
```

Monitor a single Twitch channel:
```
http://localhost:8000/?twitch=channelname
```

Monitor both platforms simultaneously:
```
http://localhost:8000/?kick=kickchannel&twitch=twitchchannel
```

#### Advanced Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `kick` | string | Kick channel username | `?kick=xqc` |
| `twitch` | string | Twitch channel username | `?twitch=shroud` |
| `deletable` | boolean | Enable message deletion buttons | `?deletable=true` |
| `font` | string | Google Font family name | `?font=Roboto` |

#### Complete Example
```
http://localhost:8000/?kick=channelname&twitch=channelname&deletable=true&font=Inter
```

### 🎯 OBS Integration

To use MixedChat as an OBS overlay:

1. **Add Browser Source**:
   - In OBS, click `+` → `Browser`
   - Name it "Chat Overlay"

2. **Configure Source**:
   - **URL**: `http://localhost:8000/?kick=yourchannel&twitch=yourchannel`
   - **Width**: `400px` (or your preference)
   - **Height**: `600px` (or your preference)
   - ✅ **Enable "Shutdown source when not visible"**
   - ✅ **Enable "Refresh browser when scene becomes active"**

3. **Customize**:
   - Adjust CSS in `styles.css` for appearance
   - Use `deletable=true` for moderation capabilities

### 🏗️ Project Structure

```
MixedChat/
├── index.html          # Main HTML entry point
├── index.js            # Core JavaScript logic & WebSocket handlers
├── styles.css          # Styling and layout
├── readme.md           # Documentation (this file)
└── public/             # Static assets
    ├── founder.png     # Founder badge icon
    ├── mod.png         # Moderator badge icon
    ├── og.png          # OG badge icon
    ├── verified.png    # Verified badge icon
    └── vip.png         # VIP badge icon
```

### 🔧 Technical Details

#### WebSocket Connections

- **Kick**: Connects to Pusher WebSocket API (`wss://ws-us2.pusher.com`)
  - Subscribes to chat events and reward redemptions
  - Implements automatic reconnection on disconnect
  - Sends keepalive pings every 2 minutes

- **Twitch**: Connects to Twitch IRC WebSocket (`wss://irc-ws.chat.twitch.tv`)
  - Uses anonymous authentication for read-only access
  - Responds to PING/PONG keepalive messages
  - Implements automatic reconnection on disconnect

#### Key Functions

| Function | Purpose |
|----------|---------|
| `KickrenderMessage()` | Renders Kick chat messages with badges and emotes |
| `TwitchrenderMessage()` | Renders Twitch IRC messages |
| `appendChatTextWithEmotes()` | Parses and renders Kick emotes inline |
| `handleRewardsRenderMessage()` | Displays Kick channel point redemptions |
| `scrollToBottomIfNear()` | Auto-scrolls chat when user is near bottom |

### 🗺️ Roadmap

- [ ] **Multi-Channel Support**: Monitor multiple channels per platform simultaneously
- [ ] **Enhanced Error Handling**: Better error messages and recovery
- [ ] **Internationalization**: Support for multiple languages (TR, ES, FR, DE)
- [ ] **Twitch Emote Support**: Render Twitch emotes inline
- [ ] **Chat Filters**: Filter messages by keywords or users
- [ ] **Custom Themes**: Predefined color themes and full customization
- [ ] **Message Timestamps**: Optional timestamp display
- [ ] **User Mentions**: Highlight when specific users are mentioned
- [ ] **Statistics Dashboard**: View chat activity metrics

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments

- Kick API for providing WebSocket access
- Twitch IRC for anonymous read access
- Google Fonts for custom typography support

### 📧 Contact

For questions or support, please open an issue on GitHub.

---

## Turkish

### 📖 Genel Bakış

**MixedChat**, yayıncıların **Kick** ve **Twitch** platformlarından gelen sohbet mesajlarını aynı anda görüntülemesini sağlayan, hafif ve tarayıcı tabanlı bir sohbet izleme aracıdır. Saf JavaScript ve WebSocket API'leri ile oluşturulan MixedChat, OBS yer paylaşımları veya bağımsız izleme için mükemmel olan temiz ve dikkat dağıtmayan bir görüntüleme deneyimi sunar.

### ✨ Özellikler

- **🔄 Gerçek Zamanlı Senkronizasyon**: WebSocket bağlantıları üzerinden anlık mesaj güncellemeleri
- **🎨 Platforma Özel Rozetler**: Kick için abone, moderatör, VIP, onaylı ve OG rozetlerini görüntüleme
- **😊 İfade Desteği**: Kick ifadelerinin satır içi görüntülenmesi için tam destek
- **💬 Yanıt Zincirleri**: Kick'teki mesaj yanıtlarının görsel gösterimi
- **🎁 Ödül Bildirimleri**: Kick kanal puanı kullanımlarını özel stil ile görüntüleme
- **🗑️ İsteğe Bağlı Mesaj Silme**: Sohbet moderasyonu için silinebilir mod
- **🎨 Özel Yazı Tipleri**: URL parametreleri ile Google Fonts desteği
- **📱 Duyarlı Tasarım**: Çeşitli ekran boyutları ve OBS tarayıcı kaynakları için optimize edilmiş
- **🔌 Otomatik Yeniden Bağlanma**: Bağlantı kesildiğinde otomatik yeniden bağlanır

### 🚀 Hızlı Başlangıç

#### Gereksinimler
- Modern bir web tarayıcısı (Chrome, Firefox, Edge, Safari)
- Yerel web sunucusu veya hosting hizmeti (opsiyonel, dosya sisteminden direkt çalıştırılabilir)

#### Kurulum

1. **Depoyu klonlayın**:
   ```bash
   git clone https://github.com/CilginSinek/MixedChat.git
   cd MixedChat
   ```

2. **Tarayıcıda açın**:
   - `index.html` dosyasını doğrudan tarayıcınızda açın, veya
   - Yerel bir sunucu ile çalıştırın (önerilir):
     ```bash
     # Python kullanarak
     python -m http.server 8000
     
     # Node.js kullanarak (http-server)
     npx http-server
     ```

3. **URL parametreleri ile uygulamaya gidin** (Kullanım bölümüne bakın)

### 📝 Kullanım

MixedChat hangi kanalların izleneceğini yapılandırmak için URL parametrelerini kullanır:

#### Temel Kullanım

Tek bir Kick kanalını izle:
```
http://localhost:8000/?kick=kanaladi
```

Tek bir Twitch kanalını izle:
```
http://localhost:8000/?twitch=kanaladi
```

Her iki platformu aynı anda izle:
```
http://localhost:8000/?kick=kickkanal&twitch=twitchkanal
```

#### Gelişmiş Parametreler

| Parametre | Tip | Açıklama | Örnek |
|-----------|-----|----------|-------|
| `kick` | string | Kick kanal kullanıcı adı | `?kick=xqc` |
| `twitch` | string | Twitch kanal kullanıcı adı | `?twitch=shroud` |
| `deletable` | boolean | Mesaj silme düğmelerini etkinleştir | `?deletable=true` |
| `font` | string | Google Font ailesi adı | `?font=Roboto` |

#### Tam Örnek
```
http://localhost:8000/?kick=kanaladi&twitch=kanaladi&deletable=true&font=Inter
```

### 🎯 OBS Entegrasyonu

MixedChat'i OBS yer paylaşımı olarak kullanmak için:

1. **Tarayıcı Kaynağı Ekle**:
   - OBS'de `+` → `Tarayıcı` seçeneğine tıklayın
   - "Sohbet Yer Paylaşımı" olarak adlandırın

2. **Kaynağı Yapılandır**:
   - **URL**: `http://localhost:8000/?kick=kanaladiniz&twitch=kanaladiniz`
   - **Genişlik**: `400px` (veya tercihiniz)
   - **Yükseklik**: `600px` (veya tercihiniz)
   - ✅ **"Görünür olmadığında kaynağı kapat" seçeneğini etkinleştirin**
   - ✅ **"Sahne etkin olduğunda tarayıcıyı yenile" seçeneğini etkinleştirin**

3. **Özelleştir**:
   - Görünüm için `styles.css` dosyasındaki CSS'i ayarlayın
   - Moderasyon yetenekleri için `deletable=true` kullanın

### 🏗️ Proje Yapısı

```
MixedChat/
├── index.html          # Ana HTML giriş noktası
├── index.js            # Temel JavaScript mantığı ve WebSocket işleyicileri
├── styles.css          # Stil ve yerleşim
├── readme.md           # Dokümantasyon (bu dosya)
└── public/             # Statik varlıklar
    ├── founder.png     # Kurucu rozet simgesi
    ├── mod.png         # Moderatör rozet simgesi
    ├── og.png          # OG rozet simgesi
    ├── verified.png    # Onaylı rozet simgesi
    └── vip.png         # VIP rozet simgesi
```

### 🔧 Teknik Detaylar

#### WebSocket Bağlantıları

- **Kick**: Pusher WebSocket API'sine bağlanır (`wss://ws-us2.pusher.com`)
  - Sohbet olaylarına ve ödül kullanımlarına abone olur
  - Bağlantı kesildiğinde otomatik yeniden bağlanma uygular
  - Her 2 dakikada bir canlı tutma pingi gönderir

- **Twitch**: Twitch IRC WebSocket'e bağlanır (`wss://irc-ws.chat.twitch.tv`)
  - Salt okunur erişim için anonim kimlik doğrulama kullanır
  - PING/PONG canlı tutma mesajlarına yanıt verir
  - Bağlantı kesildiğinde otomatik yeniden bağlanma uygular

#### Temel Fonksiyonlar

| Fonksiyon | Amaç |
|-----------|------|
| `KickrenderMessage()` | Kick sohbet mesajlarını rozetler ve ifadeler ile görüntüler |
| `TwitchrenderMessage()` | Twitch IRC mesajlarını görüntüler |
| `appendChatTextWithEmotes()` | Kick ifadelerini satır içi ayrıştırır ve görüntüler |
| `handleRewardsRenderMessage()` | Kick kanal puanı kullanımlarını görüntüler |
| `scrollToBottomIfNear()` | Kullanıcı alt kısma yakınsa sohbeti otomatik kaydırır |

### 🗺️ Yol Haritası

- [ ] **Çoklu Kanal Desteği**: Her platform için aynı anda birden fazla kanalı izleme
- [ ] **Gelişmiş Hata İşleme**: Daha iyi hata mesajları ve kurtarma
- [ ] **Uluslararasılaştırma**: Birden fazla dil desteği (TR, ES, FR, DE)
- [ ] **Twitch İfade Desteği**: Twitch ifadelerini satır içi görüntüleme
- [ ] **Sohbet Filtreleri**: Mesajları anahtar kelimeler veya kullanıcılara göre filtreleme
- [ ] **Özel Temalar**: Önceden tanımlanmış renk temaları ve tam özelleştirme
- [ ] **Mesaj Zaman Damgaları**: İsteğe bağlı zaman damgası görüntüleme
- [ ] **Kullanıcı Bahisleri**: Belirli kullanıcılar bahsedildiğinde vurgulama
- [ ] **İstatistik Panosu**: Sohbet aktivite metriklerini görüntüleme

### 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Lütfen Pull Request göndermekten çekinmeyin. Büyük değişiklikler için:

1. Depoyu fork edin
2. Özellik dalınızı oluşturun (`git checkout -b feature/HarikaBirOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalınıza push edin (`git push origin feature/HarikaBirOzellik`)
5. Pull Request açın

### 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

### 🙏 Teşekkürler

- WebSocket erişimi sağlayan Kick API
- Anonim okuma erişimi için Twitch IRC
- Özel tipografi desteği için Google Fonts

### 📧 İletişim

Sorular veya destek için lütfen GitHub'da bir issue açın.

---

<div align="center">

**Made with ❤️ for streamers by streamers**

[⬆ Back to top](#-mixedchat)

</div>