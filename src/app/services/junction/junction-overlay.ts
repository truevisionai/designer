/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "app/map/models/junctions/tv-junction";
import { INode } from "app/objects/i-selectable";
import { COLOR } from "app/views/shared/utils/colors.service";
import { Mesh, BufferGeometry, MeshBasicMaterial, FrontSide } from "three";

export class JunctionOverlay extends Mesh implements INode {

	static tag = 'junction';

	tag = JunctionOverlay.tag;

	isSelected: boolean;

	material: MeshBasicMaterial;

	constructor ( public junction: TvJunction, geometry: BufferGeometry, material: MeshBasicMaterial ) {

		super( geometry, material );

		this.userData.junction = junction;

	}

	static create ( junction: TvJunction, geometry: BufferGeometry ): JunctionOverlay {

		const material = new MeshBasicMaterial( {
			color: COLOR.CYAN,
			side: FrontSide,
			depthTest: false,
			transparent: true,
			opacity: 0.2
		} );

		return new JunctionOverlay( junction, geometry, material );
	}

	select (): void {

		this.isSelected = true;

		this.material.color.set( COLOR.WHITE );
		this.material.opacity = 0.1;
		this.material.needsUpdate = true;

	}

	unselect (): void {

		this.isSelected = false;

		this.material.color.set( COLOR.CYAN );
		this.material.opacity = 0.2;
		this.material.needsUpdate = true;

	}

	onMouseOver (): void {

		this.material.color.set( COLOR.YELLOW );
		this.material.opacity = 0.2;
		this.material.needsUpdate = true;

	}

	onMouseOut (): void {

		this.material.color.set( COLOR.CYAN );
		this.material.opacity = 0.2;
		this.material.needsUpdate = true;

	}

}
