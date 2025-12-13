# RTG Smart Report

A comprehensive operations follow-up system for RTG (Rubber Tyred Gantry) fleet management, featuring real-time tracking, photo documentation, and automated reporting.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time fleet status monitoring with live metrics
- **OT Management**: Work order creation and tracking with task assignments
- **Daily Logs**: Comprehensive daily work reporting with safety checks
- **Photo Gallery**: Organized photo documentation with RTG/task/type filtering
- **Reports Center**: Automated report generation with PDF export
- **Admin Panel**: Complete CRUD operations for all data entities

### Advanced Features
- **Smart Dropdowns**: "Add New" navigation to admin when items are missing
- **Real-time Progress**: Time-based task tracking with automatic calculations
- **Operations Follow-up**: Process cycle management with checkpoints and resources
- **Photo Organization**: RTG tabs + flexible grouping (Task/Type/Date)
- **Automatic Timestamping**: All photos and logs timestamped automatically
- **Tutorial System**: Built-in onboarding for new users

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: TailwindCSS + Custom CSS with Glassmorphism & Neon design system
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-AutoTable

## 🏗️ Architecture

This application uses a **hybrid cloud architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
│                  (Static Files / CDN)                        │
│                   yooryka.web.app                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     React SPA                                │
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Supabase   │    │   Supabase   │    │   Firebase   │  │
│   │     Auth     │    │  PostgreSQL  │    │  Analytics   │  │
│   │              │    │   + Storage  │    │              │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

| Service | Purpose | Why? |
|---------|---------|------|
| **Firebase Hosting** | Static file hosting, CDN | Free tier, global CDN, easy CI/CD |
| **Supabase Auth** | User authentication | Built-in RLS, OAuth providers |
| **Supabase Database** | PostgreSQL database | Real-time subscriptions, Row Level Security |
| **Supabase Storage** | File/image storage | Integrated with auth, direct uploads |
| **Firebase Analytics** | User analytics | Google Analytics integration |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Supabase client initialization |
| `src/firebase.js` | Firebase Analytics only (not auth/db) |
| `src/services/supabaseAuth.js` | Authentication service |
| `src/services/supabaseDb.js` | Database CRUD operations |
| `src/services/supabaseStorage.js` | File upload/download |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rtg-smart-report.git

# Navigate to project directory
cd rtg-smart-report

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Firebase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `VITE_FIREBASE_API_KEY` | Optional | Firebase API key (for analytics) |
| `VITE_FIREBASE_*` | Optional | Other Firebase config values |

> ⚠️ Never commit `.env` to version control. It's already in `.gitignore`.

## 🎯 Usage

1. **Admin Setup**: Configure your fleet, zones, users, resources, and workflow tasks
2. **Create Work Orders**: Assign tasks to RTG units in OT Management
3. **Daily Logging**: Submit daily work logs with safety checks
4. **Photo Documentation**: Upload photos linked to RTGs and tasks
5. **Generate Reports**: Automatic report generation from logs and work orders

## 📊 Data Entities

The application manages 11 core entities:
- RTGs (Fleet Units)
- Zones (Work Areas)
- Users (Team Members)
- Resources (Tools, Materials, Consumables)
- Tasks (Workflow with WBS codes)
- HSE Items (Health, Safety, Environment)
- Operations Follow-up (Process Cycles)
- Work Orders (OT Management)
- Daily Logs
- QHSSE Data
- Photos

## 🎨 Design System

**Liquid Glass & Neon Theme**
- Glassmorphism effects with backdrop blur
- Neon accent colors (cyan/magenta)
- Dark mode optimized
- Smooth animations and transitions
- Responsive design for all screen sizes

## 🔄 Data Flow

```
Admin (Create/Edit) → AppContext → All Pages (Display/Use)
                         ↓
                   localStorage
                   (Persistence)
```

## 🚧 Future Enhancements

- [ ] Backend API integration (REST/GraphQL)
- [ ] User authentication & authorization
- [ ] Real-time multi-user sync (WebSocket)
- [ ] Cloud storage for photos
- [ ] Advanced analytics dashboard
- [ ] Mobile companion app
- [ ] Export/Import functionality
- [ ] Push notifications

## 📝 License

MIT License - feel free to use this project for your operations management needs.

## 👨‍💻 Author

Built with ❤️ by Tawzer AppLabs

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For support or inquiries, please contact: [your-email@example.com]

---

**Note**: This application currently uses localStorage for data persistence. For production deployment with multiple users, backend integration is recommended.
