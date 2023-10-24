import { MapEvents } from "app/events/map-events";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { SceneService } from "../services/scene.service";

export class MapManager {

	private static _instance = new MapManager();
	private debug = true;

	static get instance (): MapManager {
		return this._instance;
	}

	private constructor () {

		MapEvents.mapLoaded.subscribe( e => this.onMapLoaded( e ) );
		MapEvents.mapRemoved.subscribe( e => this.onMapRemoved( e ) );

	}

	onMapLoaded ( map: TvMap ): void {

		if ( this.debug ) console.debug( "onMapLoaded", map );

	}

	onMapRemoved ( map: TvMap ): void {

		if ( this.debug ) console.debug( "onMapRemoved", map );

		map.roads.forEach( road => {

			road.objects.object.forEach( object => SceneService.removeFromMain( object ) );

			road.remove( map.gameObject );

		} );

		map.surfaces.forEach( surface => map.gameObject.remove( surface.mesh ) );

		map.propCurves.forEach( curve => {

			curve.delete();

			curve.props.forEach( prop => SceneService.removeFromMain( prop ) );

		} );

		map.propPolygons.forEach( polygon => {

			polygon.delete();

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

	init () {

		// do nothing

	}

}
