/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

export const SessionsRoutes: Routes = [
	{
		path: 'sessions',
		children: [ {
			path: 'signup',
			component: SignupComponent,
			data: { title: 'Signup' }
		}, {
			path: 'signin',
			component: SigninComponent,
			data: { title: 'Signin' }
		}, {
			path: 'forgot-password',
			component: ForgotPasswordComponent,
			data: { title: 'Forgot password' }
		}, {
			path: 'lockscreen',
			component: LockscreenComponent,
			data: { title: 'Lockscreen' }
		}, {
			path: '404',
			component: NotFoundComponent,
			data: { title: 'Not Found' }
		}, {
			path: 'error',
			component: ErrorComponent,
			data: { title: 'Error' }
		} ]
	}
];
