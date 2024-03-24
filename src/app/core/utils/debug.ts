/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Environment } from './environment';

export class Debug {

	static log ( ...message: any ) {

		if ( !Environment.production ) {

			Debug.log( message );

		}
	}

}
