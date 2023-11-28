/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MeshStandardMaterial } from 'three';
import { COLOR } from '../../../views/shared/utils/colors.service';
import { TvLane } from '../models/tv-lane';
import { OdTextures } from './od.textures';

export class OdMaterials {

	static getLaneMaterial ( lane: TvLane, forceNew = false ) {

		// if ( !forceNew && lane.gameObject != null && lane.gameObject.material != null ) {
		// 	return lane.gameObject.material as MeshStandardMaterial;
		// }

		return new MeshStandardMaterial( {
			map: OdTextures.getLaneTexture( lane ),
			color: COLOR.WHITE,
			wireframe: false,
		} );
	}
}
