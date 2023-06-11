import { EventEmitter } from '@angular/core';
import { OscEntityObject } from '../../models/osc-entities';
import { TvMap } from '../../../tv-map/models/tv-map.model';
import { FileService } from '../../../../services/file.service';
import { ThreeService } from '../../../three-js/three.service';
import { IFile } from '../../../../core/models/file';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';

export class OscEditor {

    static scenarioChanged = new EventEmitter<any>();
    static selectedEntityChanged = new EventEmitter<OscEntityObject>();

    static currentFile: IFile;
    static fileService: FileService;
    static threeService: ThreeService;

    static get openDrive (): TvMap {
        return TvMapInstance.map;
    }

    static getLanePosition ( roadId: number, laneId: number, sCoordinate: number, offset?: number ): THREE.Vector3 {

        return TvMapQueries.getLanePosition( roadId, laneId, sCoordinate, offset );

    }

    static changeCamera () {

        throw new Error( 'Method not implemented.' );

    }

    static deselect () {

        throw new Error( 'Method not implemented.' );
    }
}
