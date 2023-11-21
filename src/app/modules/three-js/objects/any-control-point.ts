import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from "three";
import { OdTextures } from "../../tv-map/builders/od.textures";
import { COLOR } from "../../../views/shared/utils/colors.service";

import { AbstractControlPoint } from "./abstract-control-point";

/**
 * @deprecated avoid using this use BaseControlPoint or use an exact implementation
 */
export class AnyControlPoint extends AbstractControlPoint {

	static roadTag = 'road';

	static create ( name = '', position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const dotMaterial = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.CYAN,
			depthTest: false
		} );

		const cp = new AnyControlPoint( dotGeometry, dotMaterial );

		if ( position ) cp.copyPosition( position );

		cp.userData.is_button = true;
		cp.userData.is_control_point = true;
		cp.userData.is_selectable = true;

		cp.tag = this.roadTag;

		cp.renderOrder = 3;

		return cp;
	}

}
