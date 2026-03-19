import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService)
  const router = inject(Router)

  if(auth.isLogged()){
    return true
  }

  router.navigate([''])
  return false

};