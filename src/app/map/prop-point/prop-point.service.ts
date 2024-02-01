/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { DataService } from "../../core/interfaces/data.service";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class PropPointService extends DataService<PropInstance> {

	constructor (
		public mapService: MapService
	) {
		super();
	}

	all (): PropInstance[] {

		return this.mapService.map.props;

	}

	remove ( prop: PropInstance ) {

		this.mapService.map.props = this.mapService.map.props.filter( prop => prop !== prop );

		this.mapService.map.propsGroup.remove( prop );

	}

	add ( prop: PropInstance ) {

		this.mapService.map.props.push( prop );

		this.mapService.map.propsGroup.add( prop, prop );

	}

	update ( object: PropInstance ): void {

		// do nothing

	}

	updatePoint ( object: PropInstance, point: AbstractControlPoint ): void {

		object.object.position.copy( point.position );

	}

}
