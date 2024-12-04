/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MeshStandardMaterial } from 'three';
import { COLOR } from '../../../views/shared/utils/colors.service';
import { TvLane } from '../../../map/models/tv-lane';
import { OdTextures } from '../../../deprecated/od.textures';

export class OdMaterials {

	static getLaneMaterial ( lane: TvLane, forceNew: boolean = false ): MeshStandardMaterial {

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
