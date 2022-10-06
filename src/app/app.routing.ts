/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SplashComponent } from './shared/components/splash/splash.component';
import { EditorComponent } from './views/editor/editor.component';
import { EditorLayoutComponent } from './views/editor/layout/editor-layout.component';
import { ErrorComponent } from './views/sessions/error/error.component';
import { ForgotPasswordComponent } from './views/sessions/forgot-password/forgot-password.component';
import { LockscreenComponent } from './views/sessions/lockscreen/lockscreen.component';
import { NotFoundComponent } from './views/sessions/not-found/not-found.component';
import { SigninComponent } from './views/sessions/signin/signin.component';
import { SignupComponent } from './views/sessions/signup/signup.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/editor',
        pathMatch: 'full'
    },
    {
        path: 'splash',
        component: SplashComponent,
    },
    {
        path: 'editor',
        canActivate: [ AuthGuard ],
        component: EditorLayoutComponent,
        children: [
            {
                path: '', component: EditorComponent,
                data: {
                    title: 'Editor',
                    breadcrumb: ''
                }
            },
        ]
    },
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
    },

];

@NgModule( {
    imports: [ RouterModule.forRoot( appRoutes, { enableTracing: false, useHash: false } ) ],
    exports: [ RouterModule ]
} )
export class AppRoutingModule {

}
