/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'three';
import { ISnapStrategy } from './ISnapStrategy';

export interface ISnappable {
	move ( position: Vector3 ): void;

	snap ( strategy: ISnapStrategy ): void;
}

export interface IMovable {
	move ( position: Vector3 ): void;
}

export interface IHasLane {
	lane: TvLane;
}

export interface IHasSCoord {
	s: number;
}

export interface IHasRoad {
	road: TvRoad;
}

