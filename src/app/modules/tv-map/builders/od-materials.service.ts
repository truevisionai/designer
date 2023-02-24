/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MeshBasicMaterial } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvLane } from '../models/tv-lane';
import { OdTextures } from './od.textures';

export class OdMaterials {

    static getLaneMaterial ( lane: TvLane, forceNew = false ) {

        if ( !forceNew && lane.gameObject != null && lane.gameObject.material != null ) {

            return lane.gameObject.material;

        }

        return new MeshBasicMaterial( {
            map: OdTextures.getLaneTexture( lane ),
            color: COLOR.WHITE,
            wireframe: false,
        } );
    }
}
