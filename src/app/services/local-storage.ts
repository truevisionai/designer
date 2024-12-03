/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

export const STORAGE_KEYS = {
	USER: 'user',
	LAST_FILE: 'lastOpenedFile',
}

@Injectable( {
	providedIn: 'root'
} )
export class LocalStorage {

	public store ( key: string, value: any ): void {

		window.localStorage.setItem( key, value );

	}

	public get ( key: string, value?: any ): any {

		if ( window.localStorage.getItem( key ) ) {
			return window.localStorage.getItem( key );
		}

		this.store( key, value );

		return value;
	}

	public delete ( key: string ): void {

		return window.localStorage.removeItem( key );

	}

	public deleteAll ( key: string ): void {

		return window.localStorage.clear();

	}
}
