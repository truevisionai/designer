/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Mesh, BufferGeometry, Material, MeshBasicMaterial, SphereGeometry } from "three";
import { INode } from "../i-selectable";


export class JunctionGatePoint extends Mesh implements INode {

	static tag = 'JunctionGatePoint';

	tag: string = JunctionGatePoint.tag;

	constructor ( public coord: TvLaneCoord, geometry: BufferGeometry, public material: MeshBasicMaterial ) {

		super( geometry, material );

	}

	isSelected: boolean;

	select (): void {

		this.isSelected = true;

		this.material.color.set( COLOR.RED );

		this.material.needsUpdate = true;

	}

	unselect (): void {

		this.isSelected = false;

		this.material.color.set( COLOR.CYAN );

		this.material.needsUpdate = true;

	}

	onMouseOver (): void {

		this.material.color.set( COLOR.YELLOW );

		this.material.needsUpdate = true;

	}

	onMouseOut (): void {

		this.material.color.set( COLOR.CYAN );

		this.material.needsUpdate = true

	}

	static create ( coord: TvLaneCoord ): JunctionGatePoint {

		const geometry = new SphereGeometry( 1.0, 32, 32 );

		const material = new MeshBasicMaterial( {
			color: COLOR.CYAN,
			depthTest: false
		} );

		return new JunctionGatePoint( coord, geometry, material );
	}

}
