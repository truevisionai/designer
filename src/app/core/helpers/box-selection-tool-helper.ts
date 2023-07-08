import { PointerEventData } from "app/events/pointer-event-data";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper";
import { AppService } from "../services/app.service";
import { SceneService } from "../services/scene.service";
import { MeshStandardMaterial } from "three";

export class BoxSelectionToolHelper {

	static selectionHelper: SelectionHelper;
	static selectionBox: SelectionBox;

	constructor () {

		BoxSelectionToolHelper.selectionHelper = new SelectionHelper( AppService.three.renderer, 'selectBox' );
		BoxSelectionToolHelper.selectionBox = new SelectionBox( AppService.three.camera, SceneService.scene );

	}

	static start ( e: PointerEventData ) {

		for ( const item of this.selectionBox.collection ) {

			( item.material as MeshStandardMaterial ).emissive?.set( 0x000000 );

		}

		this.selectionBox.startPoint.set( e.mouse.x, e.mouse.y, 0.5 );

	}


	static update ( e: PointerEventData ) {

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

	static end ( e: PointerEventData ) {

		this.selectionBox.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );

		const allSelected = this.selectionBox.select();

		console.log( allSelected );

		for ( let i = 0; i < allSelected.length; i++ ) {

			( allSelected[ i ].material as MeshStandardMaterial ).emissive?.set( 0xffffff );

		}

	}

}
