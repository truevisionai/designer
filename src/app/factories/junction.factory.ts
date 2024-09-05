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
import { Asset } from 'app/assets/asset.model';
import { MapService } from 'app/services/map/map.service';
import { InvalidArgumentException } from 'app/exceptions/exceptions';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionFactory extends AbstractFactory<TvJunction> {

	constructor ( private mapService: MapService ) {
		super();
	}

	static create () {

		return new TvJunction( 'Junction', 0 );

	}

	createFromPosition ( position: Vector3 ): TvJunction {

		// if ( !position ) throw new InvalidArgumentException( 'Position is required' );

		const junction = this.createJunction();

		junction.centroid = position;

		return junction;

	}

	createFromAsset ( asset: Asset, position: Vector3 ): TvJunction {

		return undefined;

	}

	createJunction (): TvJunction {

		const id = this.mapService.map.getNextJunctionId();

		const name = `Junction${ id }`;

		return new TvJunction( name, id );

	}

	createVirtualJunction ( mainRoad: TvRoad, sStart: number, sEnd: number, orientation: TvOrientation ): TvVirtualJunction {

		const id = this.mapService.map.getNextJunctionId();

		const name = `VirtualJunction${ id }`;

		return new TvVirtualJunction( name, id, mainRoad, sStart, sEnd, orientation );

	}

	createCustomJunction ( position: Vector3 ) {

		const junction = this.createJunction();

		junction.centroid = position;

		junction.auto = false;

		return junction;
	}
}
