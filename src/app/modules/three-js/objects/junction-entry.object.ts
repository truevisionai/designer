/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { BufferAttribute, BufferGeometry, Color, PointsMaterial, Vector3 } from 'three';
import { TvLane } from '../../tv-map/models/tv-lane';
import { BaseControlPoint} from './control-point';
import { ISelectable } from './i-selectable';

export class JunctionEntryObject extends BaseControlPoint implements ISelectable {

	public static tag = 'junction-dot';

	public contact: TvContactPoint;

	public road: TvRoad;

	public lane: TvLane;

	constructor ( name: string, position: Vector3, contact: TvContactPoint, road: TvRoad, lane?: TvLane ) {

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const material = new PointsMaterial( {
			size: 20,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.SKYBLUE,
			depthTest: true
		} );

		super( geometry, material );

		this.contact = contact;

		this.road = road;

		this.lane = lane;

		this.name = name;

		if ( position ) this.copyPosition( position );

		this.tag = JunctionEntryObject.tag;

		this.renderOrder = 3;

	}

	select () {

		this.isSelected = true;

		( this.material as PointsMaterial ).color = new Color( COLOR.RED );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		( this.material as PointsMaterial ).color = new Color( COLOR.SKYBLUE );
		( this.material as PointsMaterial ).needsUpdate = true;

	}
}
