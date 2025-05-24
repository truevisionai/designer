/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { DebugState } from '../debug/debug-state';
import { Object3DArrayMap } from 'app/core/models/object3d-array-map';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector2 } from "three";
import { ColorUtils } from 'app/views/shared/utils/colors.service';
import { TvContactPoint, TvLaneType } from 'app/map/models/tv-common';
import { TvLink, TvLinkType } from 'app/map/models/tv-link';
import { LinkFactory } from 'app/map/models/link-factory';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugDrawService } from '../debug/debug-draw.service';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { MapService } from '../map/map.service';
import { Log } from 'app/core/utils/log';
import { RoadWidthService } from '../road/road-width.service';
import { JunctionDebugFactory } from './junction-debug.factory';
import { ManeuverMesh } from './maneuver-mesh';
import { JunctionNode } from './junction-node';
import { JunctionRoadService } from './junction-road.service';
import { JunctionOverlay } from './junction-overlay';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadDistance } from 'app/map/road/road-distance';
import { createGeometryFromBoundary } from 'app/modules/builder/builders/junction-boundary.builder';
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';
import { Color } from 'app/core/maths';
import { Environment } from 'app/core/utils/environment';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionDebugService extends BaseDebugger<TvJunction> {

	private nodes = new Object3DArrayMap<TvRoad, Object3D[]>();

	private meshes = new Object3DArrayMap<TvJunction, Object3D[]>();

	private gates = new Object3DArrayMap<TvJunction, Object3D[]>();

	private maneuvers = new Object3DArrayMap<TvJunction, ManeuverMesh[]>();

	public shouldShowManeuvers = true;

	public shouldShowEntries = true;

	public shouldShowOutline = false;

	constructor (
		private debug: DebugDrawService,
		private mapService: MapService,
		private junctionRoadService: JunctionRoadService,
		private junctionDebugFactory: JunctionDebugFactory,
	) {
		super();
	}

	enable (): void {

		super.enable();

		this.mapService.nonJunctionRoads.forEach( road => this.showNodes( road ) );

	}

	findMesh ( junction: TvJunction, connectingRoad: TvRoad ): ManeuverMesh | undefined {

		const maneuvers = this.maneuvers.getItems( junction ) as ManeuverMesh[];

		if ( !maneuvers ) return;

		return maneuvers.find( maneuver => maneuver.connection.connectingRoad === connectingRoad );

	}

	findMeshBySpline ( spline: AbstractSpline ): ManeuverMesh | undefined {

		const connectingRoad = spline.getRoadSegments()[ 0 ];

		return this.findMesh( connectingRoad.junction, connectingRoad );

	}

	addManeuver ( junction: TvJunction, maneuver: ManeuverMesh ): void {

		this.maneuvers.addItem( junction, maneuver );

	}

	removeManeuver ( junction: TvJunction, maneuver: ManeuverMesh ): void {

		this.maneuvers.removeItem( junction, maneuver );

	}

	setDebugState ( junction: TvJunction, state: DebugState ): void {

		if ( !junction ) return;

		this.setBaseState( junction, state );
	}

	onHighlight ( junction: TvJunction ): void {

		console.warn( 'Method not implemented.' );

	}

	onUnhighlight ( junction: TvJunction ): void {

		console.warn( 'Method not implemented.' );

	}

	onSelected ( object: TvJunction ): void {

		this.gates.removeKey( object );
		this.maneuvers.removeKey( object );

		this.showEntries( object );
		this.showManeuvers( object );

	}

	onUnselected ( junction: TvJunction ): void {

		this.gates.removeKey( junction );
		this.maneuvers.removeKey( junction );

	}

	onDefault ( junction: TvJunction ): void {

		if ( this.meshes.has( junction ) ) {
			this.meshes.removeKey( junction );
		}

		const mesh = this.createJunctionOverlay( junction );

		this.meshes.addItem( junction, mesh );

		if ( this.shouldShowOutline ) this.showOutline( junction );

	}

	createJunctionOutline ( junction: TvJunction ): Object3D {

		if ( !junction.outerBoundary ) {
			Log.warn( 'OuterBoundaryMissing', junction?.toString() );
			junction.updateBoundary();
		}

		const geometry = junction.mesh?.geometry.clone() || new BoxGeometry();

		const mesh = new Mesh( geometry, new MeshBasicMaterial( { color: ColorUtils.YELLOW } ) );

		mesh[ 'tag' ] = 'junction';

		mesh.userData.junction = junction;

		return mesh;


	}

	createJunctionOverlay ( junction: TvJunction ): JunctionOverlay {

		const geometry = createGeometryFromBoundary( junction.outerBoundary );

		// this.debugBoundary( junction.outerBoundary );

		return JunctionOverlay.create( junction, geometry );

	}

	onRemoved ( junction: TvJunction ): void {

		this.meshes.removeKey( junction );
		this.gates.removeKey( junction );
		this.maneuvers.removeKey( junction );

	}

	showGateLines ( junction: TvJunction ): void {

		for ( const laneCoord of this.junctionRoadService.getJunctionGates( junction ) ) {

			const line = this.junctionDebugFactory.createJunctionGateLine( junction, laneCoord );

			this.gates.addItem( junction, line );

		}

	}

	removeGateLines ( junction: TvJunction ): void {

		this.gates.removeKey( junction );

	}

	showManeuvers ( junction: TvJunction ): void {

		if ( !this.shouldShowManeuvers ) return;

		junction.getConnections().forEach( connection => {

			connection.getLaneLinks().forEach( link => {

				if ( Environment.production ) {
					if ( link.connectingLane.isDrivingLane ) {
						return;
					}
				}

				const maneuverMesh = this.createManeuver( junction, connection, link );

				this.addManeuver( junction, maneuverMesh );

			} );

		} );

	}

	removeManeuvers ( junction: TvJunction ): void {

		this.maneuvers.removeKey( junction );

	}

	showOutline ( junction: TvJunction ): void {

		const outline = this.createJunctionOutline( junction );

		if ( outline ) this.meshes.addItem( junction, outline );

	}

	showNodes ( road: TvRoad ): void {

		if ( road.isJunction ) return;

		if ( !road.predecessor || road.predecessor.isJunction ) {

			const startNode = this.createJunctionNode( LinkFactory.createRoadLink( road, TvContactPoint.START ) );

			this.nodes.addItem( road, startNode );

		}

		if ( !road.successor || road.successor.isJunction ) {

			const endNode = this.createJunctionNode( LinkFactory.createRoadLink( road, TvContactPoint.END ) );

			this.nodes.addItem( road, endNode );

		}

	}

	createJunctionNode ( link: TvLink ): JunctionNode {

		const roadCoord = link.toRoadCoord();

		const result = RoadWidthService.instance.findRoadWidthAt( roadCoord.road, roadCoord.s );

		const start = roadCoord.road.getPosThetaAt( roadCoord.s, result.leftSideWidth );

		const end = roadCoord.road.getPosThetaAt( roadCoord.s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		const lineMaterial = new LineMaterial( {
			color: ColorUtils.CYAN,
			linewidth: 6,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
			depthTest: false,
			depthWrite: false,
		} );

		const junctionNode = new JunctionNode( link, lineGeometry, lineMaterial );

		junctionNode.name = 'DebugDrawService.createRoadWidthLine';

		junctionNode[ 'tag' ] = JunctionNode.tag;

		junctionNode.renderOrder = 3;

		return junctionNode;
	}

	showEntries ( junction: TvJunction ): void {

		if ( !this.shouldShowEntries ) return;

		const roads = junction.getIncomingRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			if ( road.predecessor?.equals( junction ) ) {
				this.addEntriesAt( junction, road, TvContactPoint.START );
			}

			if ( road.successor?.equals( junction ) ) {
				this.addEntriesAt( junction, road, TvContactPoint.END );
			}

		}

	}

	private addEntriesAt ( junction: TvJunction, road: TvRoad, contact: TvContactPoint ): void {

		const laneSection = road.getLaneProfile().getLaneSectionAtContact( contact );

		const distance = contact === TvContactPoint.START ? laneSection.s : laneSection.endS;

		const distanceFromPosition = contact === TvContactPoint.START ? +2 : -2;

		for ( const lane of laneSection.getDrivingLanes() ) {

			const posTheta = road.getLaneCenterPosition( lane, distance as RoadDistance ).moveForward( distanceFromPosition );

			const gate = this.debug.createJunctionGate( road, laneSection, lane, contact, posTheta.toVector3() );

			this.gates.addItem( junction, gate );

		}

	}

	removeEntries ( junction: TvJunction ): void {

		this.gates.removeKey( junction );

	}

	createManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ): ManeuverMesh {

		return this.junctionDebugFactory.createManeuverMesh( junction, connection, link );

	}

	updateManeuver ( mesh: ManeuverMesh ): void {

		this.junctionDebugFactory.updateManeuverMesh( mesh );

	}

	clear (): void {

		super.clear();

		this.meshes.clear();

		this.gates.clear();

		this.maneuvers.clear();

		this.nodes.clear();

	}

	private debugBoundary ( boundary: TvJunctionBoundary, color: number = ColorUtils.RED ): void {

		boundary.getSegments().forEach( segment => {

			const white = new Color( 1, 1, 1 );

			segment.getOuterPoints().forEach( ( position, index ) => {

				// as the index grows, make the white color will get darker
				const color = white.clone().multiplyScalar( 1 - index / 10 );

				this.debug.drawText( index.toString(), position.toVector3(), 0.2, color.getHex() );

			} )

		} )

	}

}
