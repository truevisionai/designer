import { Injectable } from '@angular/core';
import { RoadStyle } from 'app/core/asset/road.style';
import { GameObject } from 'app/core/game-object';
import { Object3D } from 'three';
import { TvRoad } from '../models/tv-road.model';
import { TvMapBuilder } from './tv-map-builder';
import { RoadObjectBuilder } from 'app/factories/road-object-builder.service';
import { RoadObjectService } from 'app/tools/marking-line/road-object.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadBuilder {

	constructor (
		private roadObjectBuilder: RoadObjectBuilder,
		private roadObjectService: RoadObjectService,
	) { }

	getRoadStyleObject ( roadStyle: RoadStyle ): Object3D {

		const parent = new GameObject();

		const road = new TvRoad( '', 0, 1 );

		road.laneSections.push( roadStyle.laneSection );

		roadStyle.laneSection.road = road;

		road.addGeometryLine( 0, -250, 0, 0, 500 );

		this.buildRoad( road, parent );

		this.roadObjectService.buildRoadObjects( road );

		return parent;
	}

	buildRoad ( road: TvRoad, parent: GameObject ): GameObject {

		return TvMapBuilder.buildRoad( parent, road );

	}

	rebuildRoad ( road: TvRoad ) {

		TvMapBuilder.rebuildRoad( road );

	}

}
