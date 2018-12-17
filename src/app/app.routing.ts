import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './shared/services/auth/auth.guard';

export const rootRouterConfig: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: './views/sessions/sessions.module#SessionsModule',
        data: { title: 'Session', breadcrumb: 'SESSIONS'}
      }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'profile',
        loadChildren: './views/profile/profile.module#ProfileModule',
        data: { title: 'Ardor Account', breadcrumb: 'ACCOUNT'}
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'sessions/404'
  }
];

