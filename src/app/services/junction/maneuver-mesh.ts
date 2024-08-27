/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvJunctionConnection } from "app/map/models/junctions/tv-junction-connection";
import { TvJunctionLaneLink } from "app/map/models/junctions/tv-junction-lane-link";
import { ISelectable } from "app/objects/i-selectable";
import { COLOR } from "app/views/shared/utils/colors.service";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";


export class ManeuverMesh extends Mesh implements ISelectable {

	static defaultColor = COLOR.GREEN;

	isSelected: boolean;

	static tag = 'ManeuverMesh';

	tag: string = ManeuverMesh.tag;

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
		this.material.color.set( COLOR.RED );
		this.material.needsUpdate = true;
	}

	unselect (): void {
		this.material.color.set( ManeuverMesh.defaultColor );
		this.material.needsUpdate = true;
	}

	highlight (): void {
		this.material.color.set( COLOR.YELLOW );
		this.material.needsUpdate = true;
	}

	unhighlight (): void {
		this.material.color.set( ManeuverMesh.defaultColor );
		this.material.needsUpdate = true;
	}
}
