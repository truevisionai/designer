/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from '../../../utils/maths';
import { TvLaneType } from '../../../map/models/tv-common';
import { TvMapInstance } from '../../../map/services/tv-map-instance';

export class OpenDriveProperties {
	public speed: number = 0;
	public roadId: number = 0;
	public laneSectionId: number = 0;
	public laneId: number = 0;
	public s: number = 0;
	public laneOffset: number = 0;
	public direction: number = 0;
	public autonomous: boolean = false;
	public distanceTraveled: number = 0;
	public isOpenDrive: boolean;

	isEndOfRoad (): boolean {
		const road = TvMapInstance.map.getRoad( this.roadId );

		// either at the end of the road
		// or at the beginning
		if (
			this.s >= road.length - Maths.Epsilon ||
			this.s <= Maths.Epsilon
		) {

			return true;

		} else {

			return false;

		}
	}

	isOffRoad (): boolean {
		// TODO can be imrpved
		const road = TvMapInstance.map.getRoad( this.roadId );
		const laneSection = road.getLaneProfile().getLaneSectionById( this.laneSectionId );
		const lane = laneSection.getLaneById( this.laneId );

		if (
			lane.type == TvLaneType.driving ||
			lane.type == TvLaneType.stop ||
			lane.type == TvLaneType.parking
		) {

			return false;

		} else {

			return true;

		}
	}

	reset (): void {

		this.roadId = 0;
		this.laneSectionId = 0;
		this.laneId = 0;
		this.autonomous = false;
		this.distanceTraveled = 0;
		this.direction = 0;
		this.s = 0;
		this.laneOffset = 0;
		this.speed = 0;
		this.isOpenDrive = false;

	}

	clone (): OpenDriveProperties {

		const clone = new OpenDriveProperties();

		clone.roadId = this.roadId;
		clone.laneSectionId = this.laneSectionId;
		clone.laneId = this.laneId;
		clone.autonomous = this.autonomous;
		clone.distanceTraveled = this.distanceTraveled;
		clone.direction = this.direction;
		clone.s = this.s;
		clone.laneOffset = this.laneOffset;
		clone.speed = this.speed;

		return clone;

	}
}
