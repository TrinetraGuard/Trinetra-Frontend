# Route Metadata System

This document explains the route metadata system implemented in the Trinetra frontend application.

## Overview

The metadata system automatically displays the current page title and description in the header/navbar based on the current route. It also updates the document title dynamically.

## Components

### 1. Metadata Configuration (`src/lib/metadata.ts`)

Contains the metadata definitions for all routes:

```typescript
export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    title: "Home",
    description: "Welcome to Trinetra - Your security dashboard"
  },
  "/login": {
    title: "Login", 
    description: "Sign in to your Trinetra account"
  },
  // ... more routes
};
```

### 2. PageHeader Component (`src/components/ui/PageHeader.tsx`)

Displays the current page title and description in dashboard layouts.

### 3. RouteMetadata Component (`src/components/ui/RouteMetadata.tsx`)

Displays the current page title and description in auth pages and other layouts.

### 4. useDocumentTitle Hook (`src/hooks/useDocumentTitle.ts`)

Automatically updates the document title based on the current route.

## How It Works

1. **Route Detection**: The system uses `useLocation()` from React Router to detect the current path
2. **Metadata Lookup**: It looks up the metadata for the current path in the `routeMetadata` object
3. **Display**: The appropriate component (PageHeader or RouteMetadata) displays the title and description
4. **Document Title**: The `useDocumentTitle` hook updates the browser tab title

## Adding New Routes

To add metadata for a new route:

1. Add the route metadata to `src/lib/metadata.ts`:
```typescript
"/new-route": {
  title: "New Page",
  description: "Description of the new page"
}
```

2. Add the route to your App.tsx or router configuration

3. Use the appropriate component in your page:
   - Use `PageHeader` for dashboard pages
   - Use `RouteMetadata` for auth pages or standalone pages

## Current Routes with Metadata

- `/` - Home page
- `/login` - Login page  
- `/signup` - Signup page
- `/dashboard` - Main dashboard
- `/dashboard/settings` - Settings page
- `/dashboard/users` - Users management (planned)
- `/dashboard/reports` - Reports page (planned)

## Features

- ✅ Automatic title and description display
- ✅ Dynamic document title updates
- ✅ Fallback for unknown routes
- ✅ Consistent styling across pages
- ✅ TypeScript support
- ✅ Easy to extend and maintain

## Usage Examples

### In Dashboard Pages
```tsx
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

const MyPage = () => {
  return (
    <DashboardLayout>
      {/* PageHeader is automatically included */}
      <div>Your content here</div>
    </DashboardLayout>
  );
};
```

### In Auth Pages
```tsx
import RouteMetadata from "@/components/ui/RouteMetadata";

const AuthPage = () => {
  return (
    <div>
      <RouteMetadata />
      {/* Your auth form */}
    </div>
  );
};
``` 