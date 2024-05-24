/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DataService } from 'app/core/interfaces/data.service';
import { JunctionService } from 'app/services/junction/junction.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateService implements DataService {

	constructor (
		private junctionService: JunctionService
	) {
	}

	all ( parent?: any ) {

		//

	}

	add ( parent: any, object?: any ): void {

		//

	}

	update ( parent: any, object?: any ): void {

		//

	}

	remove ( parent: any, object: any ): void {

		//

	}



}
