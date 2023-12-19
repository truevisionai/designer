import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvContactPoint, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../scene.service';
import { BaseService } from '../base.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadSplineService } from './road-spline.service';
import { RoadLinkService } from './road-link.service';
import { DynamicControlPoint } from "../../modules/three-js/objects/dynamic-control-point";
import { TvPosTheta } from "../../modules/tv-map/models/tv-pos-theta";
import { MapService } from '../map.service';
import { SplineService } from '../spline.service';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
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
import { RoadSegmentType } from 'app/core/shapes/RoadSegment';

@Injectable( {
	providedIn: 'root'
} )
export class RoadService {

	private static nodes: RoadNode[] = [];

	private opacityObjects = new Map<Mesh, Material>();

	private static cornerPoints: DynamicControlPoint<TvRoad>[] = [];

	constructor (
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private roadLinkService: RoadLinkService,
		private splineService: SplineService,
		private baseService: BaseService,
		private roadFactory: RoadFactory,
		private roadObjectService: RoadObjectService
	) {
	}

	get roads (): TvRoad[] {

		return this.mapService.map.getRoads();

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

	hideAllRoadNodes () {

		this.roads.forEach( road => this.hideRoadNodes( road ) );

	}

	showAllRoadNodes () {

		this.roads.filter( road => !road.isJunction ).forEach( road => this.showRoadNodes( road ) );

	}

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ) {

		const spline = this.roadSplineService.createSplineFromNodes( firstNode, secondNode );

		const joiningRoad = this.roadFactory.createJoiningRoad( spline, firstNode, secondNode );

		this.roadLinkService.linkRoads( firstNode, secondNode, joiningRoad );

		spline.addRoadSegment( 0, joiningRoad.id );

		joiningRoad.spline = spline;

		return joiningRoad;

	}

	showRoadNodes ( road: TvRoad ) {

		this.hideRoadNodes( road );

		this.createRoadNode( road, TvContactPoint.START );
		this.createRoadNode( road, TvContactPoint.END );

	}

	hideRoadNodes ( road: TvRoad ) {

		RoadService.nodes.filter( node => node.roadId == road.id ).forEach( node => {

			SceneService.removeFromTool( node );

		} );

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

	updateRoadNodes ( road: TvRoad, show = true ) {

		this.hideRoadNodes( road );

		if ( show ) this.showRoadNodes( road );

	}

	// updateSplineRoads ( spline: AbstractSpline ) {

	// 	spline.updateRoadSegments();

	// 	spline.getRoadSegments().forEach( segment => {

	// 		if ( segment.roadId == -1 ) return;

	// 		const road = this.mapService.map.getRoadById( segment.roadId );

	// 		if ( road ) {

	// 			road.clearGeometries();

	// 			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

	// 		}

	// 	} );

	// }

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

		spline.getRoadSegments().forEach( segment => {

			if ( !segment.isRoad ) return;

			const road = this.mapService.map.getRoadById( segment.id );

			road.clearGeometries();

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			this.updateRoadNodes( road, showNodes );

			const gameObject = this.baseService.rebuildRoad( road );

			gameObjects.push( gameObject );

		} );

		return gameObjects;
	}

	private createRoadNode ( road: TvRoad, contact: TvContactPoint ): RoadNode {

		const node = new RoadNode( road, contact );

		SceneService.addToolObject( node );

		RoadService.nodes.push( node );

		return node;

	}

	showCornerPoints ( road: TvRoad, ) {

		this.createCornerPoint( road, road.getStartCoord() );
		this.createCornerPoint( road, road.getEndCoord() );

	}

	hideCornerPoints ( road: TvRoad ) {

		RoadService.cornerPoints
			.filter( point => point.mainObject.id == road.id )
			.forEach( point => {

				SceneService.removeFromTool( point );

			} );

	}

	createCornerPoint ( road: TvRoad, coord: TvPosTheta ) {

		const rightT = road.getRightsideWidth( coord.s );
		const leftT = road.getLeftSideWidth( coord.s );

		const leftPosition = coord.clone().addLateralOffset( leftT ).toVector3();
		const rightPosition = coord.clone().addLateralOffset( -rightT ).toVector3();

		const leftPoint = new DynamicControlPoint( road, leftPosition );
		const rightPoint = new DynamicControlPoint( road, rightPosition );

		RoadService.cornerPoints.push( leftPoint );
		RoadService.cornerPoints.push( rightPoint );

		SceneService.addToolObject( leftPoint );
		SceneService.addToolObject( rightPoint );

	}

	showAllCornerPoints () {

		this.mapService.map.getRoads().forEach( road => {

			this.showCornerPoints( road );

		} );

	}

	hideAllCornerPoints () {

		this.mapService.map.getRoads().forEach( road => {

			this.hideCornerPoints( road );

		} );

	}

	rebuildLinks ( road: TvRoad, controlPoint: AbstractControlPoint ) {

		this.roadLinkService.updateLinks( road, controlPoint, true );

		this.rebuildLink( road.predecessor );

		this.rebuildLink( road.successor );

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

	divideRoadAt ( road: TvRoad, s: number ) {

		const clone = road.clone( s );

		clone.id = this.getNextRoadId();

		clone.sStart = road.sStart + s;

		return clone

	}

	cutRoadFromTo ( road: TvRoad, sStart: number, sEnd: number, segmentId = -1, segmentType = RoadSegmentType.NONE ): TvRoad {

		if ( sStart >= sEnd ) {
			throw new Error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 || sEnd < 0 ) {
			throw new Error( 'Start/End must be greater than 0' );
			return;
		}

		if ( sStart > road.length ) {
			throw new Error( 'Start must be less than road length' );
			return;
		}

		road.spline.addSegmentSection( sStart, segmentId, segmentType );

		if ( sEnd > road.length ) {
			// throw new Error( 'End must be less than road length' );
			return;
		}

		const newRoad = this.clone( road, sEnd );

		road.spline.addRoadSegment( sEnd, newRoad.id );

		// update links

		if ( road.successor?.isRoad ) {

			const successor = this.roadLinkService.getElement<TvRoad>( road.successor );

			successor.setPredecessorRoad( newRoad, TvContactPoint.END );

			newRoad.successor = road.successor;

			// TODO: this will be junction and not null
			road.successor = null;

		}

		// TODO: this will be junction and not null
		newRoad.predecessor = null;

		road.length = sStart - road.sStart;

		return newRoad;

	}

	addRoad ( road: TvRoad ) {

		this.mapService.map.addRoad( road );

		this.roadSplineService.addRoadSegment( road );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.roadSplineService.rebuildSplineRoads( road.spline );

		// this.updateRoadNodes( road );
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

		this.hideRoadNodes( road );

		this.roadLinkService.removeLinks( road );

		this.roadSplineService.removeRoadSegment( road );

		this.roadSplineService.rebuildSplineRoads( road.spline );

		this.mapService.map.gameObject.remove( road.gameObject );

	}

	duplicateRoad ( road: TvRoad ) {

		const clone = this.clone( road );

		const roadWidth = road.getRoadWidthAt( 0 );

		this.shiftRoad( clone, roadWidth.totalWidth, 0 );

		CommandHistory.execute( new AddObjectCommand( clone ) );

	}

	shiftRoad ( road: TvRoad, x: number, y: number ) {

		const posTheta = road.getStartCoord();

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

		road.setPredecessor( TvRoadLinkChildType.road, incoming.road.id, incoming.contact );

		road.setSuccessor( TvRoadLinkChildType.road, outgoing.road.id, outgoing.contact );

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
