import {Component, OnInit} from '@angular/core';
import {NbThemeService} from '@nebular/theme';
import 'ckeditor';
import '../../../../pages/editors/ckeditor/ckeditor.loader';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Location} from '@angular/common';
import {log} from 'util';

import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';

import 'style-loader!angular2-toaster/toaster.css';
import { VrService } from '../../service/vr.service';
import { VrSharedState } from '../../service/vr.shared-state';
import { VrWpmService } from '../../../wpm/services/vr.wpm.service';

declare let jsPDF: any;


export class FormEntitySectionRow {
  title: string = 'Empty Row';
  cols: string = 'col-md-12';
  children: FormEntitySectionColumn[] = [];
}

export class FormEntitySectionColumn {
  title: string = 'Empty Column';
  children: FormEntitySectionPanel[] = [];
}

export class FormEntitySectionPanel {
  title: string = 'Empty Panel';
  children: FormEntityField[] = [];

}

export class FormEntityField {
  title: string = 'No Field Title';
  name: string = 'No Field Name';
  effectivePersistAccessLevel: string;
  simpleProperties: string;
  dataType: any;
  manyToOne: boolean;
  system: boolean;
  enabled: boolean = true;
  control: FControl = FControl.TEXT;
  vals: any;
  target: any;
  nullable: boolean;
  value: string;
}

export enum EditorMode {
  PERSIST,
  UPDATE,
  READ
}

export enum FControl {
  TEXT,
  TEXTAREA,
  EDITOR,
  CHECKBOX,
  DROPDOWNLIST,
  RATING,
  FILE,
  DATE,
}

export class FormEntityConfig {

  id: string;
  listFilter: string;
  values: {};
  disabledFields: string[];
  selectedFields: string[];
  searchExpr: string;
  ignoreAutoFilter: string;
}


@Component({
  selector: 'ngx-form-entity',
  styleUrls: ['./form-entity.component.scss'],
  templateUrl: './form-entity.component.html',
})


export class FormEntityComponent implements OnInit {
  public entityName: string = 'AppUser';
  public entityInfo: any = {};
  public editorRows: FormEntitySectionRow[] = [];
  public editorMode: EditorMode = EditorMode.PERSIST;
  public editorConfig: FormEntityConfig = new FormEntityConfig();
  public objs: any = {};
  public data: any = {};
  public ElementId: number;

  themeName = 'default';
  settings: Array<any>;
  themeSubscription: any;
  buttonsViews = [{
    title: 'Default Buttons',
    key: 'default',
  }, {
    title: 'Outline Buttons',
    key: 'outline',
  }];
  //  ---------------------------Ramzi----------------------------
  public elements: any = {'null': null};
  public elementsTitles: any = {};
  public entityTitle: string = '';
  public foreignElements: any = {};
  public foreignElementEntityValue: any = {};
  public isElementIsForeign = {};
  public entityData: any = [];
  public entityDataArranged: any = [];
  public entityKeys: string[] = [];
  public isNew: boolean = false;
  public isList: boolean = !this.isNew;
  public entityTableHead: any = [];
  public pdfTableHead: any = [];
  public pdfHeadTitles: any = [];
  public tableHeadNames: any = {};

  public found: any = {};
  public enable = false;
  public edit = false;
  public idFounded: number;

  tableHead = {
    actions: {
      add: false,
      edit: false,
    },
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
    columns: {},
  };
  dataBodyTable = [{
    fullName: 'Marwa Ajmi',
    empFunction: 'admin',
    situation: 'Marié',
    category: 'catégorie_1',
    echelon: 'echelon1',
  }];
  public newForeignElementIsHere: boolean = false;
  public pageUrl: string;
  config: ToasterConfig;
  position = 'toast-top-right';
  animationType = 'fade';
  title = 'HI there!';

  //  ----------------------------------------------------------------
  content = `I'm cool toaster!`;
  timeout = 3000;
  toastsLimit = 5;
  type = 'default';
  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;
  types: string[] = ['default', 'info', 'success', 'warning', 'error'];
  animations: string[] = ['fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'];
  positions: string[] = ['toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center',
    'toast-top-right', 'toast-bottom-right', 'toast-bottom-center', 'toast-bottom-left', 'toast-center'];

  //  -------------------------------------------------


  //  NOT Really Needed!

  //  private countSectionDepth(sectionInfo): number {
  //    let count = 1;
  //    for (let obj of sectionInfo.children) {
  //      if (obj.typeName == 'section') {
  //        let t = 1 + this.countSectionDepth(obj);
  //        if (t > count) {
  //          count = t;
  //        }
  //      } else {
  //        let t = 1 + 1;
  //        if (t > count) {
  //          count = t;
  //        }
  //      }
  //    }
  //    return count;
  //  }
  //
  //  private countSubSections(sectionInfo): number {
  //    let nbr = 0;
  //    let nbrExtra = 0;
  //    for (let obj of sectionInfo.children) {
  //      if (obj.typeName == 'section') {
  //        nbr++;
  //      } else {
  //        nbrExtra = 1;
  //      }
  //    }
  //    return nbrExtra + nbr;
  public targetEntityName: any = [];
  public signe: any = {};
  public entityFilters: any[];
  public autoFilterValues = {};
  //  }
  private numberOfManyToOneRelation: number;
  private numberOfManyToOneGot: any = 0;
  private pdfDataBody: any = [];
  private fieldsNames: any = [];
  private fields: any = {};
  private fieldToAppField: any;

