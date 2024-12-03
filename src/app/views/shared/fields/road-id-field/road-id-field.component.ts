/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { AbstractFieldComponent } from '../abstract-field.component';
import { RoadService } from "../../../../services/road/road.service";

@Component( {
	selector: 'app-road-id-field',
	templateUrl: './road-id-field.component.html',
	styleUrls: [ './road-id-field.component.scss' ]
} )
export class RoadIdFieldComponent extends AbstractFieldComponent<number> {

	@Input() value: number;

	constructor ( private roadService: RoadService ) {
		super();
	}

	get roads (): number[] {
		return this.roadService.roads.map( road => road.id );
	}

	ngOnInit (): void {
	}

	onRoadIdChanged ( $roadId: number ): void {
		this.changed.emit( $roadId );
	}
}
