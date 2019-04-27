import {Component, OnInit} from '@angular/core';
import {NbThemeService} from "@nebular/theme";
import { LocalDataSource } from 'ng2-smart-table';
import { SmartTableService } from '../../../../@core/mock/smart-table.service';
import { VrService } from '../../service/vr.service';
import { VrEduService } from '../../../edu/services/vr.edu.service';


export class ProfileCv {
  title: string = 'Empty Cv';
  cols: string = 'col-md-12';
  children: ProfileCvSection[] = [];
}

export class ProfileCvSection {
  title: string = 'Empty Section';
  children: ProfileCvItem[] = [];
}
export class ProfileCvItem {
  title: string = 'No Item Title';
  name: string = 'No Item Name';
  info: any;
}

@Component({
  selector: 'ngx-profile',
  styleUrls: ['./profile.component.scss'],
  templateUrl: './profile.component.html',
})

export class ProfileComponent implements  OnInit {
  public ProfileCv: any = {student:{contact:{firstName:'',lastName:'',nin:'',positionSuffix:'',email:''}}};
  public student: any = {};
  public Picture: string ='http://eniso.info/fs/' ;

  constructor(
    private vrService: VrService, 
    private vrEduService: VrEduService, 
    private service: SmartTableService) {
    const data = this.service.getData();
    this.source.load(data);
  }
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      Project : {
        title: 'Project Name',
        type: 'string',
      },
      Module: {
        title: 'Module Name',
        type: 'string',
      },
      Coach: {
        title: 'My coach',
        type: 'string',
      },
    },
  };

  source: LocalDataSource = new LocalDataSource();



  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }
  ngOnInit(): any {
    this.vrEduService.getCurrentStudent().subscribe(s => {
      this.student = s;
      this.vrService.getPicture(this.student.user.id).subscribe(p => {
        this.Picture = this.Picture + p;
        this.vrEduService.getAcademicStudentCv(this.student.id).subscribe(cv => {
          this.ProfileCv = cv;
          console.log(cv);
        })
      })
    });
  }
}







