
export interface IViewModel<TModel, TView> {

	render ( model: TModel, view: TView ): void;

	update ( model: TModel, view: TView ): void;

	remove ( model: TModel, view: TView ): void;

	onSelect?( model: TModel ): void;

	onDeselect?( model: TModel ): void;

}
