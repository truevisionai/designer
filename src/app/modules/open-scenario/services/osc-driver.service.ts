/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class DriverService {

	constructor () {
	}

	get vehicleDrivers (): string[] {

		return [
			'DefaultDriver',
		];

	}

}
