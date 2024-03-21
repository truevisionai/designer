/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D, Vector3 } from "three";
import { TvLane } from "app/map/models/tv-lane";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { AbstractFactory } from "./abstract-factory";


export abstract class LaneElementFactory<T> extends AbstractFactory<T> {

	abstract createFromPosition ( position: Vector3, lane?: TvLane ): T;

	protected getPosTheta ( position: Vector3, lane: TvLane ): TvPosTheta {

		return lane.laneSection.road.getPosThetaByPosition( position );

	}

}

export interface ILaneNodeFactory<T extends Object3D> {

	createNode ( position: Vector3, lane: TvLane ): T;

}

