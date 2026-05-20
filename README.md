# UCLA Photo Studio - Inventory Management System

A modern equipment inventory management system built for UCLA student media organizations. Track cameras, lenses, audio gear, and other equipment with check-out/check-in workflows, activity logging, and user management.

## Features

- **Kanban Board View**: Visual equipment status by category
- **Inventory List View**: Searchable, filterable equipment table
- **Check-out/Check-in**: Track equipment loans with due dates and condition notes
- **Overdue Tracking**: Automatic overdue detection with reminder functionality
- **Activity Log**: Complete audit trail of all equipment movements
- **User Management**: Manage students (borrowers) and staff (managers)
- **Role-based Access**: Super admin and manager roles
- **Audit Mode**: Physical inventory verification workflow

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Atlassian Design System (Atlaskit)
- **Backend**: Supabase (development) / Express + PostgreSQL (production)
- **Database**: PostgreSQL with Row Level Security

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devops-inventory-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server (with mock data)**
   ```bash
   npm run dev
   ```

   The app works immediately with mock data - no database setup required for initial development.

### Connecting to Supabase

To persist data and enable real-time updates:

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be provisioned

2. **Run the database schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run" to create all tables, indexes, and RLS policies

3. **Seed initial data** (optional)
   - In the SQL Editor, run `supabase/seed.sql`
   - This adds sample categories, equipment, users, and managers

4. **Configure environment variables**
   - Copy `.env.example` to `.env.development`
   - Fill in your Supabase credentials:

   ```bash
   VITE_API_BACKEND=supabase
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Find these values in your Supabase dashboard under Settings > API.

5. **Restart the dev server**
   ```bash
   npm run dev
   ```

   You should see "Supabase client initialized" in the console.

## Project Structure

```
src/
├── api/                      # Backend abstraction layer
│   ├── index.ts              # Service factory + backend switching
│   ├── types.ts              # ApiResponse, ApiError types
│   ├── interfaces/           # Service contracts
│   │   ├── IEquipmentService.ts
│   │   ├── ICheckoutService.ts
│   │   ├── IUserService.ts
│   │   ├── IManagerService.ts
│   │   ├── ICategoryService.ts
│   │   ├── IActivityService.ts
│   │   └── IAuthService.ts
│   ├── supabase/             # Supabase implementations
│   │   ├── client.ts         # Supabase client + DB types
│   │   └── [Service].ts      # Service implementations
│   └── express/              # Express stubs (for production)
│       ├── client.ts         # HTTP client
│       └── index.ts          # Stub implementations
│
├── context/                  # React Context providers
│   ├── AuthContext.tsx       # Authentication state
│   └── DataContext.tsx       # All data + handlers
│
├── config/
│   └── env.ts                # Type-safe environment config
│
├── components/               # React components
│   ├── Dashboard.tsx         # Kanban board view
│   ├── InventoryListView.tsx # Table view
│   ├── UserManagement.tsx    # IAM page
│   ├── ActivityLog.tsx       # Reports
│   ├── Settings.tsx          # Admin settings
│   ├── AuditMode.tsx         # Equipment audit
│   └── [Modals]/*.tsx        # Modal dialogs
│
├── types/
│   └── index.ts              # TypeScript type definitions
│
├── data/
│   └── mockData.ts           # Mock data for development
│
├── App.tsx                   # Main app component
└── main.tsx                  # Entry point with providers

supabase/
├── schema.sql                # Database schema + RLS policies
└── seed.sql                  # Sample data
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BACKEND` | `supabase` or `express` | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | When using Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | When using Supabase |
| `VITE_API_BASE_URL` | Express API base URL | When using Express |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `categories` | Equipment categories (Cameras, Lenses, etc.) |
| `equipment` | Inventory items with status and condition notes |
| `users` | Students/borrowers with Bruin card info |
| `managers` | Staff members with roles |
| `checkouts` | Equipment loan records |
| `activity_log` | Audit trail of all actions |

### Enums

- **equipment_status**: `available`, `checked_out`, `archived`
- **manager_role**: `super_admin`, `manager`
- **activity_action**: `check_out`, `check_in`, `reminder`, `note`, `added`, `archived`

## Architecture

The app uses an abstraction layer that allows switching between backends:

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────────────────┐
              │   Context Providers   │
              │  (Auth + Data)        │
              └───────────┬───────────┘
                          │
              ┌───────────────────────┐
              │   Service Interfaces  │
              └───────────┬───────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│    SUPABASE     │             │     EXPRESS     │
│  (Development)  │             │  (Production)   │
└─────────────────┘             └─────────────────┘
```

To switch backends, change `VITE_API_BACKEND` in your environment file.

## Row Level Security

The database uses Supabase RLS policies:

- **Read access**: All authenticated managers can read all tables
- **Write access**: All authenticated managers can write to operational tables
- **Admin access**: Only super_admin can modify categories and delete managers

For development, anonymous access policies are enabled. Remove these before production deployment.

## Production Deployment

For UCLA production servers using Express + PostgreSQL:

1. Implement the Express service stubs in `src/api/express/`
2. Set up a PostgreSQL database with the schema from `supabase/schema.sql`
3. Configure environment:
   ```bash
   VITE_API_BACKEND=express
   VITE_API_BASE_URL=https://your-api-server.ucla.edu/inventory
   ```
4. Build and deploy:
   ```bash
   npm run build
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run build` to verify no TypeScript errors
4. Submit a pull request

## License

Internal UCLA use only.
