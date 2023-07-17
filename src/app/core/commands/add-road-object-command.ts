/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from 'three';
import { TvRoadObject } from '../../modules/tv-map/models/tv-road-object';
import { SceneService } from '../services/scene.service';
import { OdBaseCommand } from './od-base-command';

export class AddRoadObjectCommand extends OdBaseCommand {

	constructor ( private roadId: number, private roadObject: TvRoadObject, private objects: Object3D[] = [] ) {
		super();
	}

	execute (): void {

		SceneService.add( this.roadObject.mesh, false );

		this.map.getRoadById( this.roadId ).addRoadObjectInstance( this.roadObject );
	}

	undo (): void {

		SceneService.remove( this.roadObject.mesh, false );

		this.map.getRoadById( this.roadId ).removeRoadObjectById( this.roadObject.attr_id );

		this.objects.forEach( object => SceneService.remove( object ) );

	}

	redo (): void {

		this.execute();

		this.objects.forEach( object => SceneService.add( object ) );

	}


}
