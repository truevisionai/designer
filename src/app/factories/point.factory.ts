import { IHasUpdate } from "app/commands/set-value-command";
import { PropInstance } from "app/core/models/prop-instance.model";
import { DynamicControlPoint } from "app/modules/three-js/objects/dynamic-control-point";
import { OdTextures } from "app/modules/tv-map/builders/od.textures";
import { COLOR } from "app/views/shared/utils/colors.service";
import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from "three";

export class PointFactory {

	static create<T extends IHasUpdate> ( mainObject: T, position?: Vector3 ): DynamicControlPoint<T> {

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


		const point = new DynamicControlPoint( mainObject, position );

		point.position.copy( position );

		return point;


	}

}
