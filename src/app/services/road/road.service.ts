import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseService } from '../base.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadSplineService } from './road-spline.service';
import { MapService } from '../map.service';
import { AbstractSplineDebugService } from '../debug/abstract-spline-debug.service';
import { TvRoadLinkChild, TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { CommandHistory } from '../command-history';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Material, Mesh, Vector3 } from 'three';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { RoadObjectService } from 'app/tools/marking-line/road-object.service';
import { GameObject } from 'app/core/game-object';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService {

	private opacityObjects = new Map<Mesh, Material>();

	constructor (
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private splineService: AbstractSplineDebugService,
		private baseService: BaseService,
		private roadFactory: RoadFactory,
		private roadObjectService: RoadObjectService
	) {
	}

	get roads (): TvRoad[] {

		return this.mapService.map.getRoads();

	}

	get junctionRoads (): TvRoad[] {

		return this.roads.filter( road => road.isJunction );

	}

	get nonJunctionRoads (): TvRoad[] {

		return this.roads.filter( road => !road.isJunction );

	}

	getRoadCount (): number {

		return this.roads.length;

	}

	removeAllRoads () {

		this.roads.forEach( road => this.removeRoad( road ) );

	}

	getRoad ( roadId: number ) {

		return this.mapService.map.getRoadById( roadId );

	}

	private getNextRoadId (): number {

		return this.roadFactory.getNextRoadId();

	}

	clone ( road: TvRoad, s = 0 ) {

		const clone = road.clone( s );

		clone.id = this.getNextRoadId();

		clone.name = `Road ${ clone.id }`;

		clone.objects.object.forEach( object => object.road = clone );

		return clone;

	}

	createRampRoad ( connectionLane: TvLane ) {

		return this.roadFactory.createRampRoad( connectionLane );

	}

	createSingleLaneRoad ( width: number ) {

		return this.roadFactory.createSingleLaneRoad( width );

	}

	createNewRoad () {

		return this.roadFactory.createNewRoad();

	}

	createDefaultRoad (): TvRoad {

		return this.roadFactory.createDefaultRoad();

	}

	createParkingRoad (): TvRoad {

		return this.roadFactory.createParkingRoad();

	}

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ) {

		const spline = this.roadSplineService.createSplineFromNodes( firstNode, secondNode );

		const joiningRoad = this.roadFactory.createJoiningRoad( spline, firstNode, secondNode );

		spline.addRoadSegment( 0, joiningRoad );

		joiningRoad.spline = spline;

		return joiningRoad;

	}

	showSpline ( road: TvRoad ) {

		this.splineService.show( road.spline );

	}

	hideSpline ( road: TvRoad ) {

		this.splineService.hide( road.spline );

	}

	showControlPoints ( road: TvRoad ) {

		this.splineService.showControlPoints( road.spline );

	}

	hideControlPoints ( road: TvRoad ) {

		this.splineService.hideControlPoints( road.spline );

	}

	updateSplineGeometries ( road: TvRoad ) {

		this.roadSplineService.updateRoadSpline( road.spline );

	}

	rebuildRoad ( road: TvRoad, showNodes = true ): void {

		this.buildSpline( road.spline, showNodes );

	}

	buildRoad ( road: TvRoad ): GameObject[] {

		return this.buildSpline( road.spline, false );

	}

	buildSpline ( spline: AbstractSpline, showNodes = true ): GameObject[] {

		const gameObjects = [];

		if ( spline.controlPoints.length < 2 ) {
			return gameObjects;
		}

		spline.getSplineSegments().forEach( segment => {

			if ( !segment.isRoad ) return;

			const road = this.mapService.map.getRoadById( segment.id );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			// this.updateRoadNodes( road, showNodes );

			const gameObject = this.baseService.rebuildRoad( road );

			gameObjects.push( gameObject );

		} );

		return gameObjects;
	}

	rebuildLink ( link: TvRoadLinkChild ) {

		if ( !link ) return;

		if ( link.isRoad ) {

			this.rebuildLinkedRoad( link );

		} else if ( link.isJunction ) {

			// this.rebuildLinkedJunction( link );

		}

	}

	rebuildLinkedJunction ( link: TvRoadLinkChild ) {

		const junction = this.mapService.map.getJunctionById( link.elementId );

		if ( !junction ) return;

		// console.warn( 'TODO: rebuild junction' );

		for ( const connection of junction.getConnections() ) {

			// this.roadSplineService.updateConnectingRoadSpline( connection );

			// this.rebuildRoad( connection.connectingRoad );

		}

	}

	rebuildLinkedRoad ( link: TvRoadLinkChild ) {

		const road = this.mapService.map.getRoadById( link.elementId );

		if ( !road ) return;

		this.rebuildRoad( road );

	}

	addRoad ( road: TvRoad ) {

		this.mapService.map.addRoad( road );

		this.mapService.map.addSpline( road.spline );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadSplineService.rebuildSplineRoads( road.spline );

		this.mapService.map.gameObject.add( road.gameObject );

	}

	removeRoad ( road: TvRoad, hideHelpers: boolean = true ) {

		if ( hideHelpers ) this.roadSplineService.spline.hideLines( road.spline );

		if ( hideHelpers ) this.roadSplineService.spline.hideControlPoints( road.spline );

		if ( road.isJunction ) {

			road.junctionInstance?.removeConnectingRoad( road );

		}

		this.mapService.map.removeRoad( road );

		road.objects.object.forEach( object => {

			this.roadObjectService.removeObject3d( object );

		} );

		// this.hideRoadNodes( road );

		this.roadSplineService.removeRoadSegment( road );

		this.roadSplineService.rebuildSplineRoads( road.spline );

		this.mapService.map.gameObject.remove( road.gameObject );

		this.roadFactory.idRemoved( road.id );
	}

	duplicateRoad ( road: TvRoad ) {

		const clone = this.clone( road );

		const roadWidth = road.getRoadWidthAt( 0 );

		this.shiftRoad( clone, roadWidth.totalWidth, 0 );

		CommandHistory.execute( new AddObjectCommand( clone ) );

	}

	shiftRoad ( road: TvRoad, x: number, y: number ) {

		const posTheta = road.getStartPosTheta();

		posTheta.rotateDegree( -90 );

		const direction = posTheta.toDirectionVector();

		direction.multiplyScalar( x );

		road.spline.controlPoints.forEach( point => {

			// move in direction of road
			point.position.add( direction );

		} );

	}

	findRoadCoordAtPosition ( position: Vector3 ): TvRoadCoord {

		return TvMapQueries.findRoadCoord( position );

	}

	findLaneAtPosition ( position: Vector3 ): TvLane {

		const roadCoord = this.findRoadCoordAtPosition( position );

		if ( !roadCoord ) return;

		const laneSection = roadCoord.road.getLaneSectionAt( roadCoord.s );

		const t = roadCoord.t;

		const lanes = laneSection.lanes;

		let targetLane: TvLane;

		const isLeft = t > 0;
		const isRight = t < 0;

		if ( Math.abs( t ) < 0.1 ) {
			return laneSection.getLaneById( 0 );
		}

		for ( const [ id, lane ] of lanes ) {

			// logic to skip left or right lanes depending on t value
			if ( isLeft && lane.isRight ) continue;
			if ( isRight && lane.isLeft ) continue;

			const startT = laneSection.getWidthUptoStart( lane, roadCoord.s );
			const endT = laneSection.getWidthUptoEnd( lane, roadCoord.s );

			if ( Math.abs( t ) > startT && Math.abs( t ) < endT ) {
				return lane;
			}

		}

		return targetLane;

	}

	getRoadMesh ( road: TvRoad ) {

		return road.gameObject;

	}

	createConnectionRoad ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ): TvRoad {

		const road = this.createNewRoad();

		road.spline = this.roadSplineService.createConnectingRoadSpline( road, incoming, outgoing );

		road.setJunction( junction );

		road.setPredecessor( TvRoadLinkChildType.road, incoming.road, incoming.contact );

		road.setSuccessor( TvRoadLinkChildType.road, outgoing.road, outgoing.contact );

		return road;

	}

	setMapOpacity ( opacity: number ) {

		const objects = this.roads.map(
			road => road.laneSections.map(
				laneSection => laneSection.getLaneArray().map(
					lane => lane.gameObject ) ) ).flat( 2 );

		objects
			.filter( mesh => mesh instanceof Mesh )
			.filter( mesh => !this.opacityObjects.has( mesh ) )
			.forEach( mesh => {

				let material: Material;

				if ( mesh.material instanceof Material ) {

					material = mesh.material;

				} else if ( mesh.material instanceof Array ) {

					material = mesh.material[ 0 ];

				}

				this.opacityObjects.set( mesh, material );

				const clone = material.clone();

				clone.transparent = opacity < 1.0;
				clone.opacity = opacity;
				clone.needsUpdate = true;

				mesh.material = clone;

			} );

	}

	resetMapOpacity () {

		this.opacityObjects.forEach( ( originalMaterial, mesh ) => {

			mesh.material = originalMaterial;

		} );

		this.opacityObjects.clear();

	}

	setRoadIdCounter ( id: number ) {

		return this.roadFactory.getNextRoadId( id );

	}

}