  constructor(
    private toasterService: ToasterService,
    private vrService: VrService,
    private vrWpmService: VrWpmService,
    private vrSharedModel: VrSharedState,
    private themeService: NbThemeService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router) {
    this.themeSubscription = this.themeService.getJsTheme().subscribe(theme => {
      this.themeName = theme.name;
      this.init(theme.variables);
    });
  }

  public onSave() {


    // log('OnSave_________________________: ')
    // log('this.entityInfo : ', JSON.stringify(this.entityInfo));
    // log('this.entityKeys : ', JSON.stringify(this.entityKeys));

    if (this.isNew) {
      //  log(this.entityName);
      const xTitles = document.getElementsByClassName('col-sm-3 col-form-label');
      const xValues = document.getElementsByClassName('form-control');

      let i: number;
      let j: number;
      for (const key of Object.keys(this.elements)) {
        for (i = 0; i < xTitles.length; i++) {
          if ((<HTMLInputElement>xTitles[i]).innerText.localeCompare(this.elementsTitles[key]) === 0) {
            if (this.isElementIsForeign[key] == true) {
              for (const fkey of Object.keys(this.foreignElements)) {
                if (fkey == key) {
                  for (j = 0; j < this.foreignElements[fkey].length; j++) {
                    if (this.foreignElements[fkey][j].name == (<HTMLInputElement>xValues[i]).value) {
                      this.elements[key] = this.foreignElements[fkey][j];
                      break;
                    }
                  }
                }
              }
            } else {
              this.elements[key] = (<HTMLInputElement>xValues[i]).value;
              break;
            }
          }
        }
      }
      this.elements['id'] = this.ElementId;
      delete this.elements['system'];
      for (const elemt of Object.keys(this.elements)) {
        if (JSON.stringify(this.elements[elemt]).localeCompare('""') === 0) {
          this.elements[elemt] = null;
        }
      }

      return this.vrService.saveDataToBase(JSON.stringify(this.elements), this.entityTitle);
    } else {
      alert('You need to fill the data');
    }
    // log(JSON.stringify(this.entityInfo));
  }

  public onList() {




    this.edit = false;
    this.ElementId = null;


    const xTitles = document.getElementsByClassName('col-sm-3 col-form-label');
    const xValues = document.getElementsByClassName('form-control');
    let i: number;
    for (const key of Object.keys(this.elements)) {
      for (i = 0; i < xTitles.length; i++) {
        if ((<HTMLInputElement>xTitles[i]).innerText.localeCompare(this.elementsTitles[key]) === 0) {
          if (this.isElementIsForeign[key] == true) {
            const DropdownList = (document.getElementById('form-control-' + key)) as HTMLSelectElement;

            DropdownList.selectedIndex = 0;
          } else {
            (<HTMLInputElement>xValues[i]).value = '';
            break;
          }
        }
      }
    }


    this.edit = false;
    this.isList = true;
    this.isNew = false;
    this.signe = {}
    const x = document.getElementById('ifEditOrNew');
    if ((this.edit && this.enable) || (this.isNew)) {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }
  }

  public onNew() {





    this.idFounded = 0;
    this.enable = false;
    this.isNew = true;
    this.isList = false;
    const x = document.getElementById('ifEditOrNew');
    if ((this.edit && this.enable) || (this.isNew)) {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }
    // this.onChangedEntityInfo();

  }

