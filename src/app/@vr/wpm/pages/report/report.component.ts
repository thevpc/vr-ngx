import {Component, OnInit} from '@angular/core';
import {ToasterService} from 'angular2-toaster';
import {NbThemeService} from '@nebular/theme';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {log} from 'util';
import { VrSharedState } from '../../../core/services/vr.shared-state';
import { VrService } from '../../../core/services/vr.service';
import { VrWpmService } from '../../services/vr.wpm.service';

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
  public entitiesNames: any = [];
  public fieldsNames: any = [];
  public orderBy: any;
  public entities: any = {};
  public entityName: string;
  public dataEmployee: boolean = false;
  public employeesName: any = [];
  public isBulletin: boolean = false;
  public isBulletinDeposit: boolean = false;
  public loansName: any[];
  public dataLoan: boolean = false;
  public salaryData: any [];
  public loansName2: any = [];
  public toggleLoanValue = true;
  public toggleEmployeeValue = true;
  private fields: any = {};
  private dataFromBase: any = [];
  private employee: any;
  private pdfType: any;
  private entityTitle: any;
  private simpleData: any[];
  private depositInfo: any = {};
  private loan: any;
  private loanDataFromBase: any[];
  private loanSimpleData: any[];

  constructor(
    private toasterService: ToasterService,
    private vrModemState: VrSharedState,
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

  // getDataFromBase() {
  //   this.isBulletin = false;
  //   this.pdfType = 'Default';
  //   this.dataEmployee = false;
  //   this.dataLoan = false;
  //   this.fieldsNames = [];
  //   this.fields = {};
  //   this.entityName = (<HTMLInputElement>document.getElementById('entityNameSelect')).value;
  //   this.entityTitle = this.entities[this.entityName].title;
  //   const entity = this.entities[this.entityName];
  //   this.searchFields(entity);
  //   // log('******************************************** ');
  //   // log('fieldsNames: ' + JSON.stringify(this.fieldsNames));
  //   // log('********************************************');
  //   this.vrService.getEntityData(this.entityName).subscribe((data) => {
  //     // log(JSON.stringify(data));
  //     this.dataFromBase = data;
  //     this.simpleData = this.getSimpleData(this.dataFromBase);
  //     this.dataEmployee = true;
  //   });
  // }

  ngOnInit(): void {


    this.vrModemState.domainModel.subscribe(
      domain => {
        if (domain.root) {
          this.searchEntities(domain.root);
          this.pdfType = 'Default';
          this.dataEmployee = false;
          this.dataLoan = false;
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
            this.simpleData = this.getSimpleData(this.dataFromBase);
            this.dataEmployee = true;
          });
          this.vrService.getEntityData('PrLoan').subscribe((m) => {
            // log(JSON.stringify(data));
            this.loanDataFromBase = m;
            this.loanSimpleData = this.getSimpleData(this.loanDataFromBase);
            this.dataLoan = true;
            this.getLoansName();
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


            for (let i = 0; i < this.employeesName.length; i++) {
              if (this.employeesName[i].enabled) {

                this.vrWpmService.getDataBulletinSalary(this.employeesName[i].id).subscribe(DATA => {

                  this.salaryData = DATA;
                  this.salaryData.forEach(element => {
                    if (element.gain === 0) {
                      element.gain = '';
                    }
                    if (element.taux === 0) {
                      element.taux = '';
                    }
                    if (element.toreduce === 0) {
                      element.toreduce = '';
                    }
                    if (element.base === 0) {
                      element.base = '';
                    }
                    if (element.number === 0) {
                      element.number = '';
                    }
                  });
                  // for (let i = 0; i < this.employeesName.length; i++) {
                  //   if ( this.employeesName[i].enabled ) {
                  //     this.employee = this.dataFromBase[i];
                  //     this.generateBulletinPDF();
                  //   }
                  // }

                  this.employee = this.dataFromBase[i];
                  this.generateBulletinPDF();


                });
              }
            }
            break;
          case 'BulletinDeposit':
            this.selectNameLoan(0);
            for (let i = 0; i < this.loansName2.length; i++) {
              if (this.loansName2[i].enabled) {
                // alert(this.loansName2[i].fullName);
                this.beforeGeneratDepositBulletin(i);
              }
            }
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

  beforeGeneratDepositBulletin(id: number) {
    this.selectNameLoan(id);
    this.vrWpmService.getDepositById(this.loan.employee.id + '').subscribe(data => {
      this.selectNameLoan(id);
      this.depositInfo['duration'] = data[0].loan.duration;
      let d = new Date(data[0].loan.loanDate);
      const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.',
        'oct.', 'nov.', 'déc.'];
      this.depositInfo['loanDate'] = d.getDate() + ' ' + ((d.getDate() + '').length === 1 ? '  ' : '')
        + months[d.getMonth()] + ' ' + d.getFullYear();
      this.depositInfo['monthlyPayment'] = data[0].loan.monthlyPayment;
      this.depositInfo['value'] = data[0].loan.value;
      let sum = 0;
      const depositColumns = [];
      data.forEach(elm => {
        const obj = {};
        obj['name'] = elm.name;
        d = new Date(elm.depositDate);
        obj['depositDate'] = d.getDate() + ' ' + ((d.getDate() + '').length === 1 ? '  ' : '')
          + months[d.getMonth()] + ' ' + d.getFullYear();
        obj['value'] = elm.value;
        obj['monthlyPayment'] = elm.loan.monthlyPayment;
        sum += elm.value;
        obj['enitreDeposit'] = sum;
        obj['remainedDeposit'] = elm.loan.value - sum;
        depositColumns.push(obj);
      });
      this.generateBulletinDepositPDF(depositColumns);
    });
  }

  public handleChange() {
    // console.clear();
    this.isBulletin = false;
    this.isBulletinDeposit = false;
    switch (this.orderBy) {
      // case -1:
      //   // log('Default');
      //   this.pdfType = 'Default';
      //   break;
      case -2:
        this.isBulletin = true;
        this.pdfType = 'Bulletin';
        // log('Bulletin');
        this.getEmployeesName();
        this.selectNameEmployee(0);
        // this.generateBulletinPDF();
        // log(JSON.stringify(this.employeesName));
        break;
      case -3:
        this.isBulletinDeposit = true;
        this.pdfType = 'BulletinDeposit';
        // log('Bulletin');
        break;
      // default:
      //   this.pdfType = 'Ordered';
      //   // log(this.orderBy);
      //   // log(this.fieldsNames[this.orderBy].name);
      //   break;
    }
  }

  public selectNameEmployee(index) {
    // this.employee = this.dataFromBase[index];

    this.employeesName[index].enabled = !this.employeesName[index].enabled;
  }

  public selectNameLoan(index) {
    this.loan = this.loanDataFromBase[index];
  }

  selectNameLoan2(i) {
    this.loansName2[i].enabled = !this.loansName2[i].enabled;
  }

  public toggleAllLoanCheckBox() {
    this.loansName2.forEach(emp => {
      emp.enabled = this.toggleLoanValue;
    });
    this.toggleLoanValue = !this.toggleLoanValue;
  }

  public toggleAllEmployeeCheckBox() {
    this.employeesName.forEach(emp => {
      emp.enabled = this.toggleEmployeeValue;
    });
    this.toggleEmployeeValue = !this.toggleEmployeeValue;
  }

  private searchEntities(item: any) {
    if (item.typeName === 'package') {
      item.children.forEach((element) => {
        this.searchEntities(element);
      });
    } else if (item.typeName === 'entity' && item.compositionRelationship === undefined) {
      this.entitiesNames.push({
        'name': item.name,
        'title': item.title,
      });
      this.entities[item.name] = item;
    }
  }

  private searchFields(item: any) {


    if (item.typeName === 'section' || item.typeName === 'entity') {
      item.children.forEach((element) => {
        this.searchFields(element);
      });
    } else if (item.typeName === 'field' && item.compositionRelationship === undefined) {
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
    log(this.dataFromBase);
    this.dataFromBase.forEach(element => {
      // this.employeesName.push(element.fullName);
      const obj = {
        fullName: element.fullName,
        id: element.id,
        enabled: false,
      };
      this.employeesName.push(obj);
    });
  }

  private getLoansName() {
    this.loansName = [];
    this.loansName2 = [];
    this.loanDataFromBase.forEach(element => {
      this.loansName.push(element.employee.fullName);
      const obj = {
        fullName: element.employee.fullName,
        enabled: false,
      };
      this.loansName2.push(obj);
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
      doc.setTextColor('#222');
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
      doc.setTextColor('#222');
      doc.setDrawColor(12, 12, 12);
      doc.line(40, pageHeight - 32, 558, pageHeight - 32);
      // doc.line(40, pageHeight - 30, 558, pageHeight - 30);

      doc.text(str, data.settings.margin.left, pageHeight - 20);
    };
    doc.autoTable(this.fieldsNames, this.dataToTable(this.dataFromBase), {
      theme: 'grid',
      addPageContent: pageContent,
      startY: 200,
      showHeader: 'firstPage',
      margin: {top: 80},
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.entities[this.entityName].title + '_' + date.replace(' ', '_') + '.pdf');
  }


  private dataToTable(dataFromBase) {
    const pdfDataBody: any = [];
    dataFromBase.forEach(element => {
      const tabAux: any = {};
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


  private generateOrderedPDF() {
    // alert(new Date().getDate().toString());
    // Only pt supported (not mm or in)
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
      doc.setTextColor('#222');
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
      doc.setTextColor('#222');
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
    doc.setTextColor('#000');
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

  private getSimpleData(dataFromBase) {
    const newData = [];
    dataFromBase.forEach(element => {
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

    // this.primesPerEmployee = this.findEmployeePrimesById();
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

    // doc.rect(40, 233, 515, 400, 'S');
    //
    // doc.rect(249, 233, 306, 15, 'S');
    // doc.rect(300, 248, 42, 385, 'S');
    // doc.rect(453, 248, 44, 385, 'S');
    //
    // doc.rect(40, 233, 515, 45, 'S');
    //
    // doc.rect(40, 233, 515, 400, 'S');
    // doc.rect(40, 233, 209, 400, 'S');
    // doc.rect(40, 233, 362, 400, 'S');
    // //  doc.rect(40, 233, 208, 43, 'S');
    // doc.rect(40, 233, 170, 400, 'S');
    // doc.rect(40, 233, 117, 400, 'S');
// Draw table

    // doc.rect(40, 233, 515, 400, 'S');
    //
    // doc.rect(249, 233, 306, 15, 'S');
    // doc.rect(300, 248, 42, 385, 'S');
    // doc.rect(453, 248, 44, 385, 'S');
    //
    // doc.rect(40, 233, 515, 45, 'S');
    //
    // doc.rect(40, 233, 515, 400, 'S');
    // doc.rect(40, 233, 209, 400, 'S');
    // doc.rect(40, 233, 362, 400, 'S');
    // //  doc.rect(40, 233, 208, 43, 'S');
    // doc.rect(40, 233, 170, 400, 'S');
    // doc.rect(40, 233, 117, 400, 'S');

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
      {
        dataKey: 'taux',
        title: 'Taux',
      },
      {
        dataKey: 'gain',
        title: 'Gain',
      },
      {
        dataKey: 'toreduce',
        title: 'à reduire',
      },
    ];
    const titlesColumns3 = [
      {
        dataKey: 'tauxPeriod',
        title: 'Taux %',
      },
      {
        dataKey: 'gainPeriod',
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


    log('data salary' + JSON.stringify(this.salaryData));
    doc.autoTable(titlesColumns, this.salaryData, {
      createdCell: function (cell, data) {
        if ((cell.raw === 'Salaire de base' || cell.raw === 'Salaire NET') ||
          ((cell.raw === 'Salaire Brut') || (cell.raw === 'Salaire Imposable'))) {
          // cell.styles.fontStyle = 'bold';
          cell.styles.fontStyle = 'bold';
          cell.styles.fontSize = 10;
          cell.styles.textColor = [0, 0, 0];
        }
      },
      theme: 'grid',
      // theme: 'grid',

      addPageContent: pageContent,
      headerStyles: {
        halign: 'center',
      },

      startY: 245,
      showHeader: 'firstPage',

    });
    //   log('Longeur  '+ this.findEmployeePrimesById().length);
    // doc.rect(40, 233, 117, this.salaryData.length *11+45, 'S');


    // doc.autoTable(titlesColumns2, [], {
    //   headerStyles: {
    //     halign: 'center',
    //   },
    //   theme: 'plain',
    //   // theme: 'grid',
    //   startY: 235,
    //   startX: 45,
    //
    //   showHeader: 'firstPage',
    //   margin: {top: 80, left: 250},
    //   styles: {
    //     // fontSize: 8,
    //     cellPadding: 0.5,
    //
    //   },
    // });
    // doc.autoTable(titlesColumns3, this.salaryData, {
    //   // theme: 'grid',
    //   theme: 'plain',
    //   headerStyles: {
    //     halign: 'center',
    //   },
    //   startY: 258,
    //   showHeader: 'firstPage',
    //   margin: {left: 250},
    //   styles: {
    //     // fontSize: 8,
    //     cellPadding: 0.5,
    //
    //   },
    //
    // });


    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(this.employee.fullName.replace(' ', '_') + '.pdf');
  }

  private generateBulletinDepositPDF(depositColumns) {
    const doc = new jsPDF('p', 'pt');

    const totalPagesExp = '{total_pages_count_string}';

    doc.setLineWidth(0.2);
    doc.setDrawColor(0, 0, 0);

    doc.setFontSize(9);
    doc.setTextColor('#121212');
    doc.setFontStyle('normal');


    doc.rect(40, 80, 200, 58, 'S');
    doc.rect(315, 80, 240, 58, 'S');


    doc.text('SOCIETE DIAMOND', 45, 96);
    doc.text('07 RUE DE JASMIN 1002 TUNIS', 45, 112);
    doc.text('Affiliation CNSS: 00010202-99', 45, 128);


    doc.text('Montant du prêt (dt) : ', 320, 93);
    doc.text('Mensualité (montant à payé par mois) : ', 320, 106);
    doc.text('Nombre de mensualités prévues : ', 320, 119);
    doc.text('Date de l\'emprunt : ', 320, 132);


    doc.text(this.depositInfo['value'] + '', 490, 93);
    doc.text(this.depositInfo['monthlyPayment'] + '', 490, 106);
    doc.text(this.depositInfo['duration'] + '', 490, 119);
    doc.text(this.depositInfo['loanDate'] + '', 490, 132);


    doc.rect(40, 145, 515, 72, 'S');
    doc.line(211, 145, 211, 217);
    doc.line(382, 145, 382, 217);


    doc.text('Matricule :', 45, 158);
    doc.text('CIN :', 45, 171);
    doc.text('N° CNSS :', 45, 184);
    doc.text('Situation familiale :', 45, 197);
    doc.text('Enfant à charge :', 45, 210);
    const employee = this.loan.employee;
    doc.text(employee.serialNumber + '', 145, 158);
    doc.text(employee.nin + '', 145, 171);
    doc.text(employee.nssfNumber + '', 145, 184);
    doc.text(employee.situation.name + '', 145, 197);
    doc.text(employee.childrenCount + '', 145, 210);


    doc.text('Fonction :', 216, 158);
    doc.text('Catégorie :', 216, 171);
    doc.text('Echelon :', 216, 184);
    doc.text('Salaire de base :', 216, 197);

    doc.text(employee.empFunction.name + '', 306, 158);
    doc.text(employee.category.name + '', 306, 171);
    doc.text(employee.echelon.name + '', 306, 184);
    doc.text(employee.baseSalary + '', 306, 197);


    doc.text('Prénom :', 387, 158);
    doc.text('Nom :', 387, 171);

    doc.text(employee.firstName + '', 457, 158);
    doc.text(employee.lastName + '', 457, 171);


    const pageContent = function (data) {
      // HEADER
      doc.setFontSize(20);
      doc.setTextColor('#1c5178');
      doc.setFontStyle('normal');
      doc.text('Fiche de crédit', data.settings.margin.left + 175, 55);

      doc.setLineWidth(0.2);
      doc.setTextColor('#222222');
      doc.setDrawColor(12, 12, 12);
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
        dataKey: 'name',
        title: 'Libellé',
      }, {
        dataKey: 'depositDate',
        title: 'Date du VERS.',
      }, {
        dataKey: 'monthlyPayment',
        title: 'VERS. anticipés',
      }, {
        dataKey: 'value',
        title: 'VERS. Réel',
      }, {
        dataKey: 'remainedDeposit',
        title: 'Reste à rembourser',
      }, {
        dataKey: 'enitreDeposit',
        title: 'VERS. total',
      },
    ];

    const dataRows = depositColumns;
    doc.autoTable(titlesColumns, dataRows, {
      theme: 'grid',
      addPageContent: pageContent,
      startY: 223,
      showHeader: 'firstPage',
      margin: {top: 80},
    });


    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(employee.fullName.replace(' ', '_') + '.pdf');

  }
}
