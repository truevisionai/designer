import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvDynamicTypes, TvOrientation, TvUnit } from 'app/modules/tv-map/models/tv-common';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSignalFactory {

	constructor () { }

	createRoadSignal ( coord: TvRoadCoord, name: string, type: string = 'truevision', subtype: string = 'stop' ) {

		const signal = new TvRoadSignal( coord.s, coord.t, coord.road.getRoadSignalCount(), name );

		signal.type = type;
		signal.subtype = subtype;
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = name;
		signal.text = name;
		signal.orientations = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.NONE;
		signal.value = null;
		signal.height = 2.0;
		signal.width = 0.7;

		return signal;

	}

	createSignalFromAsset ( asset: AssetNode, coord: TvRoadCoord, name: string, type: string = 'truevision', subtype: string = 'stop' ) {

		const signal = new TvRoadSignal( coord.s, coord.t, coord.road.getRoadSignalCount(), name );

		signal.type = type;
		signal.subtype = subtype;
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = name;
		signal.text = name;
		signal.orientations = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.NONE;
		signal.value = null;
		signal.height = 2.0;
		signal.width = 0.7;

		signal.assetGuid = asset.guid;

		return signal;

	}

	createTextRoadMarking ( coord: TvRoadCoord, text: string ) {

		const signal = new TvRoadSignal( coord.s, coord.t, coord.road.getRoadSignalCount(), text );

		signal.type = 'roadMark';
		signal.subtype = 'text';
		signal.dynamic = TvDynamicTypes.NO;
		signal.name = text;
		signal.text = text;
		signal.orientations = coord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;
		signal.zOffset = 0.005;
		signal.country = 'OpenDRIVE';
		signal.roadId = coord.road.id;
		signal.unit = TvUnit.T;
		signal.value = 0.8;

		return signal;
	}
}
