# Memoravilla

A modern Angular application for managing and sharing event photos through organized albums. Built with Angular 18, Firebase, and TailwindCSS.

## Features

- **User Authentication**: Email/password and Google sign-in
- **User Profiles**: Customizable profiles with bio and profile pictures
- **Photo Albums**: Create, manage, and share photo collections
- **Photo Upload**: Easy drag-and-drop photo uploads with Firebase Storage
- **Album Management**: Admin controls for album creation, deletion, and settings
- **Member System**: Add/remove album members with different permission levels
- **Modern UI**: Elegant design with beige/warm color palette
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: Angular 18 (Standalone Components, Signals, New Control Flow)
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: TailwindCSS with custom color palette
- **Icons**: Lucide Angular icons
- **Fonts**: Inter and Playfair Display

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)
- Firebase project with Authentication, Firestore, and Storage enabled

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memorabilia
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password and Google providers)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase configuration

4. **Update environment files**
   Update `src/environments/environment.ts` and `src/environments/environment.prod.ts` with your Firebase configuration:
   ```typescript
   export const environment = {
     production: false, // true for prod
     firebase: {
       apiKey: "your-api-key",
       authDomain: "your-auth-domain",
       projectId: "your-project-id",
       storageBucket: "your-storage-bucket",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
     }
   };
   ```

5. **Start the development server**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/              # Login and registration
│   │   ├── dashboard/         # Main dashboard
│   │   ├── albums/            # Album list and detail views
│   │   ├── profile/           # User profile management
│   │   └── shared/            # Shared components (navbar, etc.)
│   ├── services/
│   │   ├── auth.service.ts    # Authentication service
│   │   └── album.service.ts   # Album and photo management
│   ├── guards/
│   │   └── auth.guard.ts      # Route protection
│   ├── models/
│   │   └── interfaces.ts      # TypeScript interfaces
│   └── environments/          # Environment configurations
```

## Usage

1. **Sign up/Login**: Create an account or sign in with Google
2. **Create Albums**: Use the dashboard to create new photo albums
3. **Upload Photos**: Add photos to albums with drag-and-drop
4. **Manage Members**: Add friends and family to albums
5. **Organize**: Use tags and descriptions to organize your memories

## Building for Production

```bash
ng build --configuration=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
