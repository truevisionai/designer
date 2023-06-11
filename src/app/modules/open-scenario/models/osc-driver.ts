import { OscParameterDeclaration } from './osc-parameter-declaration';
import { OscPersonDescription } from './osc-person-description';
import { AbstractController } from './osc-interfaces';

export class OscDriver extends AbstractController {

	private m_ParameterDeclarations: OscParameterDeclaration[];
	private m_Description: OscPersonDescription;

}
