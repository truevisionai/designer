/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IDService } from "../../factories/id.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalIdService extends IDService {

	constructor () {
		super();
	}

}
