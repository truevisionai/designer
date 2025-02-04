import { Object3D } from "three";
import { IView } from "./i-view";
import { ColorUtils } from "../../../views/shared/utils/colors.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Vector3 } from "../../../core/maths";
import { BaseVMInspector } from "app/tools/point-marking/point-marking.inspector";

export interface IViewModel<TModel, TView> {

	isViewModel?: boolean;

	render (): void;

	update (): void;

	remove (): void;

	onSelect (): void;

	onDeselect (): void;

	getObject3d (): Object3D;

	setView ( view: IView ): void;

	getView (): IView;

	getModel (): TModel;

	getInspector?(): BaseVMInspector<any>;


}


export abstract class BaseViewModel<TModel, TView> implements IViewModel<TModel, TView> {

	isViewModel: boolean = true;

	protected isSelected: boolean = false;

	protected view: IView;

	protected dragStartAt?: Vector3;

	abstract getInspector?(): BaseVMInspector<any>;

	protected constructor ( private model: any, view: IView ) {

		this.view = view;

		this.view.bindViewModel( this );

		this.view.on( 'mouseOver', () => this.highlight() );

		this.view.on( 'mouseOut', () => this.removeHighlight() );

		this.view.on( 'clicked', () => this.onSelect() );

		this.view.on( 'dragStart', ( event ) => this.onDragStart( event ) );

		this.view.on( 'drag', ( event ) => this.onDrag( event ) );

		this.view.on( 'dragEnd', ( event ) => this.onDragEnd( event ) );

		this.view.on( 'update', () => this.onViewUpdated() );
	}

	update (): void {

		// called when the view model is updated

	}

	getModel (): TModel {

		return this.model;

	}

	onViewUpdated (): void {

		// called when the view is updated

	}

	remove (): void {

		this.view.remove?.();

	}

	render (): void {

		this.view.show?.();

	}

	onSelect (): void {

		this.setSelected( true );

		this.view.setColor( ColorUtils.RED );

	}

	onDeselect (): void {

		this.setSelected( false );

		this.view.setColor( ColorUtils.CYAN );

	}

	setSelected ( selected: boolean ): void {
		this.isSelected = selected;
	}

	getObject3d (): Object3D {
		return this.view as any;
	}

	getView (): IView {
		return this.view;
	}

	setView ( view: IView ): void {
		this.view = view;
	}

	protected highlight (): void {
		if ( this.isSelected ) return;
		this.view.setColor( ColorUtils.YELLOW );
	}

	protected removeHighlight (): void {
		if ( this.isSelected ) return;
		this.view.setColor( ColorUtils.CYAN );
	}

	protected onDragStart ( event: PointerEventData ): void {
		this.dragStartAt = event.point;
	}

	protected onDrag ( event: PointerEventData ): void {
		//
	}

	protected onDragEnd ( event: PointerEventData ): void {
		this.dragStartAt = undefined;
	}


}

export function isViewModel ( object: any ): object is IViewModel<any, any> {

	return ( object as IViewModel<any, any> )?.isViewModel === true;

}
