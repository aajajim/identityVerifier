import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';

export const SessionsRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'createaccount',
      component: CreateAccountComponent,
      data: { title: 'Create Account' }
    }, {
      path: 'login',
      component: LoginComponent,
      data: { title: 'Login' }
    }, {
      path: '404',
      component: NotFoundComponent,
      data: { title: 'Not Found' }
    }, {
      path: 'error',
      component: ErrorComponent,
      data: { title: 'Error' }
    }]
  }
];