  init(colors: any) {
    this.settings = [];
    this.settings = [{
      class: 'btn-hero-primary',
      container: 'primary-container',
      title: 'Primary Button',
      fun: () => {
        this.onSave().subscribe(response => {
            log('responce: ' + JSON.stringify(response));
            if ('{"_isScalar":false}' === JSON.stringify(response)) {
              this.showToast('error', null, 'Erreur: vérifiez votre formulaire');
            } else {
              this.showToast('success', null, 'C\'est bien enregistré');
              this.onList();
              this.edit = false;
              this.enable = false;
              this.onReflesh();
            }
          }
        )
        ;

      },
      buttonTitle: 'Enregistrer',
      default: {
        gradientLeft: `adjust-hue(${colors.primary}, 20deg)`,
        gradientRight: colors.primary,
      },
      corporate: {
        color: colors.primary,
        glow: {
          params: '0 0 20px 0',
          color: 'rgba (115, 161, 255, 0.5)',
        },
      },
      cosmic: {
        gradientLeft: `adjust-hue(${colors.primary}, 20deg)`,
        gradientRight: colors.primary,
        bevel: `shade(${colors.primary}, 14%)`,
        shadow: 'rgba (6, 7, 64, 0.5)',
        glow: {
          params: '0 2px 12px 0',
          color: `adjust-hue(${colors.primary}, 10deg)`,
        },
      },
    }, {
      class: 'btn-hero-warning',
      container: 'warning-container',
      title: 'Warning Button',
      fun: () => {
        this.found = {};
        // log('Newww' + JSON.stringify(this.found));
        this.onNew();
      },
      buttonTitle: 'Nouveau',
      default: {
        gradientLeft: `adjust-hue(${colors.warning}, 10deg)`,
        gradientRight: colors.warning,
      },
      corporate: {
        color: colors.warning,
        glow: {
          params: '0 0 20px 0',
          color: 'rgba (256, 163, 107, 0.5)',
        },
      },
      cosmic: {
        gradientLeft: `adjust-hue(${colors.warning}, 10deg)`,
        gradientRight: colors.warning,
        bevel: `shade(${colors.warning}, 14%)`,
        shadow: 'rgba (33, 7, 77, 0.5)',
        glow: {
          params: '0 2px 12px 0',
          color: `adjust-hue(${colors.warning}, 5deg)`,
        },
      },
    }, {
      class: 'btn-hero-success',
      container: 'success-container',
      title: 'Actualiser',
      buttonTitle: 'Actualiser',
      fun: () => {
        this.onReflesh();
      },
      default: {
        gradientLeft: `adjust-hue(${colors.success}, 20deg)`,
        gradientRight: colors.success,
      },
      corporate: {
        color: colors.success,
        glow: {
          params: '0 0 20px 0',
          color: 'rgba (93, 207, 227, 0.5)',
        },
      },
      cosmic: {
        gradientLeft: `adjust-hue(${colors.success}, 20deg)`,
        gradientRight: colors.success,
        bevel: `shade(${colors.success}, 14%)`,
        shadow: 'rgba (33, 7, 77, 0.5)',
        glow: {
          params: '0 2px 12px 0',
          color: `adjust-hue(${colors.success}, 10deg)`,
        },
      },
    }, {
      class: 'btn-hero-info',
      container: 'info-container',
      title: 'Liste',
      fun: () => {
        this.onList();
      },
      buttonTitle: 'Liste',
      default: {
        gradientLeft: `adjust-hue(${colors.info}, -10deg)`,
        gradientRight: colors.info,
      },
      cosmic: {
        gradientLeft: `adjust-hue(${colors.info}, -10deg)`,
        gradientRight: colors.info,
        bevel: `shade(${colors.info}, 14%)`,
        shadow: 'rgba (33, 7, 77, 0.5)',
        glow: `adjust-hue(${colors.info}, -5deg)`,
      },
    }
      , {
        class: 'btn-hero-danger',
        container: 'danger-container',
        title: 'Danger Button',
        fun: () => {
          this.generatePDF();
        },
        buttonTitle: 'PDF',
        default: {
          gradientLeft: `adjust-hue(${colors.danger}, -20deg)`,
          gradientRight: colors.danger,
        },
        cosmic: {
          gradientLeft: `adjust-hue(${colors.danger}, -20deg)`,
          gradientRight: colors.danger,
          bevel: `shade(${colors.danger}, 14%)`,
          shadow: 'rgba (33, 7, 77, 0.5)',
          glow: `adjust-hue(${colors.danger}, -10deg)`,
        },
      }, {
        class: 'btn-hero-secondary',
        container: 'secondary-container',
        title: 'Ghost Button',
        buttonTitle: 'Recalculer',
        default: {
          border: '#dadfe6',
        },
        cosmic: {
          border: colors.primary,
          bevel: '#665ebd',
          shadow: 'rgba (33, 7, 77, 0.5)',
          glow: 'rgba (146, 141, 255, 1)',
        },
      }];
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    //  alert('jamais...');
    this.route.queryParamMap.subscribe(pm => {
      let v = pm.get('object');
      if (v) {
        //   log(v); //  v = {id:'1' , name: 'manel'}
        this.editorConfig = Object.assign(new FormEntityConfig(), JSON.parse(v));
      }
    });
    this.route.paramMap
      .map((p: ParamMap) => {
        let v = p.get('name');
        //   alert('name='+v);
        this.entityName = v;
        this.vrService.getPersistenceUnitInfo().subscribe(s => {
          if (s && s.typeName) {
            this.entityInfo = this.vrService.findEntityInfo(s, this.entityName);
            this.getAutoFilter(this.entityName);
            this.fieldsNames = [];
            this.fields = {};
            this.fieldToAppField = {};
            this.searchFields(this.entityInfo);
            this.targetEntityName = [];
            this.onList();
            this.numberOfManyToOneRelation = this.numberOfManyToOne(this.entityInfo);
            this.onChangedEntityInfo();
            this.onReflesh();

            this.vrWpmService.getDataBulletinSalary('1').subscribe(u => {
              log('test:');
              console.log(u);
            });
            // log('********************************')
            // log(JSON.stringify(this.entityInfo));
            // log('********************************')

          }
        });
      }).subscribe();
    this.pageUrl = window.location.href;
    this.pageUrl = this.pageUrl.substr(0, 1 + this.pageUrl.toString().lastIndexOf('/'));
  }

