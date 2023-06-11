/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './osc-interfaces';
import { OscParameterDeclaration } from './osc-parameter-declaration';
import { OscPersonDescription } from './osc-person-description';

export class OscPedestrianController extends AbstractController {

	private m_Name: string;
	private m_ParameterDeclaration: OscParameterDeclaration;
	private m_PersonDescription: OscPersonDescription;

}
