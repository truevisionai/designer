/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Environment } from './environment';

export class Debug {

	static log ( message?: any, ...optionalParams: any[] ) {

		if ( !Environment.production ) {

			console.log( message, optionalParams );

		}
	}

}
