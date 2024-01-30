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

	init () {

		MapEvents.mapLoaded.subscribe( e => this.onMapLoaded( e ) );
		MapEvents.mapRemoved.subscribe( e => this.onMapRemoved( e ) );

	}

	onMapLoaded ( map: TvMap ): void {

		if ( this.debug ) console.debug( "onMapLoaded", map );

	}

	onMapRemoved ( map: TvMap ): void {

		if ( this.debug ) console.debug( "onMapRemoved", map );

		map.roads.forEach( road => {

			road.remove( map.gameObject );

		} );

		map.propCurves.forEach( curve => {

			curve.props.forEach( prop => SceneService.removeFromMain( prop ) );

		} );

		map.propPolygons.forEach( polygon => {

			polygon.spline?.controlPoints.forEach( point => SceneService.removeFromMain( point ) );

		} );

		map.props.forEach( prop => {

			// SceneService.remove( prop.object );
			SceneService.removeFromMain( prop );

			// this.gameObject.remove( prop.object );
			map.gameObject.remove( prop );

		} );

		map.roads.clear();

		map.junctions.clear();

		map.props.splice( 0, map.props.length );

		map.propCurves.splice( 0, map.propCurves.length );

		map.propPolygons.splice( 0, map.propPolygons.length );

		map.surfaces.splice( 0, map.surfaces.length );

	}

}
