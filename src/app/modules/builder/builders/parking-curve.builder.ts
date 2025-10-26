/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Group, Object3D } from "three";
import { MeshBuilder } from "../../../core/builders/mesh.builder";
import { AssetService } from "app/assets/asset.service";
import { ParkingCurve } from "app/map/parking/parking-curve";
import { ParkingRegion } from "app/map/parking/parking-region";
import * as THREE from "three";
import { EdgeMarkingColor, EdgeMarkingStyle, ParkingEdge } from "app/map/parking/parking-edge";

@Injectable()
export class ParkingCurveBuilder extends MeshBuilder<ParkingCurve> {

	constructor (
		private assetService: AssetService,
		private regionBuilder: ParkingRegionBuilder,
	) {
		super();
	}

	build ( curve: ParkingCurve ): Object3D {

		const group = new Group();

		if ( curve.getControlPoints().length < 2 ) return group;

		const regions = curve.generatePreviewRegions();

		regions.forEach( region => {

			const regionMesh = this.regionBuilder.build( region );

			if ( regionMesh ) group.add( regionMesh );

		} );

		return group;
	}
}



@Injectable()
export class ParkingRegionBuilder extends MeshBuilder<ParkingRegion> {

	// Default material configurations
	private readonly WHITE_MARKING = 0xFFFFFF;
	private readonly YELLOW_MARKING = 0xFFFF00;
	private readonly BLUE_MARKING = 0x0066FF;
	private readonly RED_MARKING = 0xFF0000;
	private readonly GREEN_MARKING = 0x00FF00;

	constructor (
		private assetService: AssetService,
	) {
		super();
	}

	build ( region: ParkingRegion ): Object3D {

		const group = new Group();

		region.getEdges().forEach( edge => {

			if ( !( edge instanceof ParkingEdge ) ) return;

			if ( !edge.shouldRenderMarking() ) return;

			const mesh = this.buildEdgeMesh( edge );

			if ( mesh ) group.add( mesh );

		} );

		return group;
	}

	buildEdgeMesh ( edge: ParkingEdge ): Object3D {

		const style = edge.getMarkingStyle();

		switch ( style ) {

			case EdgeMarkingStyle.SOLID:
				return this.buildSolidLine( edge );

			case EdgeMarkingStyle.DASHED:
				return this.buildDashedLine( edge );

			case EdgeMarkingStyle.SOLID_SOLID:
				return this.buildDoubleLine( edge );

			case EdgeMarkingStyle.NONE:
				return null;

			default:
				return this.buildSolidLine( edge );
		}
	}

	private buildSolidLine ( edge: ParkingEdge ): THREE.Mesh {

		const lineWidth = 0.1;

		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;

		// Create a rectangular mesh for the line
		const length = start.distanceTo( end );
		const geometry = new THREE.PlaneGeometry( length, lineWidth );

		// Position and rotate the geometry
		const midpoint = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 );
		const direction = new THREE.Vector3().subVectors( end, start ).normalize();
		const angle = Math.atan2( direction.y, direction.x );

		geometry.rotateZ( angle );
		geometry.translate( midpoint.x, midpoint.y, 0.01 ); // Slight Z offset to prevent z-fighting

		const material = this.createMarkingMaterial( edge );
		const mesh = new THREE.Mesh( geometry, material );

