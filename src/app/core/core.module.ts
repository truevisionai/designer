/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpTokenInterceptor } from './interceptors/http.token.interceptor';
import { TimeOutInterceptor } from './interceptors/time-out-interceptor';
import { MaxPipe } from './pipes/max.pipe';
import { MinPipe } from './pipes/min.pipe';

import { ApiService } from './services/api.service';
import { JwtService } from './services/jwt.service';

@NgModule( {
    declarations: [ MinPipe, MaxPipe ],
    imports: [
        CommonModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: TimeOutInterceptor, multi: true },
        ApiService,
        JwtService
    ],
    exports: [ MinPipe, MaxPipe ]
} )
export class CoreModule {
}
