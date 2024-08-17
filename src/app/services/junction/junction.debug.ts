/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { DebugState } from '../debug/debug-state';
import { Object3DArrayMap } from 'app/core/models/object3d-array-map';
import {
	BoxGeometry,
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Vector2,
	Vector3
} from 'three';
import { JunctionService } from './junction.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvContactPoint, TvLaneType } from 'app/map/models/tv-common';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneDirectionHelper } from 'app/map/builders/od-lane-direction-builder';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { Highlightable, ISelectable } from "../../objects/i-selectable";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugDrawService } from '../debug/debug-draw.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { MapService } from '../map/map.service';
import { JunctionManager } from 'app/managers/junction-manager';
import { GeometryUtils } from '../surface/geometry-utils';
import { MapQueryService } from 'app/map/queries/map-query.service';
import { Log } from 'app/core/utils/log';
import { RoadGeometryService } from '../road/road-geometry.service';

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
		private junctionService: JunctionService,
		private debug: DebugDrawService,
		private mapService: MapService,
		private junctionManager: JunctionManager,
		private queryService: MapQueryService,
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

	addManeuver ( junction: TvJunction, maneuver: ManeuverMesh ) {

		this.maneuvers.addItem( junction, maneuver );

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

		const mesh = this.createJunctionMesh( junction );

		this.meshes.addItem( junction, mesh );

		if ( this.shouldShowOutline ) this.showOutline( junction );

	}

	createJunctionOutline ( junction: TvJunction ): Object3D {

		if ( !junction.outerBoundary ) {
			Log.warn( 'OuterBoundaryMissing', junction?.toString() );
			this.junctionManager.boundaryManager.update( junction );
		}

		const positions = this.junctionService.junctionBuilder.boundaryBuilder.convertBoundaryToPositions( junction.outerBoundary );

		if ( positions.length < 2 ) return;

		// add first point to close the loop
		positions.push( positions[ 0 ].clone() );

		const mesh = this.debug.createLine( positions, COLOR.CYAN );

		mesh[ 'tag' ] = 'junction';

		mesh.userData.junction = junction;

		return mesh;

	}

	createJunctionMesh ( junction: TvJunction ) {

		if ( !junction.innerBoundary ) {
			Log.warn( 'InnerBoundaryMissing', junction?.toString() );
			this.junctionManager.boundaryManager.update( junction );
		}

		const mesh = this.junctionService.junctionBuilder.buildFromBoundary( junction );

		( mesh.material as MeshBasicMaterial ).color.set( COLOR.CYAN );
		( mesh.material as MeshBasicMaterial ).depthTest = false;
		( mesh.material as MeshBasicMaterial ).transparent = true;
		( mesh.material as MeshBasicMaterial ).opacity = 0.2;
		( mesh.material as MeshBasicMaterial ).needsUpdate = true;

		mesh[ 'tag' ] = 'junction';
		mesh.userData.junction = junction;

		return mesh;
	}

	onRemoved ( junction: TvJunction ): void {

		this.meshes.removeKey( junction );
		this.gates.removeKey( junction );
		this.maneuvers.removeKey( junction );

	}

	showManeuvers ( junction: TvJunction ) {

		if ( !this.shouldShowManeuvers ) return;

		junction.connections.forEach( connection => {

			connection.laneLink.forEach( link => {

				if ( link.connectingLane.type != TvLaneType.driving ) return;

				const maneuverMesh = this.createManeuver( junction, connection, link );

				this.maneuvers.addItem( junction, maneuverMesh );

			} );

		} );

	}

	showOutline ( junction: TvJunction ) {

		const outline = this.createJunctionOutline( junction );

		if ( outline ) this.meshes.addItem( junction, outline );

	}

	showNodes ( road: TvRoad ) {

		if ( road.isJunction ) return;

		if ( !road.predecessor || road.predecessor.isJunction ) {

			const startNode = this.createJunctionNode( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.START ) );

			this.nodes.addItem( road, startNode );

		}

		if ( !road.successor || road.successor.isJunction ) {

			const endNode = this.createJunctionNode( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.END ) );

			this.nodes.addItem( road, endNode );

		}

	}

	private createJunctionNode ( link: TvRoadLink ): JunctionNode {

		const roadCoord = link.toRoadCoord();

		const result = roadCoord.road.getLaneProfile().getRoadWidthAt( roadCoord.s );

		const start = roadCoord.road.getPosThetaAt( roadCoord.s, result.leftSideWidth );

		const end = roadCoord.road.getPosThetaAt( roadCoord.s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		const lineMaterial = new LineMaterial( {
			color: COLOR.CYAN,
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

	private showEntries ( junction: TvJunction ): void {

		if ( !this.shouldShowEntries ) return;

		const roads = junction.getRoads();

		const processFirstSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			if ( !road.predecessor ) return;

			if ( road.predecessor.element != junction ) return;

			const drivingLanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );

			for ( const lane of drivingLanes ) {

				// const laneWidth = lane.getWidthValue( laneSection.s );

				const posTheta = road.getLaneCenterPosition( lane, laneSection.s + 1 );

				// if ( lane.isLeft ) posTheta.hdg += Math.PI;

				const gate = this.debug.createJunctionGate( road, laneSection, lane, TvContactPoint.START, posTheta.toVector3() );

				this.gates.addItem( junction, gate );

			}

		}

		const processLastSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			if ( !road.successor ) return;

			if ( road.successor.element != junction ) return;

			const drivingLanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );

			for ( const lane of drivingLanes ) {

				// const laneWidth = lane.getWidthValue( laneSection.endS );

				const posTheta = road.getLaneCenterPosition( lane, laneSection.endS - 1, 0 );

				// if ( lane.isLeft ) posTheta.hdg += Math.PI;

				const gate = this.debug.createJunctionGate( road, laneSection, lane, TvContactPoint.END, posTheta.toVector3() );

				this.gates.addItem( junction, gate );

			}

		}

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			if ( road.predecessor?.type == TvRoadLinkType.JUNCTION ) {

				processFirstSection( road, road.getLaneProfile().getFirstLaneSection() );

			}

			if ( road.successor?.type == TvRoadLinkType.JUNCTION ) {

				processLastSection( road, road.getLaneProfile().getLastLaneSection() );

			}

		}

	}

	createManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const width = connection.connectingRoad.getLaneProfile().getFirstLaneSection().getWidthUptoCenter( link.connectingLane, 0 );

		let offset = width;

		if ( link.connectingLane.id < 0 ) offset *= -1;

		const mesh = this.createMesh( junction, connection, link );

		mesh[ 'tag' ] = 'link';

		mesh.userData.link = link;

		const distance = connection.connectingRoad.length / 5;

		const arrows = LaneDirectionHelper.drawSingleLane( link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => mesh.add( arrow ) );

		return mesh;

	}

	private createMesh ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const material = new MeshBasicMaterial( {
			color: 0x00ff00,
			opacity: 0.2,
			transparent: true,
			depthTest: false,
			depthWrite: false
		} );

		const points: Vector3[] = [];

		for ( let s = 0; s <= connection.connectingRoad.length; s += 0.1 ) {

			const laneSection = connection.connectingRoad.getLaneProfile().getLaneSectionAt( s );

			const position = RoadGeometryService.instance.findLaneCenterPosition( connection.connectingRoad, laneSection, link.connectingLane, s );

			points.push( position.position );

		}

		if ( points.length < 2 ) {
			Log.error( 'Not enough points to create maneuver mesh', link.toString() );
			return new ManeuverMesh( junction, connection, link, new BufferGeometry(), material );
		}

		const geometry: BufferGeometry = GeometryUtils.createExtrudeGeometry( points );

		return new ManeuverMesh( junction, connection, link, geometry, material );
	}

	makeManeuverGeometry ( directedPoints: TvPosTheta[], width: number ): BufferGeometry {

		// Calculate width offset based on lane ID
		let offset = width * 0.5;

		// Create vertices array
		const vertices = [];
		const indices = []; // For faces

		directedPoints.forEach( point => {

			const left = point.clone().addLateralOffset( -offset );
			const right = point.clone().addLateralOffset( offset );

			// Push vertices for both left and right positions
			vertices.push( left.x, left.y, left.z + 0.1 );
			vertices.push( right.x, right.y, right.z + 0.1 );

		} );

		for ( let i = 0; i < vertices.length / 3 - 2; i += 2 ) {
			/// First triangle (reversed winding order)
			indices.push( i, i + 2, i + 1 );
			// Second triangle (reversed winding order)
			indices.push( i + 1, i + 2, i + 3 );
		}

		const geometry = new BufferGeometry();

		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setIndex( indices );

		return geometry;
	}

	clear () {

		super.clear();

		this.meshes.clear();

		this.gates.clear();

		this.maneuvers.clear();

		this.nodes.clear();

	}
}

