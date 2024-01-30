/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PropPolygon } from "./prop-polygon.model";
import { AbstractSplineDebugService } from "../../services/debug/abstract-spline-debug.service";
import { HasSplineDebugService } from '../../services/debug/has-spline-debug.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonDebugService extends HasSplineDebugService<PropPolygon> {

	constructor ( debug: AbstractSplineDebugService ) {
		super( debug );
	}

}


