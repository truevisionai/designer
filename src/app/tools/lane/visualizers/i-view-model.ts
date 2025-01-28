import { Object3D } from "three";
import { IView } from "./i-view";
import { ColorUtils } from "../../../views/shared/utils/colors.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { SceneService } from "../../../services/scene.service";

export interface IViewModel<TModel, TView> {

	isViewModel?: boolean;

	render?(): void;

	update?(): void;

	remove?(): void;

	onSelect?(): void;

	onDeselect?(): void;

	getObject3d?(): Object3D;

	setView?( view: IView ): void;

	getModel?(): TModel;

}


export abstract class BaseViewModel<TModel, TView> implements IViewModel<TModel, TView> {

	isViewModel: boolean = true;

	protected isSelected: boolean = false;

	protected view: IView;

	protected constructor ( view: IView ) {

		this.view = view;

		this.view.bindViewModel( this );

		this.view.on( 'mouseOver', () => this.highlight() );

		this.view.on( 'mouseOut', () => this.removeHighlight() );

		this.view.on( 'clicked', () => this.onSelect() );

		this.view.on( 'drag', ( data ) => this.onDrag( data ) );

		this.view.on( 'update', () => this.onViewUpdated() );
	}

	onViewUpdated (): void { }

	remove (): void {

		// this.view.hide();

		this.view.remove?.();

	}

	render () {

		SceneService.addToolObject( this.getObject3d() );

		this.getView().show();

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

	protected onDrag ( data: PointerEventData ): void {
		console.log( 'drag', this.view, data );
	}
}

export function isViewModel ( object: any ): object is IViewModel<any, any> {

	return ( object as IViewModel<any, any> )?.isViewModel === true;

}
