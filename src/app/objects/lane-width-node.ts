/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Group, LineBasicMaterial, LineSegments, Vector2, Vector3 } from 'three';
import { COLOR } from '../views/shared/utils/colors.service';
import { TvLaneWidth } from '../map/models/tv-lane-width';
import { TvMapQueries } from '../map/queries/tv-map-queries';
import { INode } from './i-selectable';
import { AnyControlPoint } from "./any-control-point";
import { Action, SerializedField } from 'app/core/components/serialization';
import { MapEvents } from 'app/events/map-events';
import { IHasCopyUpdate } from 'app/commands/copy-position-command';
import { CommandHistory } from 'app/services/command-history';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { DebugLine } from 'app/objects/debug-line';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

export class LaneWidthNode extends Group implements INode, IHasCopyUpdate {

	public static readonly tag = 'width-node';
	public static readonly pointTag = 'width-point';
	public static readonly lineTag = 'width-line';

	public line: DebugLine<LaneWidthNode>;
	public point: AnyControlPoint;
	public isSelected: boolean = false;

	get road () {
		return this.laneWidth.lane.laneSection.road;
	}

	get lane () {
		return this.laneWidth.lane;
	}

	get roadId () {
		return this.road.id;
	}

	get laneId () {
		return this.lane.id;
	}

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.laneWidth.s;
	}

	set s ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'S cannot be negative' );
			return;
		}

		this.laneWidth.s = value;

		this.updateLaneWidthValues();

		MapEvents.objectUpdated.emit( this );

	}

	@SerializedField( { type: 'int' } )
	get width (): number {
		return this.laneWidth.a;
	}

	set width ( value: number ) {

		if ( value < 0 ) {
			console.warn( 'Width cannot be negative' );
			return;
		}

		this.laneWidth.a = value;

		this.updateLaneWidthValues();

		MapEvents.objectUpdated.emit( this );

	}

	@Action( { name: 'Delete' } )
	delete ( value: number ) {

		CommandHistory.execute( new RemoveObjectCommand( this ) );

	}

	constructor ( public laneWidth: TvLaneWidth ) {

		super();

		// console.error( 'LaneWidthNode constructor' );

		this.createMesh();

		this.layers.enable( 31 );
	}

	update (): void {

		console.error( 'Method not implemented.' );

	}

	setPosition ( position: Vector3 ): void {

		console.error( 'Method not implemented.' );

	}

	copyPosition ( position: Vector3 ): void {

		console.error( 'Method not implemented.' );

	}

	getPosition (): Vector3 {

		return this.position;

	}

	onMouseOver () {

		console.error( 'Method not implemented.' );

	}

	onMouseOut () {

		console.error( 'Method not implemented.' );

	}

	updateLaneWidthValues () {

		this.road.getLaneSectionAt( this.laneWidth.s ).updateLaneWidthValues( this.lane );

	}

	select () {

		this.isSelected = true;
		this.point?.select();

	}

	unselect () {

		this.isSelected = false;
		this.point?.unselect();

	}

	private createMesh () {

		const road = this.road;
		const lane = this.lane;

		const s = this.lane.laneSection.s + this.laneWidth.s;

		const offset = this.laneWidth.getValue( this.laneWidth.s ) * 0.5;
		const start = TvMapQueries.getLaneCenterPosition( road.id, lane.id, s, -offset );
		const end = TvMapQueries.getLaneCenterPosition( road.id, lane.id, s, offset );

		this.point = AnyControlPoint.create( 'point', end );
		this.point.tag = LaneWidthNode.pointTag;
		this.add( this.point );

		// const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );
		const lineGeometry = new LineGeometry().setPositions( [ start, end ].flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = new LineMaterial( {
			color: COLOR.CYAN,
			linewidth: 4,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );


		// this.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );
		this.line = new DebugLine( this, lineGeometry, material );
		this.line.name = 'lane-width-node';
		this.line[ 'tag' ] = LaneWidthNode.lineTag;
		// this.line.renderOrder = 3;
		// this.add( this.line );

		this.add( new DebugLine( this, lineGeometry, material ) );
	}
}
