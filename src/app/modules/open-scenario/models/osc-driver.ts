/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './osc-interfaces';
import { ParameterDeclaration } from './osc-parameter-declaration';
import { PersonDescription } from './osc-person-description';

export class Driver extends AbstractController {

	private m_ParameterDeclarations: ParameterDeclaration[];
	private m_Description: PersonDescription;

}
