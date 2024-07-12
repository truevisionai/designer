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
	Float32BufferAttribute,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Vector3
} from 'three';
import { JunctionService } from './junction.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvLaneType } from 'app/map/models/tv-common';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneDirectionHelper } from 'app/map/builders/od-lane-direction-builder';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { OdTextures } from 'app/deprecated/od.textures';
import { ISelectable } from "../../objects/i-selectable";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { DebugDrawService } from '../debug/debug-draw.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionDebugService extends BaseDebugger<TvJunction> {

	private meshes = new Object3DArrayMap<TvJunction, Object3D[]>();

	private entries = new Object3DArrayMap<TvJunction, Object3D[]>();

	private maneuvers = new Object3DArrayMap<TvJunction, Object3D[]>();

	public shouldShowManeuvers = true;

	public shouldShowEntries = true;

	constructor ( private junctionService: JunctionService, private debug: DebugDrawService ) {

		super();

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

		this.entries.removeKey( object );
		this.maneuvers.removeKey( object );

		this.showEntries( object );
		this.showManeuvers( object );

	}

	onUnselected ( junction: TvJunction ): void {

		this.entries.removeKey( junction );
		this.maneuvers.removeKey( junction );

	}

	onDefault ( junction: TvJunction ): void {

		if ( this.meshes.has( junction ) ) {
			this.meshes.removeKey( junction );
		}

		const mesh = this.createJunctionMesh( junction );

		this.meshes.addItem( junction, mesh );

		const outline = this.createJunctionOutline( junction );

		if ( outline ) this.meshes.addItem( junction, outline );

	}

	createJunctionOutline ( junction: TvJunction ): Object3D {

		const positions = this.junctionService.junctionBuilder.junctionBoundaryService.getBoundaryPositions( junction );

		if ( positions.length < 2 ) return;

		// add first point to close the loop
		positions.push( positions[ 0 ].clone() );

		const mesh = this.debug.createLine( positions, COLOR.CYAN );

		mesh[ 'tag' ] = 'junction';

		mesh.userData.junction = junction;

		return mesh;

	}

	createJunctionMesh ( junction: TvJunction ) {

		const mesh = this.junctionService.buildJunctionBoundary( junction );

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
		this.entries.removeKey( junction );
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

	private showEntries ( junction: TvJunction ): void {

		if ( !this.shouldShowEntries ) return;

		const roads = junction.getRoads();

		const processFirstSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			const drivingLanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );

			for ( const lane of drivingLanes ) {

				const laneWidth = lane.getWidthValue( laneSection.s );

				const posTheta = road.getLaneCenterPosition( lane, laneSection.s );

				if ( lane.isLeft ) posTheta.hdg += Math.PI;

				const mesh1 = this.debug.createEntryExitBoxMesh( posTheta.toVector3(), posTheta.hdg, laneWidth );

				this.entries.addItem( junction, mesh1 );

			}

		}

		const processLastSection = ( road: TvRoad, laneSection: TvLaneSection ) => {

			const drivingLanes = laneSection.getLaneArray().filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving );

			for ( const lane of drivingLanes ) {

				const laneWidth = lane.getWidthValue( laneSection.endS );

				const posTheta = road.getLaneCenterPosition( lane, laneSection.endS, 0 );

				if ( lane.isLeft ) posTheta.hdg += Math.PI;

				const mesh2 = this.debug.createEntryExitBoxMesh( posTheta.toVector3(), posTheta.hdg, laneWidth );

				this.entries.addItem( junction, mesh2 );

			}

		}

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			if ( road.predecessor?.type == TvRoadLinkType.junction ) {

				processFirstSection( road, road.getFirstLaneSection() );

			}

			if ( road.successor?.type == TvRoadLinkType.junction ) {

				processLastSection( road, road.getLastLaneSection() );

			}

		}

	}

	private createManeuver ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink ) {

		const width = connection.connectingRoad.getFirstLaneSection().getWidthUptoCenter( link.connectingLane, 0 );

		let offset = width;

		if ( link.connectingLane.id < 0 ) offset *= -1;

		const positions = connection.connectingRoad.getReferenceLinePoints( 1, offset );

		if ( positions.length < 2 ) return;

		const mesh = this.createMesh( junction, connection, link, positions );

		mesh[ 'tag' ] = 'link';

		mesh.userData.link = link;

		const distance = connection.connectingRoad.length / 5;

		const arrows = LaneDirectionHelper.drawSingleLane( link.connectingLane, distance, 0.25 );

		arrows.forEach( arrow => mesh.add( arrow ) );

		return mesh;

	}

	private createMesh ( junction: TvJunction, connection: TvJunctionConnection, link: TvJunctionLaneLink, directedPoints: TvPosTheta[], width = 1.0 ) {

		// Early return if not enough positions
		if ( directedPoints.length < 2 ) return;

		const material = new MeshBasicMaterial( {
			color: 0x00ff00,
			opacity: 0.2,
			transparent: true,
			depthTest: false,
			depthWrite: false
		} );

		const geometry: BufferGeometry = this.makeManeuverGeometry( directedPoints, width );

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
		this.entries.clear();
		this.maneuvers.clear();
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
