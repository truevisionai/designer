/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvOrientation } from 'app/map/models/tv-common';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvVirtualJunction } from 'app/map/models/junctions/tv-virtual-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { IDService } from './id.service';
import { Injectable } from '@angular/core';
import { AbstractFactory } from "../core/interfaces/abstract-factory";

import { Vector3 } from 'three';
import { Asset } from 'app/core/asset/asset.model';
import { MapService } from 'app/services/map/map.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionFactory extends AbstractFactory<TvJunction> {

	constructor ( private mapService: MapService ) {
		super();
	}

	createFromPosition ( position: Vector3 ): TvJunction {

		return this.createJunction();

	}

	createFromAsset ( asset: Asset, position: Vector3 ): TvJunction {

		return undefined;

	}

	createJunction (): TvJunction {

		const id = this.mapService.map.junctions.next();

		const name = `Junction${ id }`;

		return new TvJunction( name, id );

	}

	createVirtualJunction ( mainRoad: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {

		const id = this.mapService.map.junctions.next();

		const name = `VirtualJunction${ id }`;

		return new TvVirtualJunction( name, id, mainRoad, sStart, sEnd, orientation );

	}

}
