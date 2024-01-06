/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class LocalStorage {

	public store ( key: string, value: any ): void {

		window.localStorage.setItem( key, value );

	}

	public get ( key: string, value?: any ) {

		if ( window.localStorage.getItem( key ) ) {
			return window.localStorage.getItem( key );
		}

		this.store( key, value );

		return value;
	}

	public delete ( key: string ) {

		return window.localStorage.removeItem( key );

	}

	public deleteAll ( key: string ) {

		return window.localStorage.clear();

	}
}
