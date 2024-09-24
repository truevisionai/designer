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
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

export class RoadControlPoint extends AbstractControlPoint {

	public static readonly tag = 'RoadControlPoint';

	public mainObject: AbstractSpline;

	public frontTangent: RoadTangentPoint;

	public backTangent: RoadTangentPoint;

	private _tangentLine: DebugLine<any>;

	/**
	 * @deprecated only needed for param poly geometry generation
	 */
	public segmentGeometry?: TvAbstractRoadGeometry;

	constructor ( private _spline: AbstractSpline, position: Vector3, index: number, hdg: number ) {

		super( new BufferGeometry(), new PointsMaterial() );

		this._hdg = hdg;

		this.mainObject = _spline;

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

	get tangentLine (): DebugLine<any> {
		return this._tangentLine;
	}

	set tangentLine ( value: DebugLine<any> ) {
		this._tangentLine = value;
	}

	get spline (): AbstractSpline {
		return this._spline;
	}

	getSpline (): object {
		return this._spline;
	}

	setPosition ( position: Vector3 ): void {

		super.setPosition( position );

		this.update();

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

		this.frontTangent = new FrontTangentPoint( this.index + 1 + this.index * 2, this );

		this.frontTangent.position.copy( frontPosition );

		this.backTangent = new BackTangentPoint( this.index + 1 + this.index * 2 + 1, this );

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

		if ( this.spline.hasSuccessor() && index === 0 ) return false;

		if ( this.spline.hasPredecessor() && index === this.spline.getControlPoints().length - 1 ) return false;

		return true;

	}

}
