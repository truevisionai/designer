import { Object3D } from 'three';
import { IViewModel } from '../lane/visualizers/i-view-model';
import { SceneService } from 'app/services/scene.service';
import { AppInspector } from 'app/core/inspector';

export class ViewManager {

	private static viewModels = new Map<any, IViewModel<any, any>>();

	private static views = new Map<any, Object3D>();

	static addViewModel ( viewModel: IViewModel<any, any> ): void {

		const object3D = viewModel.getObject3d();

		if ( object3D && !object3D.parent ) {

			SceneService.addToolObject( object3D );

		}

		if ( object3D ) object3D.visible = true;

		this.viewModels.set( viewModel.getModel(), viewModel );

		this.views.set( viewModel.getModel(), object3D );

	}

	static hasViewModel ( viewModel: IViewModel<any, any> ): boolean {

		return this.views.has( viewModel );

	}

	static hasModel ( model: any ): boolean {

		return this.viewModels.has( model );

	}

	static remove ( viewModel: IViewModel<any, any> ): void {

		SceneService.removeFromTool( viewModel.getObject3d() );

		this.viewModels.delete( viewModel.getModel() );

		this.views.delete( viewModel );

	}

	static hide (): void {

		this.viewModels.forEach( viewModel => {

			viewModel.onDeselect();

			viewModel.getObject3d().visible = false;

		} )

	}

	static clear (): void {

		this.views.forEach( object3D => {

			SceneService.removeFromTool( object3D );

		} );

		this.views.clear();

		this.viewModels.clear();

	}

	static getViewModel ( model: any ): IViewModel<any, any> {

		return this.viewModels.get( model );

	}

	static onViewModelSelected ( viewModel: IViewModel<any, any> ): void {

		viewModel?.onSelect();

		const inspector = viewModel?.getInspector?.();

		if ( inspector ) {

			AppInspector.setDynamicInspector( inspector );

		}
	}

	static onViewModelUnselected ( viewModel: IViewModel<any, any> ): void {

		viewModel?.onDeselect();

		AppInspector.clear();

	}

	static removeViewModel ( viewModel: IViewModel<any, any> ): void {

		viewModel?.remove();

		if ( viewModel ) ViewManager.remove( viewModel );

	}

}