export class ManeuverMesh extends Mesh implements ISelectable {

	isSelected: boolean;

	tag = 'link';

	constructor (
		public junction: TvJunction,
		public connection: TvJunctionConnection,
		public link: TvJunctionLaneLink,
		geometry: BufferGeometry,
		material: Material
	) {
		super( geometry, material );
	}

	select (): void {
		this.material[ 'color' ].set( COLOR.RED );
	}

	unselect (): void {
		this.material[ 'color' ].set( COLOR.GREEN );
	}

}


export class JunctionNode extends Line2 implements ISelectable, Highlightable {

	static tag = 'JunctionNode'
	tag = 'JunctionNode'
	isSelected: boolean;
	defaulColor = COLOR.CYAN;

	constructor ( public link: TvRoadLink, geometry?: LineGeometry, material?: LineMaterial ) {
		super( geometry, material );
	}

	select () {
		this.isSelected = true;
		this.material.color = new Color( COLOR.RED );
		this.renderOrder = 5;
	}

	unselect () {
		this.isSelected = false;
		this.material.color = new Color( this.defaulColor );
		this.renderOrder = 3;
	}

	onMouseOver () {
		if ( this.isSelected ) return;
		this.material.color = new Color( COLOR.YELLOW );
		this.material.needsUpdate = true;
	}

	onMouseOut () {
		if ( this.isSelected ) return;
		this.material.color = new Color( this.defaulColor );
		this.material.needsUpdate = true;
	}
}
