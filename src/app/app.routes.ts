import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { initialRedirectResolver } from './resolvers/initial-redirect.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./website/components/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
        canActivate: [loginGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent),
        canActivate: [loginGuard]
      }
    ]
  },
  {
    path: 'app',
    loadComponent: () => import('./layouts/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'albums',
        loadComponent: () => import('./components/albums/albums.component').then(m => m.AlbumsComponent)
      },
      {
        path: 'albums/:id',
        loadComponent: () => import('./components/albums/album-detail.component').then(m => m.AlbumDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'debug',
        loadComponent: () => import('./components/debug/debug.component').then(m => m.DebugComponent)
      }
    ]
  },
  // Legacy redirects
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    redirectTo: '/app/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'albums',
    redirectTo: '/app/albums',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    redirectTo: '/app/profile',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
