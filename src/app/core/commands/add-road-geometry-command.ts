/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapBuilder } from '../../modules/tv-map/builders/od-builder.service';
import { TvAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { OdBaseCommand } from './od-base-command';

export class AddRoadGeometryCommand extends OdBaseCommand {

    constructor ( private road: TvRoad, private geometry: TvAbstractRoadGeometry ) {
        super();
    }

    execute (): void {

        this.road.addGeometry( this.geometry );

        TvMapBuilder.buildRoad( this.map.gameObject, this.road );

    }

    undo (): void {

        this.road.removeGeometryByUUID( this.geometry.uuid );

        TvMapBuilder.buildRoad( this.map.gameObject, this.road );
    }

    redo (): void {

        this.execute();

    }


}
