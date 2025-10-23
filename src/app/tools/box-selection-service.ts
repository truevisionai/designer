/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Camera, Intersection, Object3D, Vector3 } from "three";
import { Observable, Subject } from 'rxjs';
import { BaseSelectionStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RendererService } from 'app/renderer/renderer.service';
import { CameraService } from 'app/renderer/camera.service';
import { SceneService } from 'app/services/scene.service';
import { SelectionHelper } from './selection-helper';
import { SelectionBox } from './selection-box';

export interface BoxSelectionConfig<T = any> {
	strategy: BaseSelectionStrategy<T>;
	label?: string;
	allowBatchDelete?: boolean;
}

@Injectable( {
	providedIn: 'root'
} )
export class BoxSelectionService {

	private isSelecting = false;

	private selectionHelper: SelectionHelper;

	private box: SelectionBox;

	private selectStrategy: BaseSelectionStrategy<any>;

	private filteredCollection: any[] = [];

	private config?: BoxSelectionConfig<any>;

	private readonly selectionUpdatedSubject = new Subject<any[]>();
	private readonly selectionCompletedSubject = new Subject<any[]>();
	private readonly selectionCancelledSubject = new Subject<void>();

	selectionUpdated$: Observable<any[]> = this.selectionUpdatedSubject.asObservable();
	selectionCompleted$: Observable<any[]> = this.selectionCompletedSubject.asObservable();
	selectionCancelled$: Observable<void> = this.selectionCancelledSubject.asObservable();

	constructor (
		private rendererService: RendererService,
		private cameraService: CameraService,
		private sceneService: SceneService,
	) {
		this.cameraService.cameraChanged.subscribe( ( camera ) => this.onCameraChanged( camera ) );
	}

	private onCameraChanged ( camera: Camera ): void {

		this.box = new SelectionBox( camera, this.sceneService.scene, 1 );

	}

	setStrategy ( strategy: BaseSelectionStrategy<any> ): void {

		this.selectStrategy = strategy;

	}

	init ( strategy?: BaseSelectionStrategy<any> ): void {

		if ( strategy ) this.setStrategy( strategy );

		this.ensureSelectionHelper();

		this.isSelecting = false;

		this.box = new SelectionBox( this.cameraService.camera, this.sceneService.scene, 1 );

	}

	reset (): void {

		console.log( 'BoxSelectionService: Resetting selection service' );

		this.clearHighlights();

		this.selectionHelper.disable();

		this.box = null;

		this.selectStrategy = null;

		this.filteredCollection = [];

	}

	beginSession ( event: PointerEventData, config: BoxSelectionConfig<any> ): void {

		this.config = config;
		this.selectionUpdatedSubject.next( [] );

		this.init( config.strategy );

	}

	start ( e: PointerEventData ): void {

		this.filteredCollection = [];

		this.selectionHelper.onSelectStart( e.mouseEvent );

		this.isSelecting = true;

		this.box.startPoint.set( e.mouse.x, e.mouse.y, 0.9 );

	}

	update ( e: PointerEventData ): any[] {

		if ( !this.isSelecting ) return [];

		this.selectionHelper.onSelectMove( e.mouseEvent );

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		const selection = this.filter( e, this.box.select() );

		this.selectionUpdatedSubject.next( [ ...selection ] );

		return selection;
	}

	end ( e: PointerEventData ): any[] {

		if ( !this.isSelecting ) return [];

		this.isSelecting = false;

		try {
			this.selectionHelper.onSelectOver();
		} catch ( error ) {
			console.error( 'Error in SelectionHelper.onSelectOver:', error );
		}

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		const selection = this.filter( e, this.box.select() );

		this.box.collection = [];

		const response = [ ...selection ];

		this.selectionUpdatedSubject.next( response );
		this.selectionCompletedSubject.next( response );

		this.config = undefined;

		return response;
	}

	cancel (): void {

		if ( !this.isSelecting ) return;

		this.isSelecting = false;

		this.selectionHelper.onSelectOver();

		this.clearHighlights();

		this.selectionCancelledSubject.next();

		this.config = undefined;

	}

	getSelection (): any[] {
		return [ ...this.filteredCollection ];
	}

	isActive (): boolean {
		return this.isSelecting;
	}

	clearSelection (): void {
		this.clearHighlights();
		this.selectionUpdatedSubject.next( [] );
		this.selectionCancelledSubject.next();
	}

	private ensureSelectionHelper (): void {

		if ( this.selectionHelper ) return;

		this.selectionHelper = new SelectionHelper( this.rendererService.renderer, 'selectBox' );

	}

	private clearHighlights (): void {

		this.filteredCollection.forEach( object => {

			if ( object instanceof AbstractControlPoint ) {

				object.unselect();

			}

		} );

		this.filteredCollection = [];

	}

	private filter ( event: PointerEventData, objects: Object3D[] ): any[] {

		const filtered: any[] = [];

		this.clearHighlights();

		const pointerOrigin = event.point?.clone();

		for ( const object of objects ) {

			const pointerEvent = event.clone();

			const intersectionPoint = this.getIntersectionPoint( object, pointerOrigin );

			const intersection: Intersection = {
				distance: 0,
				point: intersectionPoint.clone(),
				object: object,
				index: 0,
				face: null,
				faceIndex: undefined,
				uv: undefined,
				instanceId: undefined,
			};

			pointerEvent.intersections = [ intersection ];
			pointerEvent.object = object;
			pointerEvent.point = intersectionPoint.clone();

			const selected = this.selectStrategy?.handleSelection( pointerEvent );

			if ( selected ) {

				filtered.push( selected );

			}

		}

		filtered.forEach( object => this.highlight( object ) );

		this.filteredCollection = filtered;

		return filtered;
	}

	private getIntersectionPoint ( object: Object3D, fallback?: Vector3 ): Vector3 {

		if ( object instanceof AbstractControlPoint ) {
			return object.position.clone();
		}

		if ( object.position ) {
			return object.position.clone();
		}

		return fallback ? fallback.clone() : new Vector3();

	}

	private highlight ( object: any ): void {

		if ( object instanceof AbstractControlPoint ) {

			object.select();

		}

	}

}
