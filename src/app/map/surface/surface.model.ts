/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { MathUtils, Object3D, Vector2 } from 'three';

export class Surface {

	public static readonly tag = 'surface';

	public uuid: string;

	public textureGuid: string;

	public transparent: boolean = true;

	public opacity: number = 1.0;

	public mesh: Object3D;

	constructor (
		public materialGuid: string,
		public spline: CatmullRomSpline,
		public offset: Vector2 = new Vector2( 0, 0 ),
		public repeat: Vector2 = new Vector2( 1, 1 ),
		public rotation: number = 0.0,
	) {
		this.uuid = MathUtils.generateUUID();
	}

	toJson () {

		return {
			attr_uuid: this.uuid,
			attr_rotation: this.rotation,
			material: {
				attr_guid: this.materialGuid,
				attr_opacity: this.opacity,
				attr_transparent: this.transparent,
			},
			texture: {
				attr_guid: this.textureGuid
			},
			offset: {
				attr_x: this.offset.x,
				attr_y: this.offset.y,
			},
			scale: {
				attr_x: this.repeat.x,
				attr_y: this.repeat.y,
			},
			spline: {
				attr_type: this.spline.type,
				attr_closed: this.spline.closed,
				attr_tension: this.spline.tension,
				point: this.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}
}
