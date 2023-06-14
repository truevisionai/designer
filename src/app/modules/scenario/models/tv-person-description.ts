/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Sex } from './tv-enums';
import { Properties } from './tv-properties';

export class PersonDescription {

	private weight: number;
	private height: number;
	private eyeDistance: number;
	private age: number;
	private sex: Sex;
	private properties: Properties = new Properties;

}
