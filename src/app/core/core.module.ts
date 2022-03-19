/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/api.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpTokenInterceptor } from './interceptors/http.token.interceptor';
import { JwtService } from './services/jwt.service';
import { MinPipe } from './pipes/min.pipe';
import { MaxPipe } from './pipes/max.pipe';
import { TimeOutInterceptor } from './interceptors/time-out-interceptor';

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
