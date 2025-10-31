/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { BaseDataService } from "../../core/interfaces/data.service";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class PropPointService extends BaseDataService<PropInstance> {

	constructor (
		public mapService: MapService
	) {
		super();
	}

	all (): PropInstance[] {

		return this.mapService.map.getProps();

	}

	remove ( prop: PropInstance ): void {

		this.mapService.map.removeProp( prop );

		this.mapService.map.propsGroup.remove( prop );

	}

	add ( prop: PropInstance ): void {

		this.ensurePropAttachment( prop );

		this.mapService.map.addProp( prop );

		this.mapService.map.propsGroup.add( prop, prop );

	}

	private ensurePropAttachment ( prop: PropInstance ): void {

		if ( !prop?.object ) return;

		if ( prop.object.parent !== prop ) {

			prop.add( prop.object );

		}

	}

	update ( object: PropInstance ): void {

		// do nothing

	}

	updatePoint ( object: PropInstance, point: AbstractControlPoint ): void {

		object.object.position.copy( point.position );

	}

}
