/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { KeyboardInput } from 'app/core/input';
import { AppService } from 'app/core/services/app.service';
import { Debug } from 'app/core/utils/debug';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { COLOR } from 'app/shared/utils/colors.service';
import { Subscription } from 'rxjs';
import * as THREE from 'three';
import { BufferAttribute, BufferGeometry, Color, Object3D, PointsMaterial, Vector2, Vector3 } from 'three';
import { BaseEventData } from '../../events/pointer-event-data';
import { AnyControlPoint, NewDistanceNode } from '../../modules/three-js/objects/control-point';
import { SceneService } from '../services/scene.service';
import { IShapeEditor } from './i-shape-editor';

export abstract class AbstractShapeEditor implements IShapeEditor {

	public controlPointSelected = new EventEmitter<AnyControlPoint>();
	public controlPointUnselected = new EventEmitter<AnyControlPoint>();
	public controlPointHovered = new EventEmitter<AnyControlPoint>();

	/**
	 * Fire when control point is added
	 */
	public controlPointAdded = new EventEmitter<AnyControlPoint>();

	/**
	 * Fired everytime mouse is moving the control point
	 */
	public controlPointMoved = new EventEmitter<AnyControlPoint>();

	/**
	 * Fired after mouse is up and control point position is updated
	 */
	public controlPointUpdated = new EventEmitter<AnyControlPoint>();

	/**
	 * Fire when control point is removed
	 */
	public controlPointRemoved = new EventEmitter<AnyControlPoint>();

	public curveGeometryChanged = new EventEmitter<THREE.Curve<any>>();
	public curveGeometryAdded = new EventEmitter<THREE.Curve<any>>();

	public pickingEnabled: boolean = true;

	public currentPoint: AnyControlPoint;

	protected _pointerDownAt: THREE.Vector3;

	public get pointerDownAt (): THREE.Vector3 {
		return this._pointerDownAt;
	}

	protected set pointerDownAt ( value: THREE.Vector3 ) {
		this._pointerDownAt = value;
	}

	protected isDragging: boolean;

	protected DEFAULT_CONTROL_POINT_COLOR = COLOR.BLUE;
	protected HOVERED_CONTROL_POINT_COLOR = COLOR.YELLOW;
	protected SELECTED_CONTROL_POINT_COLOR = COLOR.RED;

	protected DEFAULT_LINE_COLOR = COLOR.RED;
	protected HIGHLIGHT_LINE_COLOR = COLOR.BLUE;

	protected object: Object3D;
	protected material = new THREE.LineBasicMaterial( { color: this.DEFAULT_LINE_COLOR, depthTest: false } );
	protected pointerIsDown: boolean;

	// subscribers
	private pointerMovedSubscriber: Subscription;
	private pointerClickedSubscriber: Subscription;
	private pointerUpSubscriber: Subscription;
	private pointerDownSubscriber: Subscription;
	private selectSubscriber: Subscription;
	private deSelectSubscriber: Subscription;
	private pointerEnterSubscriber: Subscription;
	private pointerExitSubscriber: Subscription;
	private controlPointSelectedSubscriber: Subscription;
	private controlPointUnselectedSubcriber: Subscription;
	private controlPointHoveredSubcriber: Subscription;
	private isEnabled: boolean = false;

	constructor () {

		this.enable();

	}

	private _controlPoints: AnyControlPoint[] = [];

	get controlPoints (): AnyControlPoint[] {
		return this._controlPoints;
	}

	set controlPoints ( value: AnyControlPoint[] ) {
		this._controlPoints = value;
	}

	public get controlPointCount (): number {

		return this._controlPoints.length;

	}

	public get controlPointPositions (): Vector3[] {

		const positions: Vector3[] = [];

		this._controlPoints.forEach( ( point ) => {
			positions.push( point.position );
		} );

		return positions;
	}

	public get vector2ControlPoints (): Vector2[] {

		const positions: Vector2[] = [];

		this._controlPoints.forEach( ( point ) => {
			positions.push( new Vector2( point.position.x, point.position.y ) );
		} );

		return positions;
	}

	protected get lastControlPoint () {
		return this._controlPoints[ this._controlPoints.length - 1 ];
	};

	public abstract draw ();

	destroy () {

		this.controlPoints.forEach( cp => this.unSelectControlPoint( cp ) );

		this.removeAllControlPoints();

		this.disable();

		SceneService.remove( this.object );

	}

	highlight () {

		this.material.color = new Color( this.HIGHLIGHT_LINE_COLOR );
		this.material.needsUpdate = true;

	}

	removeHighlight () {

		this.material.color = new Color( this.DEFAULT_LINE_COLOR );
		this.material.needsUpdate = true;
	}

	enable () {

		if ( this.isEnabled ) return;

		const events = AppService.eventSystem;

		if ( events ) {

			this.pointerMovedSubscriber = events.pointerMoved.subscribe( e => this.onPointerMoved( e ) );
			this.pointerClickedSubscriber = events.pointerClicked.subscribe( e => this.onPointerClicked( e ) );
			this.pointerUpSubscriber = events.pointerUp.subscribe( e => this.onPointerUp( e ) );
			this.pointerDownSubscriber = events.pointerDown.subscribe( e => this.onPointerDown( e ) );
			this.selectSubscriber = events.select.subscribe( e => this.onSelect( e ) );
			this.deSelectSubscriber = events.deSelect.subscribe( e => this.onDeSelect( e ) );
			this.pointerEnterSubscriber = events.pointerEnter.subscribe( e => this.onPointerEnter( e ) );
			this.pointerExitSubscriber = events.pointerExit.subscribe( e => this.onPointerExit( e ) );

		}


		this.controlPointSelectedSubscriber = this.controlPointSelected.subscribe( e => this.onControlPointSelected( e ) );
		this.controlPointUnselectedSubcriber = this.controlPointUnselected.subscribe( e => this.onControlPointUnselected( e ) );
		this.controlPointHoveredSubcriber = this.controlPointHovered.subscribe( e => this.onControlPointHovered( e ) );

		this.isEnabled = true;
	}

