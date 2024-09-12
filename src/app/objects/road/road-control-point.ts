/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CURVE_Y } from 'app/core/shapes/spline-config';
import { TvGeometryType } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from 'three';
import { BackTangentPoint, FrontTangentPoint, RoadTangentPoint } from './road-tangent-point';
import { AbstractControlPoint } from "../abstract-control-point";
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Log } from 'app/core/utils/log';
import { DebugLine } from '../debug-line';

export class RoadControlPoint extends AbstractControlPoint {

	static readonly tag = 'RoadControlPoint';

	public mainObject: TvRoad;

	public frontTangent: RoadTangentPoint;

	public backTangent: RoadTangentPoint;

	private _tangentLine: DebugLine<any>;

	private _hdg: number;


	private _segmentType?: TvGeometryType;

	/**
	 * @deprecated only needed for param poly geometry generation
	 */
	public segmentGeometry?: TvAbstractRoadGeometry;

	public allowChange: boolean = true;

	constructor ( public road: TvRoad, position: Vector3, index?: number, segmentType?: TvGeometryType, hdg?: number ) {

		super( new BufferGeometry(), new PointsMaterial() );

		this._segmentType = segmentType;

		this._hdg = hdg;

		this.mainObject = road;

		this.geometry = new BufferGeometry();

		this.geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		this.material = this.getDefaultMaterial();

		if ( position ) this.position.copy( position );

		this.name = 'road-control-point';

		this.userData.is_button = true;
		this.userData.is_control_point = true;
		this.userData.is_selectable = true;

		this.tag = RoadControlPoint.tag;

		this.index = index;

		this.renderOrder = 3;

	}

	get hdg (): number {
		return this._hdg;
	}

	set hdg ( value: number ) {
		if ( this.shouldUpdateHeading() ) {
			this._hdg = value;
		}
	}

	get segmentType (): TvGeometryType {
		return this._segmentType;
	}

	set segmentType ( value: TvGeometryType ) {
		this._segmentType = value;
	}

	get tangentLine (): DebugLine<any> {
		return this._tangentLine;
	}

	set tangentLine ( value: DebugLine<any> ) {
		this._tangentLine = value;
	}

	get spline () {
		return this.road.spline;
	}

	setPosition ( position: Vector3 ): void {

		if ( !this.allowChange ) return;

		super.setPosition( position );

		this.update();

	}

	shouldMarkAsSpiral (): boolean {

		// need to check with previous point and next point
		return true;

	}

	markAsSpiral (): void {

		this.segmentType = TvGeometryType.SPIRAL;

		// also mark previous segment as spiral
		// also mark previous control point as spiral

		const currentPointIndex = this.spline.getControlPoints().findIndex( point => point === this );

		if ( currentPointIndex === 0 ) return;

		const previousPoint = this.spline.getControlPoints()[ currentPointIndex - 1 ] as RoadControlPoint;

		previousPoint.segmentType = TvGeometryType.SPIRAL;

	}

	update () {

		this.updateFrontTangent();

		this.updateBackTangent();

		this.updateTangentLineGeometry();

	}

	show () {

		super.show();

		if ( this.frontTangent ) this.frontTangent.show();

		if ( this.backTangent ) this.backTangent.show();

		if ( this.tangentLine ) this.tangentLine.visible = true;
	}

	hide () {

		super.hide();

		if ( this.frontTangent ) this.frontTangent.hide();

		if ( this.backTangent ) this.backTangent.hide();

		if ( this.tangentLine ) this.tangentLine.visible = false;

	}

	createTangentAndLine ( hdg: number, frontLength: number, backLength: number ): void {

		this.createTangents( hdg, frontLength, backLength );

		this.createLine()

	}

	private createLine (): void {

		const points = [ this.frontTangent.position, this.backTangent.position ];

		this.tangentLine = DebugLine.create( points );

		this.tangentLine.name = 'tangent-control-line';

		this.tangentLine.castShadow = true;

		this.tangentLine.renderOrder = 3;

		this.tangentLine.frustumCulled = false;

	}

	private createTangents ( hdg: number, frontLength: number, backLength: number ): void {

		const frontPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
			.multiplyScalar( frontLength )
			.add( this.position );

		const backPosition = new Vector3( Math.cos( hdg ), Math.sin( hdg ), CURVE_Y )
			.multiplyScalar( -backLength )
			.add( this.position );

		this.frontTangent = new FrontTangentPoint( this.road, this.index + 1 + this.index * 2, this );

		this.frontTangent.position.copy( frontPosition );

		this.backTangent = new BackTangentPoint( this.road, this.index + 1 + this.index * 2 + 1, this );

		this.backTangent.position.copy( backPosition );

	}

	private updateTangentLineGeometry (): void {

		if ( !this.frontTangent || !this.backTangent ) {
			Log.error( 'Front or back tangent not found' );
			return;
		}

		if ( !this.tangentLine ) {
			Log.error( 'Tangent line not found' );
			return;
		}

		this.tangentLine.updateGeometry( [ this.frontTangent.position, this.backTangent.position ] );

	}

	private updateFrontTangent (): void {

		this.updateTangent( this.frontTangent, 'front' );

	}

	private updateBackTangent (): void {

		this.updateTangent( this.backTangent, 'back' );

	}

	private updateTangent ( tangentPoint: RoadTangentPoint, location: 'front' | 'back' ): void {

		if ( !tangentPoint ) {
			Log.error( 'Tangent not found', location );
			return;
		}

		const sign = location === 'front' ? 1 : -1;

		const position = new Vector3( Math.cos( this.hdg ), Math.sin( this.hdg ), CURVE_Y )
			.multiplyScalar( tangentPoint.length * sign )
			.add( this.position );

		tangentPoint.setPosition( position );

		tangentPoint.update();
	}

	shouldUpdateHeading (): boolean {

		const index = this.spline.getControlPoints().findIndex( point => point === this );

		if ( this.road.hasSuccessor() && index === 0 ) return false;

		if ( this.road.hasPredecessor() && index === this.spline.getControlPoints().length - 1 ) return false;

		return true;

	}

}
