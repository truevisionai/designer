/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class OscDriverService {

	constructor () {
	}

	get vehicleDrivers (): string[] {

		return [
			'DefaultDriver',
		];

	}

}
