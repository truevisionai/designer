/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
import { ISelectable } from '../../modules/three-js/objects/i-selectable';
import { AppService } from '../services/app.service';
import { SceneService } from '../services/scene.service';

export class SelectionTool<T extends ISelectable> {

	public isSelecting = false;
	private cssHelper: SelectionHelper;
	private box: SelectionBox;

	constructor ( private tag: string ) {

		// disable internal events so we can control manually
		this.cssHelper = new SelectionHelper( AppService.three.renderer, 'selectBox' );
		this.dispose();

		this.box = new SelectionBox( AppService.three.camera, SceneService.scene, 1 );

	}

	private get filteredCollection (): T[] {

		// @ts-ignore
		return this.box.collection.filter( i => i[ 'tag' ] == this.tag );

	}

	dispose () {

		this.cssHelper.element.style.display = 'none';

		this.cssHelper?.dispose();

		this.cssHelper.isDown = this.isSelecting = false;

	}

	start ( e: PointerEventData ) {

		this.cssHelper.onSelectStart( e.mouseEvent );

		// this.cssHelper.element.style.display = 'block';

		this.cssHelper.isDown = this.isSelecting = true;

		this.box.startPoint.set( e.mouse.x, e.mouse.y, 0.5 );

	}

	update ( e: PointerEventData ): T[] {

		// console.log( 'update selection tool' );

		if ( !this.isSelecting ) return [];

		this.filteredCollection.forEach( i => i.unselect() );

		this.cssHelper.element.style.display = 'block';

		this.cssHelper.onSelectMove( e.mouseEvent );

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		// @ts-ignore
		return this.box.select().filter( i => i[ 'tag' ] == this.tag );
	}

	end ( e: PointerEventData ): T[] {

		if ( !this.isSelecting ) return [];

		this.cssHelper.isDown = this.isSelecting = false;

		this.cssHelper.onSelectOver( null );

		this.box.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		const filteredItems = this.filteredCollection;

		filteredItems.forEach( i => i.select() );

		this.box.collection = [];

		// this.cssHelper.element.style.display = 'none';

		return filteredItems;

	}

}