  // ----------------------Ramzi----------------------
  public findForeignValues() {
    // log(this.entityData.length);
    // alert('foreignElements : ' + JSON.stringify(this.foreignElements));
    for (let k = 0; k < this.entityData.length; k++) {
      const localValues: any = {};
      for (const key in this.entityData[k]) {
        if (this.isElementIsForeign[key] == true) {
          for (let fkey of Object.keys(this.foreignElements)) {
            if (fkey == key) {
              for (let j = 0; j < this.foreignElements[fkey].length; j++) {
                if (this.foreignElements[fkey][j].id == this.entityData[k][key].id) {
                  localValues[key] = this.foreignElements[fkey][j].name;
                  break;
                }
              }
            }
          }
        }
      }
      this.foreignElementEntityValue[k] = localValues;
    }
    // alert('foreignElementEntityValue' + JSON.stringify(this.foreignElementEntityValue));
  }

  public getArrangedData() {
    for (let i = 0; i < this.entityData.length; i++) {
      for (let key in this.entityData[i]) {
        if (this.isElementIsForeign[key]) {
          this.entityData[i][key] = this.foreignElementEntityValue[i][key]
        }
      }
    }
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.vrService.removeFromDataBase(event.data.id, this.entityTitle);
      event.confirm.resolve();
      this.onReflesh();
    } else {
      event.confirm.reject();
    }
  }

  onRowSelect(event): void {
    if (event.source.sortConf[0] !== undefined) {
      const field = event.source.sortConf[0].field;
      if (this.signe[field] === undefined) {
        this.signe[field] = -1;
      }
      this.signe[field] = -this.signe[field];
      const signe = this.signe[field];
      this.dataBodyTable.sort(function (obj1: any, obj2: any) {
        return signe * (obj1[field] + '').localeCompare(obj2[field]);
      });
    }
  }

  public onReflesh() {
    this.newForeignElementIsHere = false;
    this.vrService.getEntityData(this.entityTitle).subscribe((data) => {
      this.entityData = data;
      // alert('this.entityData: ' + JSON.stringify(this.entityData));
      this.findForeignValues();
      this.getArrangedData();
      // alert('i have what a need: this.' + JSON.stringify(this.foreignElements));
      this.tableHeadNames = {};
      this.entityTableHead = [];
      this.pdfTableHead = [];
      this.pdfHeadTitles = [];
      this.fillTableDynamically(this.entityInfo);
      // alert('this.entityData: ' + JSON.stringify(this.entityData));
      // this.dataBodyTable.forEach((element) => {});
      this.newForeignElementIsHere = true;
      if (JSON.stringify(this.entityData).toString() === '[]') {
        this.onNew();
      }
    })
  }

  /******************************************/
  onEdit(event): void {
    this.onNew();
    console.clear();

    this.ElementId = event.data.id;
    this.edit = true;
    let entity = {};

    this.entityData.forEach(elmt => {
      if (elmt.id === event.data.id) {
        entity = elmt;
      }
    });


    const xTitles = document.getElementsByClassName('col-sm-3 col-form-label');
    const xValues = document.getElementsByClassName('form-control');

    let i: number;
    let j: number;
    for (const key of Object.keys(this.elements)) {
      for (i = 0; i < xTitles.length; i++) {
        if ((<HTMLInputElement>xTitles[i]).innerText.localeCompare(this.elementsTitles[key]) === 0) {
          if (this.isElementIsForeign[key] == true) {
            // log(key + ' ' +  entity[key]);
            for (const fkey of Object.keys(this.foreignElements)) {
              if (fkey == key) {
                for (j = 0; j < this.foreignElements[fkey].length; j++) {
                  if (this.foreignElements[fkey][j].name == entity[key]) {
                    const DropdownList = (document.getElementById('form-control-' + key)) as HTMLSelectElement;
                    DropdownList.selectedIndex = j;
                    break;
                  }
                }
              }
            }
          } else {
            if (this.isDate(entity[key] + '')) {
              const date = new Date(entity[key]);
              const y = date.getFullYear();
              const m = (date.getMonth() + '').length === 1 ? '0' + date.getMonth() : date.getMonth();
              const d = (date.getDate() + '').length === 1 ? '0' + date.getDate() : date.getDate();
              (<HTMLInputElement>xValues[i]).value = y + '-' + m + '-' + d;
            } else {
              if ( entity[key] === undefined ) {
                (<HTMLInputElement>xValues[i]).value = '';
              } else {
                (<HTMLInputElement>xValues[i]).value = entity[key];
              }
            }
            break;
          }
        }
      }
    }
  }

  public onSelectFilterOption(title) {
    const filterValue = (<HTMLInputElement>document.getElementById('filterOption_' + title)).value;
    this.entityFilters.forEach(elmt => {
      if (elmt.name === title) {
        elmt.values.forEach(l => {
          if (l.name === filterValue) {
            this.autoFilterValues[title] = l.id + '';
          }
        });
      }
    });


    this.newForeignElementIsHere = false;
    this.vrService.findDocumentsByAutoFilter(this.entityName, this.autoFilterValues).subscribe((data) => {
      log(JSON.stringify(data));
      this.entityData = data;
      // alert('this.entityData: ' + JSON.stringify(this.entityData));
      this.findForeignValues();
      this.getArrangedData();
      // alert('i have what a need: this.' + JSON.stringify(this.foreignElements));
      this.tableHeadNames = {};
      this.entityTableHead = [];
      this.pdfTableHead = [];
      this.pdfHeadTitles = [];
      this.fillTableDynamically(this.entityInfo);
      // alert('this.entityData: ' + JSON.stringify(this.entityData));
      // this.dataBodyTable.forEach((element) => {});
      this.newForeignElementIsHere = true;

    })
  }


  private searchFields(item: any) {
    if (item.typeName === 'section' || item.typeName === 'entity') {
      item.children.forEach((element) => {
        this.searchFields(element);
      });
    } else if (item.typeName === 'field' && item.compositionRelationship === undefined) {
      const obj = {
        'name': item.name,
        'dataKey': item.name,
        'title': item.title,
      };
      if (item.dataType.properties.targetEntityName !== undefined) {
        this.fieldToAppField[item.name] = item.dataType.properties.targetEntityName;
      }
      this.fieldsNames.push(obj);
      this.fields[item.name] = item;
    }
  }

  private createFormEntityField(field): FormEntityField {

    let f = new FormEntityField();
    //  this.found={};
    this.idFounded = 0;
    f.nullable = field.nullable;
    f.name = field.name;
    f.title = field.title;
    f.value = '';
    f.dataType = field.dataType;
    f.effectivePersistAccessLevel = field.effectivePersistAccessLevel;
    f.simpleProperties = field.simpleProperties;
    f.system = field.system;

    if (field.system) {
      return null;
    }
    const accessLevel = this.editorMode == EditorMode.PERSIST ? field.effectivePersistAccessLevel : this.editorMode == EditorMode.UPDATE ? field.effectiveUpdateAccessLevel : field.effectiveReadAccessLevel;
    if (accessLevel == "INACCESSIBLE") {
      return null;
    } else if (accessLevel == "READ_ONLY") {
      f.enabled = false;
    } else if (accessLevel == "READ_WRITE") {
      f.enabled = true;

    }
    //  if(this.editorConfig.disabledFields.indexOf(f.name)>=0){
    //    f.enabled=false;
    //  }
    switch (field.dataType.typeName) {
      case "net.vpc.upa.types.StringType":
      case "net.vpc.upa.types.IntType":
      case "net.vpc.upa.types.LongType":
      case "net.vpc.upa.types.DoubleType":
      case "net.vpc.upa.types.TimestampType": {
        f.control = FControl.TEXT;
        //  alert( "yes text");
        break;
      }
      case "net.vpc.upa.types.DateTimeType": {
        f.control = FControl.DATE;
        break;
      }

      case "net.vpc.upa.types.EnumType" :
      case "net.vpc.upa.types.ManyToOneType": {
        f.control = FControl.DROPDOWNLIST;
        break;
      }
      case "net.vpc.upa.types.BooleanType" : {
        f.control = FControl.CHECKBOX;
        break;
      }
    }
    if (this.edit) {
      f.enabled = false;
      //  alert('Edit Value from "if" section '+ this.edit);
      this.vrService.findElement(this.entityName, this.ElementId).subscribe(found => {
          this.found = found;
          // log('EDITTT '+JSON.stringify(this.found));

          if (f.control == FControl.TEXT) {
            for (const key of Object.keys(this.found)) {
              //  alert('Key= '+ key +'   Field Name  '+ f.name);
              // alert('This.data= ' );
              if (key == 'id') {
                this.idFounded = this.found[key];
              }
              if (key == f.name && key != 'id') {
                f.value = this.found[key];
              }
            }
          }
        }
      )
      this.enable = true;

      f.enabled = true;

    }

    // log('VALUEEEEE F '+JSON.stringify(f.value.fullName));
    if (field.manyToOne) {
      f.control = FControl.DROPDOWNLIST;
    }
    // log(JSON.stringify(field.simpleProperties));
    if (field.simpleProperties["ui.form.control"] != null) {
      let result = FControl[<string>(field.simpleProperties["ui.form.control"])];
      if (result == "rating") {
        f.control = FControl.RATING;
      } else if (result == "file") {
        f.control = FControl.FILE;
      } else if (result == "richtextarea") {
        f.control = FControl.EDITOR;
      } else {
        f.control = FControl.TEXTAREA;
      }

    }
    if (f.control == FControl.DROPDOWNLIST) {
      // alert(JSON.stringify(f));
      //  log('these are fvalues = ' + JSON.stringify(f.values));
      this.numberOfManyToOneGot = 0;
      this.vrService.getSelectList(this.entityName, f.name, null, null).subscribe(val => {

        f.vals = val;
        this.numberOfManyToOneGot++;
        // ----------------------Ramzi--------------------------
        this.foreignElements[f.name] = f.vals;
        /**
         * MYBK
         */
        if (this.numberOfManyToOneRelation == this.numberOfManyToOneGot) {

          this.vrService.getEntityData(this.entityTitle).subscribe((data) => {
            this.entityData = data;
            // alert('this.entityData: ' + JSON.stringify(this.entityData));
            this.findForeignValues();
            this.getArrangedData();
            // alert('i have what a need: this.' + JSON.stringify(this.foreignElements));
            this.entityTableHead = [];
            this.pdfTableHead = [];
            this.pdfHeadTitles = [];
            this.fillTableDynamically(this.entityInfo);
            // alert('this.entityData: ' + JSON.stringify(this.entityData));
            // alert('this.dataBodyTable: ' + JSON.stringify(this.dataBodyTable));
            this.newForeignElementIsHere = true;
          })
        }
      });
      /******************************************/

    }
    return f;
  }

  private createFormEntitySectionRows(entityInfo): FormEntitySectionRow[] {
    let rows: FormEntitySectionRow[] = [];
    let emptyRow: FormEntitySectionRow = null;
    let emptyColumn: FormEntitySectionColumn = null;
    let emptySection: FormEntitySectionPanel = null;
    if (entityInfo.children) {
      for (let obj of entityInfo.children) {
        if (obj.typeName == 'section') {
          let row = this.createFormEntitySectionRow(obj);
          //   log ('the row under create section rowS = '+JSON.stringify(row));
          if (row != null && row.children.length > 0) {
            rows.push(row);
          }
        } else {
          if (emptyRow == null) {
            emptyRow = new FormEntitySectionRow();
            emptyColumn = new FormEntitySectionColumn();
            emptyRow.children.push(emptyColumn);
            emptySection = new FormEntitySectionPanel();
            emptyColumn.title = 'No Section';
            emptyColumn.children.push(emptySection);

          }

          let field = this.createFormEntityField(obj);
          //  log('this.createFormEntityField(obj)\n', field);
          if (field != null) {
            if (emptySection.children.length == 0) {
              rows.push(emptyRow);
            }
            emptySection.children.push(field);
          }
        }
      }
      if (rows.length == 1 && emptySection != null) {
        // this section contains no sub sections!
        emptySection.title = 'Général';
      }

      //  the following code devides the cells
      for (let obj of rows) {
        let cols = 12 / obj.children.length;
        obj.cols = 'col-md-' + Math.ceil(cols);
      }
    }
    //  log('createFormEntitySectionRows result '+JSON.stringify(rows));
    return rows;
  }

  private createFormEntitySectionRow(sectionInfo) {
    //  let ss=this.countSubSections(section);
    let currentRow: FormEntitySectionRow = new FormEntitySectionRow();
    let emptyColumn: FormEntitySectionColumn = null;
    let emptySection: FormEntitySectionPanel = null;
    for (let obj of sectionInfo.children) {
      if (obj.typeName == 'section') {
        let col = this.createFormEntitySectionColumn(obj);
        //  log ('the cols under create section row = '+JSON.stringify(col));
        if (col != null && col.children.length > 0) {
          currentRow.children.push(col);
        }
        // new FormEntitySectionRow()
      } else {
        // alert('createFormEntitySectionRow why '+obj.typeName);
        if (emptyColumn == null) {
          emptyColumn = new FormEntitySectionColumn();
          emptySection = new FormEntitySectionPanel();
          emptyColumn.children.push(emptySection);

        }
        const field = this.createFormEntityField(obj);
        if (field != null) {
          if (currentRow.children.length == 0) {
            currentRow.children.push(emptyColumn);
          }
          emptySection.children.push(field);
        }

      }
    }
    if (currentRow.children.length == 1 && emptySection != null) {
      // this section contains no sub sections!
      emptySection.title = sectionInfo.title;
    }
    if (currentRow.children.length == 0) {
      return null;

    }
    //  log('createFormEntitySectionRow result '+JSON.stringify(currentRow));
    return currentRow;
  }

  private createFormEntitySectionColumn(sectionInfo): FormEntitySectionColumn {
    let currentColumn: FormEntitySectionColumn = new FormEntitySectionColumn();
    let emptySection: FormEntitySectionPanel = null;
    for (let obj of sectionInfo.children) {
      if (obj.typeName == 'section') {
        let section = this.createFormEntitySectionPanel(obj);
        if (section != null && section.children.length > 0) {
          currentColumn.children.push(section);
        }
        // new FormEntitySectionRow()
      } else {
        if (emptySection == null) {
          emptySection = new FormEntitySectionPanel();

        }
        let field = this.createFormEntityField(obj);
        if (field != null) {
          if (emptySection.children.length == 0) {
            currentColumn.children.push(emptySection);
          }
          emptySection.children.push(field);
        }
      }
    }
    if (currentColumn.children.length == 1 && emptySection != null) {
      // this section contains no sub sections!
      emptySection.title = sectionInfo.title;
    }
    if (currentColumn.children.length == 0) {
      //   return currentColumn; // problem
      return null;
    }
    return currentColumn;
  }

  private flattenFields(section, buffer: any[]): any[] {
    let t: any[] = [];
    for (let obj of section.children) {
      if (obj.typeName == 'section') {
        t = this.flattenFields(obj, t);
      } else {
        t.push(obj);
      }
    }
    return t;
  }

  private createFormEntitySectionPanel(sectionInfo): FormEntitySectionPanel {
    //  alert('createFormEntitySectionPanel ' + sectionInfo.name);
    let currentPanel: FormEntitySectionPanel = new FormEntitySectionPanel();
    currentPanel.title = sectionInfo.title;
    for (let obj of sectionInfo.children) {
      if (obj.typeName == 'section') {
        let t: any[] = [];
        // alert('before flattenFields '+sectionInfo.name);
        this.flattenFields(obj, t).forEach((element) => {
          let field = this.createFormEntityField(element);
          if (field != null) {
            currentPanel.children.push(field);
          }

        });
        // new FormEntitySectionRow()
      } else {
        let field = this.createFormEntityField(obj);
        if (field != null) {
          currentPanel.children.push(field);
        }
      }
    }
    if (currentPanel.children.length == 0) {
      return null;
    }
    return currentPanel;
  }

  private onChangedEntityInfo() {
    // alert('updateRows '+JSON.stringify(this.entityInfo));
    // console.clear();
    // log(this.entityInfo);

    // ---------------- Ramzi ------------------------

    this.entityTitle = this.entityInfo.name;
    this.entityKeys = [];
    this.elements = {};
    this.elementsTitles = {};
    this.foreignElements = {};
    this.foreignElementEntityValue = {};
    this.isElementIsForeign = {};

    this.entityFilters = [];
    this.autoFilterValues = {};
    // this.entityInfo.children.forEach(element => {
    //   log('I push');
    //   if (element.name != 'system') {
    //     this.entityKeys.push(element.name);
    //     log(element.name);
    //   }
    //   this.elements[element.name] = '';
    //   log('this.elements[' + element.name + '] = \'\'' + this.elements[element.name]);
    //   this.elementsTitles[element.name] = element.title;
    //   log('this.elementsTitles[' + element.name + '] = ' + element.title + ';');
    //   this.isElementIsForeign[element.name] = element.manyToOne;
    //   log('this.isElementIsForeign[' + element.name + '] = ' + element.manyToOne + ';');
    //   log('*******************');
    // });
    // ***************** MYBK *****************
    this.fillEntityKeysData(this.entityInfo);
    // ****************************************
    // log(this.entityKeys);


    // log(this.foreignElementEntityValue);
    // log(this.elements);

    // ---------------------------------------------

    this.editorRows = this.createFormEntitySectionRows(this.entityInfo);
    // log(' editorRows:  ' + JSON.stringify(this.editorRows));
  }

  // **************** MYBK - MAJ ****************
  private fillEntityKeysData(entityInfo: any) {
    entityInfo.children.forEach(element => {
      if (element.typeName == 'section') {
        this.fillEntityKeysData(element);
      } else {
        if (element.name != 'system' && element.system == false) {
          this.entityKeys.push(element.name);
          // alert(element.name);

          this.elements[element.name] = '';
          this.elementsTitles[element.name] = element.title;
          this.isElementIsForeign[element.name] = element.manyToOne;
        }
      }
    });
  }

  /**
   * count the number of manyToOne relation.
   * @param entityInfo
   */
  private numberOfManyToOne(entityInfo: any) {

    let a: number = 0;
    entityInfo.children.forEach(element => {
      if (element.typeName == 'section') {
        a += this.numberOfManyToOne(element);
      } else {
        if (element.name != 'system' && element.system == false && element.manyToOne == true) {
          const objHead: any = {};

          objHead['target'] = element.dataType.properties.targetEntityName;
          objHead['name'] = element.name;
          this.targetEntityName.push(objHead);

          a++;
        }
      }
    });
    // alert(JSON.stringify(this.targetEntityName));
    return a;
  }

  private fillTableDynamically(entityInfo: any) {
    /**
     * filling  Head table with sittings dynamically...
     */

    entityInfo.children.forEach(element => {
      if (element.typeName == 'section') {
        this.fillTableDynamically(element);
      } else {
        // alert('element.name: ' + element.name + 'element.main: ' + element.main);
        if (element.name != 'system' /*&& element.main === 'true'*/) {
          if (element.main.toString() == 'true' || element.summary.toString() == 'true' || element.name == 'id') {
            this.entityTableHead.push(element);
            const objHead: any = {};
            objHead['title'] = element.title;
            this.tableHeadNames[element.name] = objHead;
            if (element.name !== 'id') {
              this.pdfTableHead.push(element.title);
              // alert(element.name);
              this.pdfHeadTitles.push(element.name);
            }
          }
        }
      }
    });
    this.tableHead.columns = this.tableHeadNames;
    /**
     * filling  body table with data dynamically...
     */
    this.dataBodyTable = [];
    for (let countED = 0; countED < this.entityData.length; countED++) {
      const objBody: any = {};
      for (let count = 0; count < this.entityTableHead.length; count++) {
        if (this.foreignElementEntityValue[countED][this.entityTableHead[count].name] != undefined) {
          objBody[this.entityTableHead[count].name] = this.foreignElementEntityValue[countED][this.entityTableHead[count].name];
        } else {
          objBody[this.entityTableHead[count].name] = this.entityData[countED][this.entityTableHead[count].name];
        }

      }
      // alert(JSON.stringify(objBody));
      this.dataBodyTable.push(objBody);
    }
    delete this.tableHeadNames['id'];
    // log('this.tableHeadNames   ' + JSON.stringify(this.tableHeadNames));
    // log('this.foreignElements: ' + JSON.stringify(this.foreignElements));
    // log('this.dataBodyTable: ' + JSON.stringify(this.dataBodyTable));
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      positionClass: this.position,
      timeout: this.timeout,
      newestOnTop: this.isNewestOnTop,
      tapToDismiss: this.isHideOnClick,
      preventDuplicates: this.isDuplicatesPrevented,
      animation: 'slideDown',
      limit: this.toastsLimit,
    });
    const toast: Toast = {
      type: type,
      title: title,
      body: body,
      timeout: this.timeout,
      showCloseButton: this.isCloseButton,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

  // ***************************************
  private generatePDF() {
    // alert(new Date().getDate().toString());
    // Only pt supported (not mm or in)
    const doc = new jsPDF('p', 'pt');

    const totalPagesExp = '{total_pages_count_string}';
    const entityTitle = this.entityInfo.title;
    const pageContent = function (data) {
      // HEADER
      doc.setFontSize(16);
      doc.setTextColor('#1c5178');
      doc.setFontStyle('normal');
      doc.text(entityTitle.toUpperCase(), data.settings.margin.left, 55);
      doc.setFontSize(11);
      doc.setTextColor('#223322');
      doc.setFontStyle('normal');

      const d = new Date();
      const months = ['January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

      doc.text(date, 465, 55);
      doc.setTextColor('#222222');
      doc.setDrawColor(12, 12, 12);
      doc.setLineWidth(0.2);
      doc.line(40, 60, 557, 60);
      doc.setLineWidth(0.1);
      // doc.line(40, 62, 558, 62);
      // if (base64Img) {
      //   doc.addImage(base64Img, 'JPEG', data.settings.margin.left, 15, 10, 10);
      // }

      // ****************************** FOOTER ******************************
      const str = 'Page ' + data.pageCount + ' of ' + totalPagesExp;

      doc.setFontSize(10);
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      doc.setLineWidth(0.2);
      doc.setTextColor('#222222');
      doc.setDrawColor(12, 12, 12);
      doc.line(40, pageHeight - 32, 558, pageHeight - 32);
      // doc.line(40, pageHeight - 30, 558, pageHeight - 30);

      doc.text(str, data.settings.margin.left, pageHeight - 20);
    };
    doc.autoTable(this.pdfTableHead, this.dataBodyToTable(this.pdfHeadTitles, this.dataBodyTable), {
      theme: 'grid',
      addPageContent: pageContent,
      startY: 80,
      showHeader: 'firstPage',
      margin: {top: 80},
    });


    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.entityInfo.title + '.pdf');
  }

  private dataBodyToTable(pdfHeadTitles, dataBodyTable) {
    this.pdfDataBody = [];
    dataBodyTable.forEach(element => {
      const tabAux: any = [];
      for (let i = 0; i < pdfHeadTitles.length; i++) {
        tabAux.push(element[pdfHeadTitles[i]]);
      }
      this.pdfDataBody.push(tabAux);
    });
    return this.pdfDataBody;
  }


  private getTitlesColumns() {
    const dataTable: any = [];
    for (let i = 0; i < this.pdfTableHead.length; i++) {
      const data: any = {};
      data.title = this.pdfTableHead[i];
      data.dataKey = this.pdfHeadTitles[i];
      dataTable.push(data);
    }
    log(JSON.stringify(dataTable))
    return dataTable;
  }


  private numberOfEachElement(comp) {
    const ddl: any = {};

    this.dataBodyTable.forEach(element => {

      if (ddl[element[comp]] !== undefined) {
        ddl[element[comp]] = ddl[element[comp]] + 1;
      } else {
        ddl[element[comp]] = 1;
      }
    });

    return ddl;
  }

  private getAutoFilter(entityName: string) {
    this.vrService.getEntityAutoFilters(entityName).subscribe(filters => {
      filters.forEach(filter => {
        this.vrService.getEntityAutoFilterValues(entityName, filter.name).subscribe(values => {
          filter.values = values;
          this.entityFilters = filters;
          console.log(this.entityFilters);
          console.log(this.fieldToAppField);
        });
      });
    })
  }

  private isDate(str: string) {
    let bll = false;
    const tableMonth = ['Jan', 'Jan', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Jul', 'Oct', 'Nov', 'Dec'];
    tableMonth.forEach(e => {
      if (e === str.split(' ')[0]) {
        bll = true;
      }
    });
    if (str.split(' ')[1] !== undefined && str.split(' ')[1][1] !== ',' && str.split(' ')[1][2] !== ',') {
      bll = false;
    }
    return bll;
  }

  redirectToAntherEntity(event) {
    alert(JSON.stringify(event));
  }
}



