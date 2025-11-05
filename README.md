# 🛡️ TrinetraGuard - AI-Powered Pilgrimage Security

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Revolutionizing pilgrimage security through cutting-edge AI technology, ensuring safe and seamless experiences for millions of devotees.**

## 🚀 Overview

TrinetraGuard is a comprehensive AI-powered security management system designed specifically for pilgrimage sites. Our platform combines advanced computer vision, real-time analytics, and intelligent alerting systems to create safer, more organized, and spiritually fulfilling experiences.

### ✨ Key Features

- **🤖 AI-Powered Crowd Management** - Real-time people counting and density analysis
- **🔍 Smart Lost & Found System** - AI-driven person tracking with CCTV integration
- **🚨 Emergency Response Platform** - Instant alerting and coordinated response systems
- **📱 Mobile-First Design** - Responsive interface for all devices
- **🔐 Secure Authentication** - Firebase-powered user management
- **📊 Real-time Analytics** - Live monitoring and predictive insights

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend & Services
- **Firebase** - Authentication and backend services
- **React Router** - Client-side routing
- **Radix UI** - Accessible component primitives

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/trinetra-frontend.git
   cd trinetra-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard layout components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components
│   ├── ui/             # Base UI components
│   └── VideoUpload/    # Video upload components
├── contexts/           # React contexts
├── firebase/           # Firebase configuration
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── error/          # Error pages
│   ├── home/           # Home page and sub-pages
│   └── upload/         # Upload pages
└── routes/             # Routing configuration
```
## 🎯 Core Features

### 1. Crowd Management System
- **Real-time Monitoring** - Live CCTV feed integration
- **AI People Counting** - Accurate crowd density analysis
- **Capacity Alerts** - Automatic notifications when limits are reached
- **Volunteer Coordination** - Instant alerts to nearby volunteers

### 2. Lost & Found System
- **Smart Reporting** - Mobile app for missing person reports
- **AI Face Recognition** - Real-time search across CCTV networks
- **Volunteer Network** - Coordinated search and rescue operations
- **LED Display Integration** - Public announcements for found persons

### 3. Emergency Response
- **Instant Notifications** - Real-time alert system
- **Location Tracking** - GPS-based coordination
- **Response Management** - Organized emergency response
- **Status Monitoring** - Real-time situation updates

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint for code quality |

## 🌐 Deployment

### Netlify Deployment
The project includes `netlify.toml` configuration for easy deployment on Netlify.

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Environment Variables for Production
Ensure all Firebase environment variables are configured in your deployment platform.

## 👥 Team

- **Omakar Sonawane** - Lead Developer
- **Nisarga Lokhande** - AI/ML Engineer
- **Rushikesh Landge** - Security Specialist
- **Dhanashri Sonawane** - UX/UI Designer
- **Gayatri Vadge** - DevOps Engineer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Email**: support@trinetraguard.com
- **Website**: [trinetraguard.com](https://trinetraguard.com)
- **LinkedIn**: [TrinetraGuard](https://linkedin.com/company/trinetraguard)

## 🙏 Acknowledgments

- Built with ❤️ for the spiritual community
- Special thanks to all pilgrimage site authorities and volunteers
- Inspired by the need for safer religious gatherings

---

**TrinetraGuard** - Protecting Sacred Journeys with AI Technology 🛡️