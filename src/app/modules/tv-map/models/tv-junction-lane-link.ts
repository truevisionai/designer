/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Color, Line, LineBasicMaterial, Mesh, Object3D } from 'three';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvRoad } from './tv-road.model';

export class TvJunctionLaneLink {

	public lanePath: LanePathObject;

	/**
	 *
	 * @param from ID of the incoming lane
	 * @param to ID of the connecting lane
	 */
	constructor ( public from: number, public to: number ) {

	}

	show () {

		if ( this.lanePath ) this.lanePath.hide();

	}

	hide () {

		if ( this.lanePath ) this.lanePath.show();

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
