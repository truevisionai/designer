/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class JwtService {

	private KEY = 'jwtToken';

	private helper: JwtHelperService;

	constructor () {
		this.helper = new JwtHelperService();
	}

	get token () {
		return this.getToken();
	}

	get decodedToken () {
		return this.helper.decodeToken( this.token );
	}

	get expirationDate () {
		return this.helper.getTokenExpirationDate( this.token );
	}

	getToken (): string {
		return window.localStorage[ this.KEY ];
	}

	saveToken ( token: string ) {
		window.localStorage[ this.KEY ] = token;
	}

	destroyToken () {
		window.localStorage.removeItem( 'jwtToken' );
	}

	hasToken () {
		return (
			this.token != null &&
			this.token !== undefined &&
			this.token !== '' &&
			this.token !== 'null'
		);
	}

	isTokenExpired (): boolean {
		return this.helper.isTokenExpired( this.token );
	}
}
