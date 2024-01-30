/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Color, ExtrudeGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, Shape } from "three";
import { TvRoad } from "../map/models/tv-road.model";
import { TvJunctionConnection } from "../map/models/junctions/tv-junction-connection";
import { COLOR } from "../views/shared/utils/colors.service";
import { LaneDirectionHelper } from "../map/builders/od-lane-direction-builder";
import { TvJunctionLaneLink } from "../map/models/junctions/tv-junction-lane-link";

export class LanePathObject extends Object3D {

	public static tag = 'lane-path';

	public isSelected: boolean;

	private mesh: Mesh | Line;

	constructor (
		public incomingRoad: TvRoad,
		public connectingRoad: TvRoad,
		public connection: TvJunctionConnection,
		public link: TvJunctionLaneLink
	) {
		super();

		this.createMesh();
	}

	get material (): LineBasicMaterial {
		return this.mesh.material as LineBasicMaterial;
	}

	update () {

		this.remove( this.mesh );

		this.mesh = this.createMesh();

	}

	createMesh () {

		const width = this.connectingRoad.getFirstLaneSection().getWidthUptoCenter( this.link.connectingLane, 0 );

		const spline = this.connectingRoad.spline;

		if ( spline.controlPointPositions.length < 2 ) return;

		let offset = width;

		if ( this.link.connectingLane.id < 0 ) offset *= -1;

		// Define extrude settings
		const extrudeSettings = {
			steps: 50,
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 1,
			bevelOffset: 1,
			bevelSegments: 1,
			extrudePath: this.connectingRoad.spline.getPath( offset )
		};

		// Create a rectangular shape to be extruded along the path
		const shape = new Shape();
		shape.moveTo( -0.1, -1 );
		shape.lineTo( -0.1, 1 );

		// Create geometry and mesh
		const geometry = new ExtrudeGeometry( shape, extrudeSettings );
		const material = new MeshBasicMaterial( { color: COLOR.GREEN, opacity: 0.2, transparent: true } );

		const mesh = this.mesh = new Mesh( geometry, material );

		this.add( mesh );

		this.createArrows();

		return mesh;

	}

	createArrows () {
		const distance = this.connectingRoad.length / 3;
		const arrows = LaneDirectionHelper.drawSingleLane( this.link.connectingLane, distance, 0.25 );
		arrows.forEach( arrow => this.add( arrow ) );
	}

	select () {

		this.isSelected = true;

		// red
		this.material.color = new Color( COLOR.RED );
		this.material.needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		// green
		this.material.color = new Color( COLOR.GREEN );
		this.material.needsUpdate = true;

	}

	highlight () {

		// red
		this.material.color = new Color( COLOR.RED );
		this.material.needsUpdate = true;

	}

	unhighlight () {

		// green
		this.material.color = new Color( COLOR.GREEN );
		this.material.needsUpdate = true;

	}

	hide () {

		this.visible = false;
		this.mesh.visible = false;

	}

	show () {

		this.visible = true;
		this.mesh.visible = true;

		this.createArrows();
	}
}