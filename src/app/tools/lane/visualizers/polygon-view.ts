/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ColorUtils } from "app/views/shared/utils/colors.service";
import { Mesh, ShapeGeometry, MeshBasicMaterial, Vector3, Shape, DoubleSide } from "three";

export class Polygon extends Mesh {

	private constructor ( geometry: ShapeGeometry, public material: MeshBasicMaterial ) {

		super( geometry, material );

	}

	static create ( points: Vector3[], color: any = ColorUtils.CYAN ): Polygon {

		// 1) Create a Shape
		const shape = new Shape();

		// 2) Move to the first point
		shape.moveTo( points[ 0 ].x, points[ 0 ].y );

		// 3) Connect the rest of the points
		for ( let i = 1; i < points.length; i++ ) {
			shape.lineTo( points[ i ].x, points[ i ].y );
		}

		// 4) Optionally close the shape (only needed if your last point
		//    isn't the same as your first point, or you just want to ensure
		//    a closed loop).
		shape.closePath();

		// 1) Convert the Shape to a Geometry
		const geometry = new ShapeGeometry( shape );

		// 2) Create a material
		const material = new MeshBasicMaterial( {
			color: color, // red
			side: DoubleSide // so we can see both sides
		} );

		// 3) Build a mesh from the geometry + material
		return new Polygon( geometry, material );

	}

}
