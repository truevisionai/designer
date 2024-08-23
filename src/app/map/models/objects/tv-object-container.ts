/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadObjectReference } from "./tv-road-object-reference";
import { TvRoadTunnel } from "./tv-road-tunnel";
import { TvRoadBridge } from "./tv-road-bridge";
import { TvRoadObject } from "./tv-road-object";
import { DuplicateModelException } from "app/exceptions/exceptions";
import { TvRoad } from "../tv-road.model";

export class TvObjectContainer {

	private road: TvRoad;

	private objects: Map<number, TvRoadObject>;

	private objectReference: TvRoadObjectReference[];

	private tunnel: TvRoadTunnel[];

	private bridge: TvRoadBridge[];

	constructor ( road: TvRoad ) {

		this.road = road;

		this.objects = new Map();

		this.objectReference = [];

		this.tunnel = [];

		this.bridge = [];

	}

	removeRoadObject ( roadObject: number | TvRoadObject ): void {

		if ( typeof roadObject === 'number' ) {

			this.objects.delete( roadObject );

		} else {

			this.objects.delete( roadObject.id );

		}
	}

	clearRoadObjects (): void {

		this.objects.clear();

	}

	getRoadObjectCount (): number {

		return this.objects.size;

	}

	getRoadObjects (): TvRoadObject[] {

		return Array.from( this.objects.values() );

	}

	addRoadObject ( roadObject: TvRoadObject ): void {

		if ( this.hasRoadObject( roadObject ) ) {
			throw new DuplicateModelException( `RoadObject already exists` );
		}

		roadObject.road = this.road;

		this.objects.set( roadObject.id, roadObject );

	}

	hasRoadObject ( roadObject: TvRoadObject | number ): boolean {

		if ( typeof roadObject === 'number' ) {

			return this.objects.has( roadObject );

		} else {

			return this.objects.has( roadObject.id );

		}

	}

}
