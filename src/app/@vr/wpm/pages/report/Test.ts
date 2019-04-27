import {Component, OnInit} from '@angular/core';
import {ToasterService} from 'angular2-toaster';
import {NbThemeService} from '@nebular/theme';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {log} from 'util';
import {element} from "protractor";
import { VrSharedState } from '../../../core/service/vr.shared-state';
import { VrService } from '../../../core/service/vr.service';

declare let jsPDF;


@Component({
  selector: 'ngx-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  themeSubscription: any;
  themeName: any;
  settings: any = [];
  public domainDataGoted: boolean = false;
  public firstBulletin: boolean = true;

  public entitiesNames: any = [];
  public fieldsNames: any = [];
  public orderBy: any;
  public entities: any = {};
  public entityName: string;
  public dataFromBaseGoted: boolean = false;
  public employeesName: any = [];
  public isBulletin: boolean = false;
  private fields: any = {};
  private dataFromBase: any = [];
  private employee: any;
  private pdfType: any;
  private entityTitle: any;
  private simpleData: any[];
  private primes: any [];
  private primesPerEmployee: any [];
  private employeeHourSupp: any;
  private hrsupp75: any;
  private hrsupp100: any;

  constructor(
    private toasterService: ToasterService,
    private vrModemState: VrSharedState,
    private vrService: VrService,
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

  ngOnInit(): void {
    this.vrModemState.domainModel.subscribe(
      domain => {
        if (domain.root) {
          this.searchEntities(domain.root);
          this.pdfType = 'Default';
          this.dataFromBaseGoted = false;
          this.fieldsNames = [];
          this.fields = {};
          this.entityName = 'PrEmployee';
          const entity = this.entities[this.entityName];
          this.entityTitle = entity.title;
          this.searchFields(entity);
          // log('********************************************');
          // log('fieldsNames: ' + JSON.stringify(this.fieldsNames));
          // log('********************************************');
          this.vrService.getEntityData(this.entityName).subscribe((data) => {
            // log(JSON.stringify(data));
            this.dataFromBase = data;
            this.simpleData = this.getSimpleData();
            this.dataFromBaseGoted = true;
          });
          const primes = [];
          const hsupp75 = [];
          const hsupp100 = [];
          this.vrService.getEntityData('PrPeriodEmployeeBonus').subscribe((data) => {
            for (let i = 0; i < data.length; i++) {
              primes.push({
                taux: '',
                designation: data[i].bonusType.name,
                number: data[i].number,
                base: data[i].value,
                employeeId: data[i].employee.id,
                gain: data[i].number * data[i].value,
              });

            }
            this.primes = primes;

            //  log(JSON.stringify(this.primes));
          });
          this.vrService.getEntityData('PrPeriodEmployee').subscribe((data) => {
            for (let i = 0; i < data.length; i++) {
              // log('Hsupp'+JSON.stringify(data));
              hsupp75.push({
                designation: 'Heures Supp à 75%',
                base: data[i].rappNet ,
                number: data[i].hsupp75,
                taux: '75',
                gain: 0.75 * (data[i].rappNet * data[i].hsupp75),
                employeeId: data[i].employee.id,
              });
              this.hrsupp75 = hsupp75;
              hsupp100.push({
                designation: 'Heures Supp à 100%',

                base: data[i].rappNet,

                taux: '100',
                number: data[i].hsupp100,
                gain:   data[i].hsupp100* 0.75,
                employeeId: data[i].employee.id,
              });
              this.hrsupp100 = hsupp100;
            }
            //  log('75%' + JSON.stringify(this.hrsupp75));
            //log('100%' + JSON.stringify(this.hrsupp100));
          });

        }
        this.domainDataGoted = true;
      },
    );
  }

  init(colors: any) {
    this.settings = [];
    this.settings = [{
      class: 'btn-hero-danger',
      container: 'danger-container',
      title: 'Danger Button',
      fun: () => {
        switch (this.pdfType) {
          case 'Default':
            this.generateDefaultPDF();
            break;
          case 'Ordered':
            this.generateOrderedPDF();
            break;
          case 'Bulletin':
            this.generateBulletinPDF();
            break;
        }
      },
      buttonTitle: 'Générer un pdf',
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
      class: 'btn-hero-primary',
      container: 'primary-container',
      title: 'Primary Button',
      fun: () => {
        // this.onSave().subscribe(response => {
        //     log('responce: ' + JSON.stringify(response));
        //     if ('{"_isScalar":false}' === JSON.stringify(response)) {
        //       this.showToast('error', null, 'Erreur: vérifiez votre formulaire');
        //     } else {
        //       this.showToast('success', null, 'C\'est bien enregistré');
        //       this.onList();
        //       this.edit = false;
        //       this.enable = false;
        //       this.onReflesh();
        //     }
        //   }
        // )
        // ;

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
        // this.found = {};
        // log('Newww' + JSON.stringify(this.found));
        // this.onNew();
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
        // this.onReflesh();
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
        // this.onList();
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

  getDataFromBase() {
    this.isBulletin = false;
    this.pdfType = 'Default';
    this.dataFromBaseGoted = false;
    this.fieldsNames = [];
    this.fields = {};
    this.entityName = (<HTMLInputElement>document.getElementById('entityNameSelect')).value;
    this.entityTitle = this.entities[this.entityName].title;
    const entity = this.entities[this.entityName];
    this.searchFields(entity);
    // log('******************************************** ');
    // log('fieldsNames: ' + JSON.stringify(this.fieldsNames));
    // log('********************************************');
    this.vrService.getEntityData(this.entityName).subscribe((data) => {
      // log(JSON.stringify(data));
      this.dataFromBase = data;
      this.simpleData = this.getSimpleData();
      this.dataFromBaseGoted = true;
    });
  }

  public handleChange() {
    // console.clear();
    this.isBulletin = false;
    switch (this.orderBy) {
      case -1:
        // log('Default');
        this.pdfType = 'Default';
        break;
      case -2:
        this.isBulletin = true;
        this.pdfType = 'Bulletin';
        // log('Bulletin');
        this.getEmployeesName();
        this.selectNameEmployee(0);
        this.generateBulletinPDF();
        // log(JSON.stringify(this.employeesName));
        break;
      default:
        this.pdfType = 'Ordered';
        // log(this.orderBy);
        // log(this.fieldsNames[this.orderBy].name);
        break;
    }
  }

  public selectNameEmployee(index) {
    this.employee = this.dataFromBase[index];
  }

  private searchEntities(item: any) {
    if (item.type === 'package') {
      item.children.forEach((element) => {
        this.searchEntities(element);
      });
    } else if (item.type === 'entity' && item.compositionRelationship === undefined) {
      this.entitiesNames.push({
        'name': item.name,
        'title': item.title,
      });
      this.entities[item.name] = item;
    }
  }

  private searchFields(item: any) {


    if (item.type === 'section' || item.type === 'entity') {
      item.children.forEach((element) => {
        this.searchFields(element);
      });
    } else if (item.type === 'field' && item.compositionRelationship === undefined) {
      if (item.main === true || item.summary === true) {
        this.fieldsNames.push({
          'name': item.name,
          'dataKey': item.name,
          'title': item.title,
        });
        this.fields[item.name] = item;
      }
    }
  }

  private getEmployeesName() {
    this.employeesName = [];
    this.dataFromBase.forEach(element => {
      this.employeesName.push(element.fullName);
    });
  }

  private generateDefaultPDF() {
    const doc = new jsPDF('p', 'pt');

    const totalPagesExp = '{total_pages_count_string}';
    const text: String = doc.splitTextToSize('Lorem Ipsum is simply dummy text of the printing and typesetting industry. ' +
      'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley ' +
      'of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap ' +
      'into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of ' +
      'Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus ' +
      'PageMaker including versions of Lorem Ipsum.'
      , 620, {});
    doc.setFontSize(13);
    doc.text(text, 42, 90);
    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    const entityTitle = this.entities[this.entityName].title;
    const pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor('#1c5178');
      doc.setFontStyle('normal');
      doc.text(entityTitle, data.settings.margin.left, 55);
      doc.setFontSize(11);
      doc.setTextColor('#223322');
      doc.setFontStyle('normal');


      doc.text(date, 465, 55);
      doc.setLineWidth(0.2);
      doc.setTextColor('#222222');
      doc.setDrawColor(12, 12, 12);
      doc.line(40, 60, 558, 60);
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
    doc.autoTable(this.fieldsNames, this.dataToTable(), {
      theme: 'grid',
      addPageContent: pageContent,
      startY: 200,
      showHeader: 'firstPage',
      margin: {top: 80},
    });
    doc.save();
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.entities[this.entityName].title + '_' + date.replace(' ', '_') + '.pdf');
  }


  private dataToTable() {
    const pdfDataBody: any = [];
    this.dataFromBase.forEach(element => {
      const tabAux: any = {};
      // log(JSON.stringify(element));
      for (let i = 0; i < this.fieldsNames.length; i++) {
        if (element[this.fieldsNames[i].name].name !== undefined) {
          tabAux[this.fieldsNames[i].name] = element[this.fieldsNames[i].name].name;
        } else {
          tabAux[this.fieldsNames[i].name] = element[this.fieldsNames[i].name];
        }
      }
      pdfDataBody.push(tabAux);
    });
    return pdfDataBody;
  }

  private findEmployeePrimesById() : any {

    const employeePrimes: any = [
      , {
        taux: '',
        gain: '',
        designation: '',
        number: '',
        base: '',
      },
      {
        taux: '',
        gain: '',
        designation: '',
        number: '',
        base: '',
      },
      {
        designation: 'Salaire de base',
        number: this.employee.numberOfHoursOfWork,
        base: this.employee.baseSalary,

      }];
    this.employeeHourSupp = [{}, {
      taux: '',
      gain: this.employee.baseSalary * this.employee.numberOfHoursOfWork
    }
    ];
    if(this.firstBulletin){
      this.hrsupp75.forEach(element => {

// log ('75%%%%'+ JSON.stringify(element));
        this.primes.push(element);
      });
      this.hrsupp100.forEach(element => {
        // log ('100%%%%'+JSON.stringify(element));
        this.primes.push(element);
      });
      this.firstBulletin = false;
    }
    this.primes.forEach(element => {

      if (element.employeeId === this.employee.id) {
        employeePrimes.push(element);
        this.employeeHourSupp.push(element);
      }
    });
    log ('Primeeees'+ JSON.stringify(employeePrimes));

    return employeePrimes;
  }

  private generateOrderedPDF() {
    // alert(new Date().getDate().toString());
    // Only pt supported (not mm or ifn)
    const doc = new jsPDF('p', 'pt');

    const comp = this.fieldsNames[this.orderBy].name;
    const totalPagesExp = '{total_pages_count_string}';
    const text: String = doc.splitTextToSize('Lorem Ipsum is simply dummy text of the printing and typesetting industry. ' +
      'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley ' +
      'of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap ' +
      'into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of ' +
      'Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus ' +
      'PageMaker including versions of Lorem Ipsum.'
      , 620, {});
    doc.setFontSize(13);
    doc.text(text, 42, 90);

    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    const entityTitle = this.entities[this.entityName].title;


    const pageContent = function (data) {
      // HEADER
      doc.setFontSize(16);
      doc.setTextColor('#1c5178');
      doc.setFontStyle('normal');
      doc.text('List Des ' + entityTitle + 's ordonné par ' + comp.toUpperCase(), data.settings.margin.left, 55);
      doc.setFontSize(11);
      doc.setTextColor('#223322');
      doc.setFontStyle('normal');

      doc.text(date, 465, 55);
      doc.setLineWidth(0.2);
      doc.setTextColor('#222222');
      doc.setDrawColor(12, 12, 12);
      doc.line(40, 60, 558, 60);
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

    // doc.autoTable(this.pdfTableHead, this.dataBodyToTable(this.pdfHeadTitles, this.dataBodyTable), {
    //   startY: 200,
    //   showHeader: 'firstPage',
    // });


    const ddl = this.numberOfEachElement(comp);

    doc.setFontSize(12);
    doc.setTextColor('#000000');
    doc.setFontStyle('bold');
    const newData: any = [];
    for (const key of Object.keys(ddl)) {
      this.simpleData.forEach(element => {
          if (element[comp] === key) {
            newData.push(element);
          }
        },
      );
    }
    let countIndex = 0;
    let anotherVar = 0;
    const fieldsNames = [];
    this.fieldsNames.forEach(el => {
      if (el.name !== comp) {
        fieldsNames.push(el);
      }
    });
    doc.autoTable(fieldsNames, newData, {
      theme: 'grid',
      addPageContent: pageContent,
      startY: 200,
      showHeader: 'firstPage',
      margin: {top: 80},
      drawRow(row, data) {
        // Colspan
        doc.setFontStyle('bold');
        doc.setFontSize(10);
        // alert(Object.keys(ddl)[1] + ' ' + ddl[Object.keys(ddl)[0]]);

        // alert(row.index + ' ' + ddl[Object.keys(ddl)[countIndex]]);
        if (row.index === anotherVar) {
          anotherVar += ddl[Object.keys(ddl)[countIndex]];
          doc.rect(data.settings.margin.left, row.y, data.table.width, 20, 'S');
          doc.autoTableText(Object.keys(ddl)[countIndex], data.settings.margin.left + data.table.width / 2, row.y + row.height / 2, {
            halign: 'center',
            valign: 'middle',
          });
          data.cursor.y += 20;
          countIndex = countIndex + 1;
        }

        if (row.index % 5 === 0) {
          const posY = row.y + row.height * 6 + data.settings.margin.bottom;
          const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          if (posY > pageHeight) {
            data.addPage();
          }
        }
      },
      drawCell: function (cell, data) {
        // Rowspan
        if (data.column.dataKey === 'id') {
          if (data.row.index % 5 === 0) {
            doc.rect(cell.x, cell.y, data.table.width, cell.height * 5, 'S');
            doc.autoTableText(data.row.index / 5 + 1 + '', cell.x + cell.width / 2, cell.y + cell.height * 5 / 2, {
              halign: 'center',
              valign: 'middle',
            });
          }
          return false;
        }
      },
    });


    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.entities[this.entityName].title + '_' + date.replace(' ', '_') + '.pdf');
  }

  private numberOfEachElement(comp) {
    const ddl: any = {};

    this.simpleData.forEach(element => {
      if (ddl[element[comp]] !== undefined) {
        ddl[element[comp]] = ddl[element[comp]] + 1;
      } else {
        ddl[element[comp]] = 1;
      }
    });

    return ddl;
  }

  private getSimpleData() {
    const newData = [];
    this.dataFromBase.forEach(element => {
      const aux = {};
      for (const key of Object.keys(element)) {
        if (element[key].name !== undefined) {
          aux[key] = element[key].name;
        } else {
          aux[key] = element[key];
        }
      }
      newData.push(aux);
    });
    return newData;
  }


  private generateBulletinPDF() {
    this.primesPerEmployee = this.findEmployeePrimesById();
    const doc = new jsPDF('p', 'pt');

    const totalPagesExp = '{total_pages_count_string}';

    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May',
      'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 0, 0);

    doc.setFontSize(9);
    doc.setTextColor('#121212');
    doc.setFontStyle('normal');


    doc.rect(40, 80, 200, 46, 'S');
    doc.rect(355, 80, 200, 46, 'S');


    doc.text('SOCIETE DIAMOND', 45, 93);
    doc.text('07 RUE DE JASMIN 1002 TUNIS', 45, 106);
    doc.text('Affiliation CNSS: 00010202-99', 45, 119);


    doc.text('Année : ', 360, 93);
    doc.text('Mois de paie : ', 360, 106);
    doc.text('Date de paiement : ', 360, 119);


    doc.text(d.getFullYear() + '', 480, 93);
    doc.text(months[d.getMonth()] + '', 480, 106);
    doc.text(d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear(), 480, 119);

    doc.rect(40, 145, 515, 72, 'S');
    doc.line(211, 145, 211, 217);
    doc.line(382, 145, 382, 217);
    // Test Draw Bulletin Template

    doc.rect(40, 233, 515, 400, 'S');

    doc.rect(249, 233, 306, 15, 'S');
    doc.rect(300, 248, 42, 385, 'S');
    doc.rect(453, 248, 44, 385, 'S');

    doc.rect(40, 233, 515, 45, 'S');

    doc.rect(40, 233, 515, 400, 'S');
    doc.rect(40, 233, 209, 400, 'S');
    doc.rect(40, 233, 362, 400, 'S');
    //  doc.rect(40, 233, 208, 43, 'S');
    doc.rect(40, 233, 170, 400, 'S');
    doc.rect(40, 233, 117, 400, 'S');


    doc.text('Matricule :', 45, 158);
    doc.text('CIN :', 45, 171);
    doc.text('N° CNSS :', 45, 184);
    doc.text('Situation familiale :', 45, 197);
    doc.text('Enfant à charge :', 45, 210);

    doc.text(this.employee.serialNumber + '', 145, 158);
    doc.text(this.employee.nin + '', 145, 171);
    doc.text(this.employee.nssfNumber + '', 145, 184);
    doc.text(this.employee.situation.name + '', 145, 197);
    doc.text(this.employee.childrenCount + '', 145, 210);


    doc.text('Fonction :', 216, 158);
    doc.text('Catégorie :', 216, 171);
    doc.text('Echelon :', 216, 184);
    doc.text('Salaire de base :', 216, 197);

    doc.text(this.employee.empFunction.name + '', 306, 158);
    doc.text(this.employee.category.name + '', 306, 171);
    doc.text(this.employee.echelon.name + '', 306, 184);
    doc.text(this.employee.baseSalary + '', 306, 197);

    // log(JSON.stringify(this.findEmployeePrimesById()));
    doc.text('Prénom :', 387, 158);
    doc.text('Nom :', 387, 171);

    doc.text(this.employee.firstName + '', 477, 158);
    doc.text(this.employee.lastName + '', 477, 171);


    doc.rect(40, 842 - 178, 330, 28, 'S');
    doc.line(40, 842 - 164, 370, 842 - 164);
    doc.line(140, 842 - 178, 140, 842 - 150);
    doc.line(240, 842 - 178, 240, 842 - 150);


    doc.text('Mode de paiement', 52, 842 - 168);
    doc.text('Intitulé banque', 152, 842 - 168);
    doc.text('N° de compte', 252, 842 - 168);


    doc.text('Virement', 52, 842 - 154);
    doc.text(this.employee.bankGroup.name + '', 152, 842 - 154);
    doc.text(this.employee.bankNumber + '', 252, 842 - 154);

    doc.text('Signature et cachet employeur', 40, 842 - 137);
    doc.text('Signature employé', 365, 842 - 137);


    doc.rect(40, 842 - 125, 190, 75, 'S');
    doc.rect(365, 842 - 125, 190, 75, 'S');

    const pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor('#1c5178');
      doc.setFontStyle('normal');
      doc.text('BULLETIN DE PAIE', data.settings.margin.left + 175, 55);

      doc.setLineWidth(0.2);
      doc.setTextColor('#222222');
      doc.setDrawColor(0, 0, 0);
      doc.line(40, 60, 556, 60);
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
    const titlesColumns = [
      {
        dataKey: 'designation',
        title: 'Désignation',
      },
      {
        dataKey: 'number',
        title: 'Nombre',
      },
      {
        dataKey: 'base',
        title: 'Base',
      },
    ];
    const titlesColumns3 = [
      {
        dataKey: 'taux',
        title: 'Taux %',
      },
      {
        dataKey: 'gain',
        title: 'Gain',
      },
      {
        dataKey: 'retenue',
        title: 'Retenue',
      },
      {
        dataKey: 'taux',
        title: 'Taux %',
      },
      {
        dataKey: 'gain',
        title: 'Gain',
      },
      {
        dataKey: 'retenue',
        title: 'Retenue',
      },

    ];
    const titlesColumns2 = [
      {
        dataKey: 'partsalariale',
        title: 'Part Salariale       ',
      },
      {
        dataKey: 'partpatrimoniale',
        title: 'Part Patrimoniale',
      },

    ];

    const rows =
      [

        {
          taux: '',
          gain: '',
        },
        {
          taux: '',
          gain: '',
        },
        {
          taux: '75',
          gain: '12',
        },
        {
          taux: '',
          gain: '14023',
        },

      ];
    // log(JSON.stringify(this.findEmployeePrimesById()));
    doc.autoTable(titlesColumns, this.findEmployeePrimesById(), {
      theme: 'plain',
      // theme: 'grid',

      addPageContent: pageContent,
      headerStyles: {
        halign: 'center',
      },
      startY: 245,
      showHeader: 'firstPage',
      margin: {top: 80, right: 350, left: 42},
      // createdCell: function(cell, data) { if (data.row.designation === 'Total Brute') { { cell.styles.fillColor = [145, 145, 145]; } } }
      styles: {
        cellPadding: 0.5,

      },
    });
    log('Longeur  '+ this.findEmployeePrimesById().length);
    doc.rect(40, 233, 117, this.findEmployeePrimesById().length * 11+45, 'S');


    doc.autoTable(titlesColumns2, [], {
      headerStyles: {
        halign: 'center',
      },
      theme: 'plain',
      // theme: 'grid',
      startY: 235,
      startX: 45,

      showHeader: 'firstPage',
      margin: {top: 80, left: 250},
      styles: {
        // fontSize: 8,
        cellPadding: 0.5,

      },
    });
    doc.autoTable(titlesColumns3, this.employeeHourSupp, {
      // theme: 'grid',
      theme: 'plain',
      headerStyles: {
        halign: 'center',
      },
      startY: 258,
      showHeader: 'firstPage',
      margin: {left: 250},
      styles: {
        // fontSize: 8,
        cellPadding: 0.5,

      },

    });


    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.employee.fullName.replace(' ', '_') + '.pdf');

  }
}

