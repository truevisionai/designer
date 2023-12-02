import { Injectable } from '@angular/core';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { RoadService } from './road/road.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SceneService } from './scene.service';
import { GameObject } from 'app/core/game-object';
import { TvConsole } from 'app/core/utils/console';

@Injectable( {
	providedIn: 'root'
} )
export class SceneBuilderService {

	constructor (
		private roadService: RoadService
	) { }

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		map.gameObject = null;

		map.gameObject = new GameObject( 'OpenDrive' );

		map.getRoads().forEach( road => this.buildRoad( map, road ) );

		SceneService.addToMain( map.gameObject );

	}

	buildRoad ( map: TvMap, road: TvRoad ): void {

		const spline = this.findSpline( map, road );

		if ( !spline ) {

			TvConsole.error( 'spline not found for road' + road.id );

			return;

		};

		road.spline = spline;

		this.roadService.buildRoad( road );

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => spline.getRoadSegments().find( segment => segment.roadId === road.id ) );

	}

}
