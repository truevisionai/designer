/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../models/tv-lane';
import { OdWriter } from './open-drive-writer.service';

export class TvCarlaExporter extends OdWriter {

    // override default
    public writeLane ( xmlNode, lane: TvLane ) {

        return super.writeLane( xmlNode, lane );

        // // below logic is probably not required
        // // carla tv-map importnig process does not parse any user data with travel direction

        // const laneXmlNode = super.writeLane( xmlNode, lane );

        // if ( lane.side == LaneSide.CENTER ) return;

        // let direction = "undirected";

        // if ( lane.side == LaneSide.LEFT && lane.type == OdLaneType.driving ) direction = "backward";

        // if ( lane.side === LaneSide.RIGHT && lane.type == OdLaneType.driving ) direction = "forward";

        // laneXmlNode.userData = {
        //     vectorLane: {
        //         attr_travelDir: direction
        //     }
        // }

    }

}
