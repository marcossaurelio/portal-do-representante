import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Injeta o serviço de autenticação
  const router = inject(Router); // Injeta o roteador

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login'])
    return false;
  }
};
