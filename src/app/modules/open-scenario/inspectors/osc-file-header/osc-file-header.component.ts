import { Component, OnInit, Input } from '@angular/core';
import { OscFileHeader } from '../../models/osc-file-header';

@Component( {
    selector: 'app-osc-file-header',
    templateUrl: './osc-file-header.component.html'
} )
export class OscFileHeaderComponent implements OnInit {

    @Input() fileHeader: OscFileHeader;

    constructor () { }

    ngOnInit () {



    }

}
