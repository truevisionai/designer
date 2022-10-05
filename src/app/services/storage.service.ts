/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class StorageService {

	public store ( key: string, value: string ): void {

		window.localStorage.setItem( key, value );

	}

	public get ( key: string ) {

		return window.localStorage.getItem( key );

	}

	public delete ( key: string ) {

		return window.localStorage.removeItem( key );

	}

	public deleteAll ( key: string ) {

		return window.localStorage.clear();

	}
}