	disable () {

		Debug.log( 'eventd disabled' );

		this.pointerMovedSubscriber.unsubscribe();
		this.pointerClickedSubscriber.unsubscribe();
		this.pointerUpSubscriber.unsubscribe();
		this.pointerDownSubscriber.unsubscribe();
		this.selectSubscriber.unsubscribe();
		this.deSelectSubscriber.unsubscribe();
		this.pointerEnterSubscriber.unsubscribe();
		this.pointerExitSubscriber.unsubscribe();

		this.controlPointSelectedSubscriber.unsubscribe();
		this.controlPointUnselectedSubcriber.unsubscribe();

		this.isEnabled = false;
	}

	onPointerClicked ( e: PointerEventData ): void {

		if ( this.isDragging ) return;

	}

	onSelect ( e: BaseEventData ) {

		if ( !this.pickingEnabled ) return;

		this.pickControlPoint( e );

	}

	pickControlPoint ( e: BaseEventData ) {

		if ( e.object != null && e.object.type == 'Points' ) {

			this.unSelectControlPoint( this.currentPoint );

			this.selectControlPoint( e.object as AnyControlPoint );

		} else {

			this.unSelectControlPoint( this.currentPoint );
		}

	}

	selectControlPoint ( point: AnyControlPoint ) {

		if ( point != null ) {

			this.currentPoint = point;

			this.controlPointSelected.emit( this.currentPoint );

		}
	}

	unSelectControlPoint ( point: AnyControlPoint ) {

		if ( point != null ) {

			this.controlPointUnselected.emit( point );

			this.currentPoint = null;

		}

	}

	onPointerUp ( e: PointerEventData ) {

		this.pointerIsDown = false;

		this.isDragging = false;

		if ( this.currentPoint != null ) this.controlPointUpdated.emit( this.currentPoint );
	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( e.point != null && this.pointerIsDown && this._controlPoints.length > 1 ) {

			this.isDragging = true;

			if ( this.currentPoint != null ) this.currentPoint.copyPosition( e.point );

			if ( this._controlPoints.length > 1 ) this.draw();

			this.controlPointMoved.emit( this.currentPoint );
		}

	}

	onPointerExit ( e: any ): any {

	}

	onPointerEnter ( e: any ): any {

	}

	onPointerDown ( e: PointerEventData ): any {

		if ( e.button == MouseButton.RIGHT ) return;

		this.pointerIsDown = true;

		this.pointerDownAt = e.point;

		// if ( e.object != null && e.object.userData.is_selectable == true ) return;

		if ( e.button == MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

			this.addControlPoint( e.point );

			if ( this._controlPoints.length > 1 ) this.draw();
		}

	}

	addControlPoint ( position: THREE.Vector3, parent?: Object3D, size?: number ): AnyControlPoint {

		const point = this.createControlPoint( position, parent, size );

		this.pushControlPoint( point, true );

		return point;
	}

	pushControlPoint ( point: AnyControlPoint, event = false ): AnyControlPoint {

		this._controlPoints.push( point );

		if ( event ) this.controlPointAdded.emit( point );

		SceneService.add( point );

		return point;
	}

	removeControlPoint ( point: AnyControlPoint ) {

		const index = this._controlPoints.indexOf( point );

		this._controlPoints.splice( index, 1 );

		this.controlPointRemoved.emit( point );

		SceneService.remove( point );
	}

	removeAllControlPoints () {

		this._controlPoints.forEach( object => {

			object.visible = false;

			// SceneService.remove( object );

		} );

		this._controlPoints.splice( 0, this._controlPoints.length );

	}

	public createDistanceNode ( roadId: number, laneId: number, s: number, t, position: Vector3, parent?: Object3D ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const dotMaterial = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: this.DEFAULT_CONTROL_POINT_COLOR,
			depthTest: false
		} );

		const object = new NewDistanceNode( roadId, laneId, s, t, dotGeometry, dotMaterial );

		object.setPosition( position.clone() );

		object.userData.is_button = true;
		object.userData.is_control_point = true;
		object.userData.is_selectable = true;

		object.renderOrder = 3;

		SceneService.add( object );

		return object;

	}

	onControlPointHovered ( e: AnyControlPoint ) {

		e.onMouseOver();

	}

	onControlPointUnhovered ( e: AnyControlPoint ) {

		e.onMouseOut();

	}

	protected createControlPoint ( position: Vector3, parent?: Object3D, size?: number ) {

		const dotGeometry = new BufferGeometry()

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const dotMaterial = new PointsMaterial( {
			size: size || 10,
			sizeAttenuation: false,
			map: OdTextures.point,
			alphaTest: 0.5,
			transparent: true,
			color: this.DEFAULT_CONTROL_POINT_COLOR,
			depthTest: false
		} );

		const object = new AnyControlPoint( dotGeometry, dotMaterial );

		object.setPosition( position.clone() );

		object.userData.is_button = true;
		object.userData.is_control_point = true;
		object.userData.is_selectable = true;

		object.renderOrder = 3;

		return object;
	}

	private onDeSelect ( e: any ) {

	}

	private onControlPointSelected ( e: AnyControlPoint ) {

		e.select();

		AppService.three.disableControls();
	}

	private onControlPointUnselected ( e: AnyControlPoint ) {

		e.unselect();

		AppService.three.enableControls();
	}

}
