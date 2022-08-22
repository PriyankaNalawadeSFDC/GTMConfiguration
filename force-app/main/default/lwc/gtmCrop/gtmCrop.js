import {
  LightningElement,
  track,
  api,
  wire
} from 'lwc';
import getWapperCrop from '@salesforce/apex/GtmProductCompetition.getWapperCrop';
//import updateCropStatus from '@salesforce/apex/GtmProductCompetition.updateCropStatus';
import {
  ShowToastEvent
} from 'lightning/platformShowToastEvent';
import setcropIndex from '@salesforce/apex/GtmProductCompetition.setcropIndex';
import updateCropStatus from '@salesforce/apex/GtmProductCompetition.updateCropStatus';
import checkStatusCrop from '@salesforce/apex/GtmProductCompetition.checkStatusCrop';
import Save from '@salesforce/label/c.Save';
import Cancel from '@salesforce/label/c.Cancel';
import Applicable_For from '@salesforce/label/c.Applicable_For';
import Crop_Name from '@salesforce/label/c.Crop_Name';
import Last_Modified_By from '@salesforce/label/c.Last_Modified_By';
import Last_Modified_By_Date from '@salesforce/label/c.Last_Modified_By_Date';
export default class GtmCrop extends LightningElement {
  @track paginatedCropSalesOrgMapping = [];
  @track mapDataSave = [];
  @track CropMap = [];
  @track CropSalesorgMapping = [];
  @track salesOrgName;
  @api
  recordId;
  label = {
    Save,
    Cancel,
    Applicable_For,
    Crop_Name,
    Last_Modified_By,
    Last_Modified_By_Date
  }
  handlePaginationAction(event) {
    this.paginatedCropSalesOrgMapping = event.detail.values;
  }

