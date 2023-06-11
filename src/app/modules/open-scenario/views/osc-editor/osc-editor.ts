/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { IFile } from '../../../../core/models/file';
import { FileService } from '../../../../services/file.service';
import { ThreeService } from '../../../three-js/three.service';
import { TvMap } from '../../../tv-map/models/tv-map.model';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { TvMapInstance } from '../../../tv-map/services/tv-map-source-file';
import { EntityObject } from '../../models/osc-entities';

export class Editor {

	static scenarioChanged = new EventEmitter<any>();
	static selectedEntityChanged = new EventEmitter<EntityObject>();

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
