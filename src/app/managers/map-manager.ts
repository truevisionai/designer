/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from "app/events/map-events";
import { TvMap } from "app/map/models/tv-map.model";
import { SceneService } from "../services/scene.service";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class MapManager {

	private debug = true;

	constructor () {

	}

	init (): void {

		MapEvents.mapRemoved.subscribe( e => this.onMapRemoved( e ) );

	}

	onMapRemoved ( map: TvMap ): void {

		if ( this.debug ) console.debug( "onMapRemoved", map );

		map.getRoads().forEach( road => {

			map.gameObject.remove( road.gameObject );

			road.getLaneProfile().getLaneSections().forEach( laneSection => {

				if ( road.gameObject ) road.gameObject.remove( laneSection.gameObject );

				if ( road.gameObject ) laneSection.getLanes().forEach( lane => laneSection.gameObject.remove( lane.gameObject ) );

			} );

		} );

		map.propCurves.forEach( curve => {

			curve.props.forEach( prop => SceneService.removeFromMain( prop ) );

		} );

		map.propPolygons.forEach( polygon => {

			polygon.spline?.getControlPoints().forEach( point => SceneService.removeFromMain( point ) );

		} );

		map.getProps().forEach( prop => {

			// SceneService.remove( prop.object );
			SceneService.removeFromMain( prop );

			// this.gameObject.remove( prop.object );
			map.gameObject.remove( prop );

		} );

		map.clear();

	}

}
