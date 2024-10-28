/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../../tools/base-tool.service';

@Injectable()
export class SurfaceToolService {

	constructor (
		public base: BaseToolService,
	) {
	}

}
