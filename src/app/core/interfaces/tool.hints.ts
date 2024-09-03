/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

interface ToolHints<T> {
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

export interface ObjectHintConfig {
	onSelected: string,
	onUnselected?: string,
	onAdded?: string,
}

export interface ToolHintConfig {
	objects: {
		[ key: string ]: ObjectHintConfig;
	}
	toolOpened: string;
	toolClosed: string;
}
