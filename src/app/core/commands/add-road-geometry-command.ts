/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdBaseCommand } from './od-base-command';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { TvAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvMapBuilder } from '../../modules/tv-map/builders/od-builder.service';

export class AddRoadGeometryCommand extends OdBaseCommand {

    constructor ( private road: TvRoad, private geometry: TvAbstractRoadGeometry ) {
        super();
    }

    execute (): void {

        this.road.addGeometry( this.geometry );

        TvMapBuilder.buildRoad( this.openDrive.gameObject, this.road );

    }

    undo (): void {

        this.road.removeGeometryByUUID( this.geometry.uuid );

        TvMapBuilder.buildRoad( this.openDrive.gameObject, this.road );
    }

    redo (): void {

        this.execute();

    }


}