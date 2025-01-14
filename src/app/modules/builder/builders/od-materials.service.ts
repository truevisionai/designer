/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MeshStandardMaterial } from "three";
import { ColorUtils } from '../../../views/shared/utils/colors.service';
import { TvLane } from '../../../map/models/tv-lane';
import { OdTextures } from '../../../deprecated/od.textures';

export class OdMaterials {

	static getLaneMaterial ( lane: TvLane, forceNew: boolean = false ): MeshStandardMaterial {

		// if ( !forceNew && lane.gameObject != null && lane.gameObject.material != null ) {
		// 	return lane.gameObject.material as MeshStandardMaterial;
		// }

		return new MeshStandardMaterial( {
			map: OdTextures.getLaneTexture( lane ),
			color: ColorUtils.WHITE,
			wireframe: false,
		} );
	}
}
