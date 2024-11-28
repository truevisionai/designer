/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { MapEvents } from 'app/events/map-events';

@Injectable()
export class PropCurveService {

	constructor ( private mapService: MapService ) { }

	all (): PropCurve[] {

		return this.mapService.map.propCurves;

	}

	add ( curve: PropCurve ): void {

		this.mapService.map.propCurves.push( curve );

		MapEvents.propCurveUpdated.emit( curve );

	}

	remove ( curve: PropCurve ): void {

		const index = this.mapService.map.propCurves.indexOf( curve );

		if ( index > -1 ) {

			this.mapService.map.propCurves.splice( index, 1 );

		}

		MapEvents.propCurveRemoved.emit( curve );

	}

	update ( curve: PropCurve ): void {

		MapEvents.propCurveUpdated.emit( curve );

	}

}
