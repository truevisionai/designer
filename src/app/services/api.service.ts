/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Environment } from '../core/utils/environment';

@Injectable( {
	providedIn: 'root'
} )
export class ApiService {

	constructor (
		private http: HttpClient
	) {
	}

	get apiUrl (): string {
		return Environment.api_url;
	}

	get<T> ( path: string, params: HttpParams = new HttpParams() ): Observable<any> {
		return this.http.get<T>( `${ this.apiUrl }${ path }`, { params, headers: this.addAppVersionHeader() } )
			.pipe( catchError( this.formatErrors ) );
	}

	put ( path: string, body: object = {} ): Observable<any> {
		return this.http.put(
			`${ this.apiUrl }${ path }`,
			JSON.stringify( body ),
			{ headers: this.addAppVersionHeader() }
		).pipe( catchError( this.formatErrors ) );
	}

	post ( path: string, body: object = {} ): Observable<any> {
		return this.http.post(
			`${ this.apiUrl }${ path }`,
			JSON.stringify( body ),
			{ headers: this.addAppVersionHeader() }
		).pipe( catchError( this.formatErrors ) );
	}

	delete ( path ): Observable<any> {
		return this.http.delete(
			`${ this.apiUrl }${ path }`,
			{ headers: this.addAppVersionHeader() }
		).pipe( catchError( this.formatErrors ) );
	}

	private formatErrors ( error: any ) {
		return throwError( error.error );
	}

	private addAppVersionHeader (): HttpHeaders {   // <- new method
		return new HttpHeaders( {
			'App-Version': Environment.version
		} );
	}
}
