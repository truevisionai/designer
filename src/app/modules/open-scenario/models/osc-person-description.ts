/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Sex } from './osc-enums';
import { Properties } from './osc-properties';

export class PersonDescription {

	private weight: number;
	private height: number;
	private eyeDistance: number;
	private age: number;
	private sex: Sex;
	private properties: Properties = new Properties;

}
