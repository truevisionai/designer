import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { Intersection, Object3D } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';


function findByTag<T> ( tag: string, intersections: Intersection[] ): T {

	const objects = intersections
		.filter( intersection => intersection.object !== undefined )
		.map( intersection => intersection.object );

	return objects.find( ( object: Object3D ) => object[ 'tag' ] === tag ) as any;

}

export class ObjectTagStrategy<T extends ISelectable> extends SelectStrategy<T> {

	constructor ( private tag: string ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		return findByTag<T>( this.tag, pointerEventData.intersections );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		return findByTag<T>( this.tag, pointerEventData.intersections );

	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		return findByTag<T>( this.tag, pointerEventData.intersections );

	}

	dispose (): void {
		// do nothing
	}

}

export class ObjectUserDataStrategy<T> extends SelectStrategy<T> {

	constructor ( private tag: string, private userData: string ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		const object = findByTag<Object3D>( this.tag, pointerEventData.intersections );

		return object ? object.userData[ this.userData ] as T : null;
	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		const object = findByTag<Object3D>( this.tag, pointerEventData.intersections );

		return object ? object.userData[ this.userData ] as T : null;

	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		const object = findByTag<Object3D>( this.tag, pointerEventData.intersections );

		return object ? object.userData[ this.userData ] as T : null;

	}

	dispose (): void {

		// do nothing

	}

}