		return mesh;
	}

	private buildDashedLine ( edge: ParkingEdge ): THREE.Group {

		const group = new THREE.Group();
		const lineWidth = 0.1;

		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;
		const totalLength = start.distanceTo( end );

		// Dash parameters
		const dashLength = 0.5;
		const gapLength = 0.3;
		const segmentLength = dashLength + gapLength;
		const numSegments = Math.floor( totalLength / segmentLength );

		const direction = new THREE.Vector3().subVectors( end, start ).normalize();

		for ( let i = 0; i < numSegments; i++ ) {

			const segmentStart = new THREE.Vector3()
				.copy( start )
				.addScaledVector( direction, i * segmentLength );

			const segmentEnd = new THREE.Vector3()
				.copy( segmentStart )
				.addScaledVector( direction, dashLength );

			const geometry = new THREE.PlaneGeometry( dashLength, lineWidth );
			const midpoint = new THREE.Vector3().addVectors( segmentStart, segmentEnd ).multiplyScalar( 0.5 );
			const angle = Math.atan2( direction.y, direction.x );

			geometry.rotateZ( angle );
			geometry.translate( midpoint.x, midpoint.y, 0.01 );

			const material = this.createMarkingMaterial( edge );
			const mesh = new THREE.Mesh( geometry, material );
			group.add( mesh );
		}

		return group;
	}

	private buildDoubleLine ( edge: ParkingEdge ): THREE.Group {

		const group = new THREE.Group();
		const lineWidth = 0.1;
		const spacing = lineWidth * 1.5; // Space between lines

		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;
		const direction = new THREE.Vector3().subVectors( end, start ).normalize();
		const perpendicular = new THREE.Vector3( -direction.y, direction.x, 0 );

		// Create first line (offset to one side)
		const offset1 = perpendicular.clone().multiplyScalar( spacing / 2 );
		const start1 = start.clone().add( offset1 );
		const end1 = end.clone().add( offset1 );

		const line1 = this.createLineSegment( start1, end1, lineWidth, edge );
		group.add( line1 );

		// Create second line (offset to other side)
		const offset2 = perpendicular.clone().multiplyScalar( -spacing / 2 );
		const start2 = start.clone().add( offset2 );
		const end2 = end.clone().add( offset2 );

		const line2 = this.createLineSegment( start2, end2, lineWidth, edge );
		group.add( line2 );

		return group;
	}

	private createLineSegment (
		start: THREE.Vector3,
		end: THREE.Vector3,
		width: number,
		edge: ParkingEdge
	): THREE.Mesh {

		const length = start.distanceTo( end );
		const geometry = new THREE.PlaneGeometry( length, width );

		const midpoint = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 );
		const direction = new THREE.Vector3().subVectors( end, start ).normalize();
		const angle = Math.atan2( direction.y, direction.x );

		geometry.rotateZ( angle );
		geometry.translate( midpoint.x, midpoint.y, 0.01 );

		const material = this.createMarkingMaterial( edge );
		return new THREE.Mesh( geometry, material );
	}

	private buildSymbol ( edge: ParkingEdge ): THREE.Mesh {

		// For symbols (arrows, etc.), you might want to load sprites or use textures
		// For now, create a simple marker
		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;
		const midpoint = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 );

		const geometry = new THREE.CircleGeometry( 0.3, 32 );
		geometry.translate( midpoint.x, midpoint.y, 0.01 );

		const material = this.createMarkingMaterial( edge );
		return new THREE.Mesh( geometry, material );
	}



	private buildCurb ( edge: ParkingEdge ): THREE.Mesh {

		const height = 0.15;
		const width = 0.20;

		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;
		const length = start.distanceTo( end );

		// Create box geometry for curb
		const geometry = new THREE.BoxGeometry( length, width, height );

		const midpoint = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 );
		const direction = new THREE.Vector3().subVectors( end, start ).normalize();
		const angle = Math.atan2( direction.y, direction.x );

		geometry.rotateZ( angle );
		geometry.translate( midpoint.x, midpoint.y, height / 2 );

		const material = new THREE.MeshStandardMaterial( {
			color: 0xAAAAAA, // Lighter gray for curb
			metalness: 0.1,
			roughness: 0.8
		} );

		return new THREE.Mesh( geometry, material );
	}



	private buildChargingStation ( edge: ParkingEdge ): THREE.Group {

		const group = new THREE.Group();

		// Position charging station at midpoint of edge
		const start = edge.getStartNode().position;
		const end = edge.getEndNode().position;
		const midpoint = new THREE.Vector3().addVectors( start, end ).multiplyScalar( 0.5 );

		// Create a simple representation of charging station
		// Base/pedestal
		const baseGeometry = new THREE.BoxGeometry( 0.3, 0.3, 1.5 );
		baseGeometry.translate( midpoint.x, midpoint.y, 0.75 );
		const baseMaterial = new THREE.MeshStandardMaterial( {
			color: 0x333333,
			metalness: 0.6,
			roughness: 0.4
		} );
		const base = new THREE.Mesh( baseGeometry, baseMaterial );
		group.add( base );

		// Display screen
		const screenGeometry = new THREE.PlaneGeometry( 0.25, 0.2 );
		screenGeometry.translate( midpoint.x, midpoint.y - 0.16, 1.2 );
		const screenMaterial = new THREE.MeshStandardMaterial( {
			color: 0x00FF00,
			emissive: 0x00FF00,
			emissiveIntensity: 0.5
		} );
		const screen = new THREE.Mesh( screenGeometry, screenMaterial );
		group.add( screen );

		return group;
	}

	private createMarkingMaterial ( edge: ParkingEdge ): THREE.Material {

		const color = this.getMarkingColor( edge.getMarkingColor() );

		return new THREE.MeshBasicMaterial( {
			color: color,
			side: THREE.DoubleSide
		} );
	}

	private getMarkingColor ( markingColor?: EdgeMarkingColor ): number {

		switch ( markingColor ) {
			case EdgeMarkingColor.WHITE:
				return this.WHITE_MARKING;
			case EdgeMarkingColor.YELLOW:
				return this.YELLOW_MARKING;
			case EdgeMarkingColor.BLUE:
				return this.BLUE_MARKING;
			case EdgeMarkingColor.RED:
				return this.RED_MARKING;
			case EdgeMarkingColor.GREEN:
				return this.GREEN_MARKING;
			default:
				return this.WHITE_MARKING;
		}
	}
}

