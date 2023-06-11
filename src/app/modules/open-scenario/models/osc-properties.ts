/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { File } from './osc-common';

export class Properties {

	public properties: Property[];
	public files: File[];

}

export class Property {

	public name: string;
	public value: string;

}
