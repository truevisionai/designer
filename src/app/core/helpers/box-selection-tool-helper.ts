import { PointerEventData } from 'app/events/pointer-event-data';
import { MeshStandardMaterial } from 'three';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
import { AppService } from '../services/app.service';
import { SceneService } from '../services/scene.service';

export class BoxSelectionToolHelper {

	selectionHelper: SelectionHelper;
	selectionBox: SelectionBox;
	isSelecting: boolean;

	constructor () {

		this.selectionHelper = new SelectionHelper( AppService.three.renderer, 'selectBox' );
		this.selectionBox = new SelectionBox( AppService.three.camera, SceneService.scene, 1 );

	}

	dispose () {

		this.selectionHelper.element.style.display = 'none';
		this.selectionHelper.dispose();
		this.isSelecting = false;

		// this.selectionBox.endPoint.set( 0, 0, 0.5 );
		// this.selectionBox.select();/

	}

	start ( e: PointerEventData ) {

		console.trace( 'start' );

		this.isSelecting = true;

		for ( const item of this.selectionBox.collection ) {

			( item.material as MeshStandardMaterial ).emissive?.set( 0x000000 );

		}

		this.selectionBox.startPoint.set( e.mouse.x, e.mouse.y, 0.5 );

	}


	update ( e: PointerEventData ) {

		console.trace( 'update' );

		if ( this.selectionHelper.isDown ) {

			for ( let i = 0; i < this.selectionBox.collection.length; i++ ) {

				( this.selectionBox.collection[ i ].material as MeshStandardMaterial ).emissive?.set( 0x000000 );

			}

			this.selectionBox.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

			const allSelected = this.selectionBox.select();

			for ( let i = 0; i < allSelected.length; i++ ) {

				( allSelected[ i ].material as MeshStandardMaterial ).emissive?.set( 0xffffff );

			}

		}

	}

	end ( e: PointerEventData ) {

		console.trace( 'end' );

		this.isSelecting = false;

		this.selectionBox.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		const allSelected = this.selectionBox.select();

		for ( let i = 0; i < allSelected.length; i++ ) {

			( allSelected[ i ].material as MeshStandardMaterial ).emissive?.set( 0xffffff );

		}

	}

}