  handleChangeCheckbox(event) {
    let cpid = event.target.dataset.cpid;
    var count = 0;
    for (var i = 0; i < this.CropSalesorgMapping.length; i++) {

      var obj = new Object(this.CropSalesorgMapping[i]);
      var tmpStatus = obj.gtmstatuscrop;

      console.log('tmpStatus ' + tmpStatus);

      if (tmpStatus == 'Active') {
        count = count + 1;
      }

    }

    this.mapDataSave = JSON.parse(JSON.stringify(this.mapDataSave));
    this.mapDataSave.forEach(ele => { 
      if(ele.gtmstatuscrop == 'Active'){
          count ++ ;
      }
      
    });
    if( event.target.value == 'Inactive'){
      count -- ;
    }
    
    console.log('count on change ' + count);
    if (count > 11) {
      let dataRet = this.CropSalesorgMapping.findIndex(elem => elem.cropId == cpid)
      console.log('return data after click ', dataRet);
      this.CropSalesorgMapping[dataRet].gtmstatuscrop = 'Actives';
      console.log('count inside if ' + count);
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Warning',
          message: 'You cannot modify any Crop Status',
          variant: 'warning'
        })
      );

      setTimeout(() => {

        this.paginatedCropSalesOrgMapping = JSON.parse(JSON.stringify(this.CropSalesorgMapping));
        this.refreshData();
        //false spinner value
      }, 200);
    } else {
      console.log('count inside else ' + count);
      //true for spinner 
      console.log(event);
      let res = event.target.value;
      let key = event.target.dataset.id;
      console.log('res ++++++', res);
      console.log('key++++++++', key);

      let cpid = event.target.dataset.cpid;
      checkStatusCrop({
        cpid: cpid
      }).then(Active => {
        console.log('Active in checking ', Active);

        if (Active) {

          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Warning',
              message: 'GTM Crop already created',
              variant: 'warning'
            })
          );
          let index = this.CropSalesorgMapping.findIndex(elem => elem.cropId == cpid);
          console.log('index----', index);
          //console.log('Productindex++++++', this.CropSalesorgMapping[index]);
          this.CropSalesorgMapping[index].gtmstatuscrop = 'Actives';
          console.log('asdadsadsa ', this.CropSalesorgMapping[index].gtmstatuscrop);
          setTimeout(() => {
            this.paginatedCropSalesOrgMapping = JSON.parse(JSON.stringify(this.CropSalesorgMapping));

            this.refreshData();
            //false spinner value
          }, 200);

        } else {
          console.log('in else part for checking ' + cpid);
          this.paginatedCropSalesOrgMapping.forEach(ele => {
            if (ele.cropId == cpid) {
              let elefound = this.mapDataSave.find(e => e.cropId == cpid);
              console.log('elefound = ', elefound);

              if (elefound) {
                console.log('if = ', elefound);
                elefound.gtmstatuscrop = res;
              } else {
                console.log('else = ', elefound);
                this.mapDataSave.push(JSON.parse(JSON.stringify(ele)));
                let elefound1 = this.mapDataSave.find(e => e.cropId == cpid);
                elefound1.gtmstatuscrop = res;
              }

            }

          });
          console.log('HIiiiii+++++++', this.mapDataSave);
        }

      }).catch(err => console.log(err));

    }
  }

  get optionsCrop() {
    return [{
        label: 'Yes',
        value: 'Active'
      },
      {
        label: 'No',
        value: 'Inactive'
      },

    ];
  }

  SavehandleClick(event) {

    console.log('Hello Welcome +++++', this.mapDataSave);

    console.log('this.mapDataSave.length ' + this.CropSalesorgMapping.length);
    console.log('CropSalesorgMapping +++++ ' , this.CropSalesorgMapping);
    var count = 0;

    for (var i = 0; i < this.CropSalesorgMapping.length; i++) {

      var obj = new Object(this.CropSalesorgMapping[i]);
      var tmpStatus = obj.gtmstatuscrop;
      
      console.log('tmpStatus ' + tmpStatus);

      if (tmpStatus == 'Active') {
        count = count + 1;
      }
      
    }
    this.mapDataSave = JSON.parse(JSON.stringify(this.mapDataSave));
    this.mapDataSave.forEach(ele => { 
      if(ele.gtmstatuscrop == 'Active'){
          count ++ ;
      }
      
    });

    console.log('count on save' + count);

    if (count < 12) {

      updateCropStatus({
          statusmap: JSON.stringify(this.mapDataSave)
        }).then(result => {
          console.log('result = ' + result);
          this.refreshData();

          if (result == 'true') {

            console.log('result+++ ' + result);
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Success',
                message: 'Status updated successfully',
                variant: 'success'

              })
            );
          }
          if (result == 'false') {
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Error',
                message: 'Error updating record',
                variant: 'error'

              })
            );
          }
        })
        .catch(error => {

          this.dispatchEvent(

            new ShowToastEvent({
              title: 'Error updating record',
              message: error.body.message,
              variant: 'error'
            })
          );
        });
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Only 12 Crops can be Active',
          message: 'Cannot save the changes',
          variant: 'error'
        })
      );
    }
  }

  refreshData() {

    getWapperCrop().then(data => {
      console.log(data);
      this.CropSalesorgMapping = data;
      console.log('Crop Data +++++------', this.CropSalesorgMapping);
      let salesOrgNam = this.CropSalesorgMapping[0].salesOrgNameCrop;
      console.log('SalesOrgName+++++++++ ', salesOrgNam);
      this.salesOrgName = salesOrgNam;
    }).catch(err => console.log(err));
  }

  connectedCallback() {

    this.refreshData();

  }
  DragStart(event) {
    this.dragStart = String(event.target.id).split('-')[0];
    event.target.classList.add("drag");
    console.log(this.DragStart);
  }

  DragOver(event) {
    event.preventDefault();
    return false;
  }

  Drop(event) {
    event.stopPropagation();
    const DragValName = this.dragStart;
    const DropValName = String(event.target.id).split('-')[0];
    console.log('41', this.DragStart);
    if (DragValName === DropValName) {
      return false;
    }
    const index = DropValName;
    const currentIndex = DragValName;
    const newIndex = DropValName;
    Array.prototype.move = function (from, to) {
      this.splice(to, 0, this.splice(from, 1)[0]);

    };

    let test = JSON.parse(JSON.stringify(this.paginatedCropSalesOrgMapping));
    //console.log('Welcome', test);
    this.paginatedCropSalesOrgMapping = test;
    //console.log('Hello ', this.paginatedCropSalesOrgMapping);
    this.paginatedCropSalesOrgMapping.move(currentIndex, newIndex);
    //this.productCategorySalesorgMapping.move(currentIndex, newIndex);

    setTimeout(() => {

      let categorySalesorgMapping = [];
      console.log('currentIndex++++++++++' + currentIndex);
      console.log('newIndex----------------', newIndex);

      this.CropSalesorgMapping.forEach(ele => {
        if (this.template.querySelector('[data-pscm="' + ele.cropId + '"]')) {

          console.log('Index--++--', this.template.querySelector('[data-pscm="' + ele.cropId + '"]').id);

          let obj = {
            Id: ele.cropId,
            Category_index__c: String(this.template.querySelector('[data-pscm="' + ele.cropId + '"]').id).split('-')[0]
          }
          categorySalesorgMapping.push(obj);
          console.log('Obj--++--', obj);
        }
      })
      setcropIndex({
        pscm: JSON.stringify(categorySalesorgMapping)
      }).then(data => {
        console.log('Index Changed ===');
      })
    }, 500);
  }

}