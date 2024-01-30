/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ToolHints<T> {
	toolOpened: () => string;
	toolClosed: () => string;
	objectAdded: ( object: T ) => string;
	objectUpdated: ( object: T ) => string;
	objectRemoved: ( object: T ) => string;
	objectSelected: ( object: T ) => string;
	objectUnselected: ( object: T ) => string;
	pointAdded: () => string;
	pointUpdated: () => string;
	pointRemoved: () => string;
	pointSelected: ( object: T ) => string;
	pointUnselected: () => string;
	assetDropped: () => string;
}