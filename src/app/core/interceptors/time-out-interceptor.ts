/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

export class TimeOutInterceptor implements HttpInterceptor {

    private defaultTimeout = 5000;

    intercept ( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {

        const timeoutValue = Number( req.headers.get( 'timeout' ) ) || this.defaultTimeout;

        return next.handle( req ).pipe( timeout( timeoutValue ) );
    }
}
