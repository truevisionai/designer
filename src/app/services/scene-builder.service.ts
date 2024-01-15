import { Injectable } from '@angular/core';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { RoadService } from './road/road.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { SceneService } from './scene.service';
import { GameObject } from 'app/core/game-object';
import { TvConsole } from 'app/core/utils/console';
import { SurfaceToolService } from 'app/tools/surface/surface-tool.service';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { RoadObjectService } from 'app/tools/marking-line/road-object.service';
import { RoadSignalService } from './signal/road-signal.service';

@Injectable( {
	providedIn: 'root'
} )
export class SceneBuilderService {

	constructor (
		private roadService: RoadService,
		private surfaceService: SurfaceToolService,
		private roadObjectService: RoadObjectService,
		private roadSignalService: RoadSignalService,
	) { }

	buildScene ( map: TvMap ) {

		SceneService.removeFromMain( map.gameObject );

		map.gameObject = null;

		map.gameObject = new GameObject( 'OpenDrive' );

		map.getRoads().forEach( road => this.buildRoad( map, road ) );

		map.getRoads().forEach( road => this.roadObjectService.buildRoadObjects( road ) );

		map.getRoads().forEach( road => this.roadSignalService.buildSignals( road ) );

		map.getSurfaces().forEach( surface => this.surfaceService.buildSurface( surface ) );

		map.props.forEach( prop => this.buildProp( map, prop ) );

		SceneService.addToMain( map.gameObject );

	}

	buildRoad ( map: TvMap, road: TvRoad ): void {

		const spline = this.findSpline( map, road );

		if ( spline && ( spline.type === SplineType.AUTO || spline.type == SplineType.AUTOV2 ) ) {

			road.spline = spline;

			this.roadService.buildRoad( road );
			this.roadService.setRoadIdCounter( road.id );

		} else if ( road.spline?.type === SplineType.EXPLICIT ) {

			if ( road.sStart === undefined || road.sStart === null ) {
				road.sStart = 0;
			}

			if ( road.spline.getSplineSegments().length == 0 ) {
				road.spline.addRoadSegment( 0, road );
			}

			this.roadService.buildRoad( road );
			this.roadService.setRoadIdCounter( road.id );

		} else {

			map.removeRoad( road );
			TvConsole.error( 'Road spline not found for road id ' + road.id );
			return;
		}


	}

	buildProp ( map: TvMap, prop: PropInstance ) {

		SceneService.addToMain( prop.object );

	}

	findSpline ( scene: TvMap, road: TvRoad ): AbstractSpline {

		return scene.getSplines().find( spline => spline.getSplineSegments().find( segment => segment.id === road.id ) );

	}

}
