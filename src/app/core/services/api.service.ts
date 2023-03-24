/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiService {

	constructor (
		private http: HttpClient
	) {
	}

	get<T> ( path: string, params: HttpParams = new HttpParams() ): Observable<any> {
		return this.http.get<T>( `${ environment.api_url }${ path }`, { params } )
			.pipe( catchError( this.formatErrors ) );
	}

	put ( path: string, body: object = {} ): Observable<any> {
		return this.http.put(
			`${ environment.api_url }${ path }`,
			JSON.stringify( body )
		).pipe( catchError( this.formatErrors ) );
	}

	post ( path: string, body: object = {} ): Observable<any> {
		return this.http.post(
			`${ environment.api_url }${ path }`,
			JSON.stringify( body )
		).pipe( catchError( this.formatErrors ) );
	}

	delete ( path ): Observable<any> {
		return this.http.delete(
			`${ environment.api_url }${ path }`
		).pipe( catchError( this.formatErrors ) );
	}

	private formatErrors ( error: any ) {
		return throwError( error.error );
	}
}
