/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from 'app/tools/base-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropPointToolService {

	constructor ( public readonly base: BaseToolService ) {
	}

}
