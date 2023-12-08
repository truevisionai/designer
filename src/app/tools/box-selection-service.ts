import { Injectable } from '@angular/core';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
import { ThreeService } from 'app/modules/three-js/three.service';
import { Camera, Mesh } from 'three';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class BoxSelectionService {

	private isSelecting = false;

	private cssHelper: SelectionHelper;

	private box: SelectionBox;

	private selectStrategy: SelectStrategy<any>;

	private filteredCollection = [];

	constructor (
		private threeService: ThreeService
	) {
		this.threeService.cameraChanged.subscribe( ( camera ) => this.onCameraChanged( camera ) );
	}

	private onCameraChanged ( camera: Camera ): void {

		this.box = new SelectionBox( camera, this.threeService.scene, 1 );

	}

	setStrategy ( strategy: SelectStrategy<any> ) {

		this.selectStrategy = strategy;

	}

	init ( strategy?: SelectStrategy<any> ) {

		if ( strategy ) this.setStrategy( strategy );

		// disable internal events so we can control manually
		this.cssHelper = new SelectionHelper( this.threeService.renderer, 'selectBox' );

		this.cssHelper.element.style.display = 'none';

		this.cssHelper.isDown = this.isSelecting = false;

		this.cssHelper?.dispose();

		this.box = new SelectionBox( this.threeService.camera, this.threeService.scene, 1 );

	}

	reset (): void {

		this.cssHelper?.dispose();

		this.box = null;

		this.selectStrategy = null;

		this.filteredCollection = [];

	}

	start ( e: PointerEventData ) {

		this.filteredCollection = [];

		this.cssHelper.onSelectStart( e.mouseEvent );

		this.cssHelper.element.style.display = 'block';

		this.cssHelper.isDown = this.isSelecting = true;

		this.box.startPoint.set( e.mouse.x, e.mouse.y, 0.9 );

	}

	update ( e: PointerEventData ): Mesh[] {

		if ( !this.isSelecting ) return [];

		this.cssHelper.element.style.display = 'block';

		this.cssHelper.onSelectMove( e.mouseEvent );

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		this.filter( e, this.box.select() );

		return this.filteredCollection
	}

	end ( e: PointerEventData ): Mesh[] {

		if ( !this.isSelecting ) return [];

		this.cssHelper.isDown = this.isSelecting = false;

		this.cssHelper.onSelectOver( null );

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		this.filter( e, this.box.select() );

		this.box.collection = [];

		this.cssHelper.element.style.display = 'none';

		const response = this.filteredCollection;

		this.filteredCollection = [];

		return response;
	}

	filter ( event: PointerEventData, objects: Mesh[] ): void {

		const filtered = [];

		// unselect the old ones

		this.filteredCollection.forEach( object => {

			if ( object instanceof AbstractControlPoint ) {

				object.unselect();

			}

		} );


		for ( const object of objects ) {

			const pointerEvent = event.clone();

			// remove all intersections except the first one

			pointerEvent.intersections.forEach( i => i.object = object );

			if ( this.selectStrategy?.select( pointerEvent ) ) {

				filtered.push( object );

			}

		}

		filtered.forEach( object => {

			if ( object instanceof AbstractControlPoint ) {

				object.select();

			}

		} );

		this.filteredCollection = filtered;

	}

}
