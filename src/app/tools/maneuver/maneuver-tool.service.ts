/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SplineService } from 'app/services/spline/spline.service';

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolService {

	constructor (
		public splineService: SplineService
	) { }

}
