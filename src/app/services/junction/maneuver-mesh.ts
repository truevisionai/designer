/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Log } from "app/core/utils/log";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/connections/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { TvLaneLocation } from "app/map/models/tv-common";
import { INode } from "app/objects/i-selectable";
import { ColorUtils } from "app/views/shared/utils/colors.service";
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D } from "three";
import { LanePositionService } from "../lane/lane-position.service";
import { GeometryUtils } from "../surface/geometry-utils";
import { LaneDirectionHelper } from "app/modules/builder/builders/od-lane-direction-builder";
import { TvRoad } from "app/map/models/tv-road.model";
import { Environment } from "app/core/utils/environment";


export class ManeuverMesh extends Mesh implements INode {

	public static readonly tag = 'ManeuverMesh';

	isSelected: boolean;

	tag: string = ManeuverMesh.tag;

	private arrows: Object3D[] = [];

	constructor (
		public junction: TvJunction,
		public connection: TvJunctionConnection,
		public link: TvJunctionLaneLink,
		public geometry: BufferGeometry,
		public material: MeshBasicMaterial
	) {
		super( geometry, material );
	}

	select (): void {

		this.material.color.set( ColorUtils.RED );
		this.material.needsUpdate = true;

	}

	unselect (): void {

		this.material.color.set( ColorUtils.GREEN );
		this.material.needsUpdate = true;

	}

	onMouseOver (): void {

		this.material.color.set( ColorUtils.YELLOW );
		this.material.needsUpdate = true;

	}

	onMouseOut (): void {

		this.material.color.set( ColorUtils.GREEN );
		this.material.needsUpdate = true;

	}

	update (): void {

		try {

			this.removeArrows();

			const geometry = ManeuverMesh.getGeometry( this.connection.connectingRoad, this.link.connectingLane.id );

			this.geometry.dispose();

			this.geometry = geometry;

			this.addArrows();

		} catch ( error ) {

			Log.error( error );

		}

	}

	private addArrows (): void {

		const distance = this.connection.connectingRoad.length / 5;

		const arrows = LaneDirectionHelper.drawSingleLane( this.link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => this.add( arrow ) );

		this.arrows = arrows;

	}

	private removeArrows (): void {

		this.arrows.forEach( arrow => this.remove( arrow ) );

		this.arrows = [];

	}

	private static getGeometry ( road: TvRoad, laneId: number ): BufferGeometry {

		try {

			const points = LanePositionService.instance.getRoadLanePoints( road, laneId, TvLaneLocation.CENTER );

			return GeometryUtils.createExtrudeGeometry( points.map( p => p.position ) );

		} catch ( error ) {

			Log.error( error );

			return new BufferGeometry();

		}
	}

	public static create ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): ManeuverMesh {

		let color = ColorUtils.GREEN;

		if ( !Environment.production ) {
			if ( connection.isLeftTurn ) {
				color = ColorUtils.RED;
			} else if ( connection.isStraight ) {
				color = ColorUtils.BLUE;
			}
		}

		const material = new MeshBasicMaterial( {
			color: color,
			opacity: 0.2,
			transparent: true,
			depthTest: false,
			depthWrite: false
		} );

		const geometry = this.getGeometry( connection.connectingRoad, link.connectingLane.id );

		const mesh = new ManeuverMesh( junction, connection, link, geometry, material );

		mesh.addArrows();

		return mesh;

	}

}
