/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Metadata {
	guid: string;
	path: string;
	isFolder?: boolean;
	importer: string;
	data: any;
	preview?: any;
}

export interface DynamicMeta<T> {
	guid: string;
	path: string;
	importer: string;
	data: T;
}
