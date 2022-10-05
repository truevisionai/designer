/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SessionsRoutes } from './sessions.routing';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

@NgModule( {
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatProgressBarModule,
		MatButtonModule,
		MatInputModule,
		MatCardModule,
		MatCheckboxModule,
		MatIconModule,
		RouterModule.forChild( SessionsRoutes ),
		MatProgressBarModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		FlexLayoutModule,
	],
	declarations: [
		ForgotPasswordComponent,
		LockscreenComponent,
		SigninComponent,
		SignupComponent,
		NotFoundComponent,
		ErrorComponent
	]
} )
export class SessionsModule {
}
