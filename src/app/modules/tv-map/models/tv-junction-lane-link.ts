/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Color, Line, LineBasicMaterial, Mesh, Object3D } from 'three';
import { RoadFactory } from '../../../core/factories/road-factory.service';
import { SceneService } from '../../../core/services/scene.service';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvLane } from './tv-lane';
import { TvRoad } from './tv-road.model';

export class TvJunctionLaneLink {

	public lanePath: LanePathObject;

	public readonly incomingLane: TvLane;
	public readonly connectingLane: TvLane;

	/**
	 *
	 * @param from ID of the incoming lane
	 * @param to ID of the connecting lane
	 */
	constructor ( from: TvLane, to: TvLane ) {
		this.incomingLane = from;
		this.connectingLane = to;
	}

	get from (): number {
		return this.incomingLane?.id;
	}

	get to (): number {
		return this.connectingLane?.id;
	}

	get incomingRoad () {
		return this.incomingLane?.laneSection?.road;
	}

	get connectingRoad () {
		return this.connectingLane?.laneSection?.road;
	}

	show () {

		if ( this.lanePath ) this.lanePath.hide();

	}

	hide () {

		if ( this.lanePath ) this.lanePath.show();

	}

	delete () {

		this.connectingLane.laneSection.removeLane( this.connectingLane );

		// TODO: check if we need to remove the whole connection if there are no more lane links

		// rebuild connecting road because it might have changed after lane link removal
		RoadFactory.rebuildRoad( this.connectingRoad );

		SceneService.remove( this.lanePath );

	}
}

export class LanePathObject extends Object3D {

	public static tag = 'lane-path';

	public mesh: Mesh | Line;

	public isSelected: boolean;

	constructor (
		public incomingRoad: TvRoad,
		public connectingRoad: TvRoad,
		public connection: TvJunctionConnection,
		public link: TvJunctionLaneLink
	) {
		super();
	}

	get material () {
		return this.mesh.material as LineBasicMaterial;
	}

	select () {

		this.isSelected = true;

		// red
		this.material.color = new Color( 0xff0000 );
		this.material.needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		// green
		this.material.color = new Color( 0x00ffff );
		this.material.needsUpdate = true;

	}

	hide () {

		this.visible = false;
		this.mesh.visible = false;

	}

	show () {

		this.visible = true;
		this.mesh.visible = true;

	}
}
