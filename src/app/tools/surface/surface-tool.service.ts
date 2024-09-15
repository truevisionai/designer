/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	constructor (
		public base: BaseToolService,
	) {
	}

}
