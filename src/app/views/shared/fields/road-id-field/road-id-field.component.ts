/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractFieldComponent } from '../abstract-field.component';
import { TvMapQueries } from '../../../../map/queries/tv-map-queries';

@Component( {
	selector: 'app-road-id-field',
	templateUrl: './road-id-field.component.html',
	styleUrls: [ './road-id-field.component.scss' ]
} )
export class RoadIdFieldComponent extends AbstractFieldComponent {

	@Input() value: number;

	constructor () {
		super();
	}

	get roads (): number[] {
		return TvMapQueries.getRoadArray().map( ( road ) => road.id );
	}

	ngOnInit () {
	}

	onRoadIdChanged ( $roadId: number ) {
		this.changed.emit( $roadId );
	}
}
