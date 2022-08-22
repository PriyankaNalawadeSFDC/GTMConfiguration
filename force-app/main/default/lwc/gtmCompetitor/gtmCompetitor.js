import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCompetitorList from '@salesforce/apex/GtmProductCompetition.getCompetitorList';
import checkStatusComp from '@salesforce/apex/GtmProductCompetition.checkStatusComp';
import Applicable_For from '@salesforce/label/c.Applicable_For';
import Competitor_Name from '@salesforce/label/c.Competitor_Name';

import Display_Name from '@salesforce/label/c.Display_Name';
import Last_Modified_By from '@salesforce/label/c.Last_Modified_By';
import Last_Modified_By_Date from '@salesforce/label/c.Last_Modified_By_Date';
import updateCompetitorMapStatus from '@salesforce/apex/GtmProductCompetition.updateCompetitorMapStatus';
export default class GtmCompetitor extends LightningElement { queryTerm;
@api selectedCountry1;
@track competitorSalesorgMapping= [];
@track paginatedCompetitorSalesorgMapping = [];
@track mapDataSave = [];
@track competitorSalesorgMappingvirtual= [];
@track value;
@track salesOrgName;
lable={Display_Name,
  Applicable_For,
  Competitor_Name,
  Last_Modified_By,
	Last_Modified_By_Date}

handlePaginationAction (event){
  this.paginatedCompetitorSalesorgMapping=event.detail.values;
  console.log(this.paginatedCompetitorSalesorgMapping , 'paginatedCompetitorSalesorgMapping....>>');
  console.log(this.paginatedCompetitorSalesorgMapping + 'paginatedCompetitorSalesorgMapping....>>');
}

connectedCallback() {
  this.refreshData();

 
}

get optionsCompetitor() {
  return [
      { label: 'Yes', value: 'Active' },
      { label: 'No', value: 'Inactive' },
      
  ];
}

onSearch(event) {
  //let parsedata = JSON.parse(JSON.stringify(this.competitorSalesorgMapping))
  let search = event.target.value;
  
  //console.log('====parsedata===', parsedata);
  // if( !search ){
  //   this.competitorSalesorgMapping = this.competitorSalesorgMappingvirtual;
  // }
   this.competitorSalesorgMapping = this.competitorSalesorgMappingvirtual.filter(ele=>{
    //let search1 = String(search).toLowerCase();
    console.log('Hello Search ++++' , ele.competitorName.toLowerCase().includes(search) );

   return ele.competitorName.toLowerCase().includes(search);
    
  })
  setTimeout(() => {
    this.paginatedCompetitorSalesorgMapping = JSON.parse(JSON.stringify(this.competitorSalesorgMapping)) 
  }, 200);
 
}
 refreshData(){
  getCompetitorList().then(data=>{
      console.log('DATA++++++++++++++',data);
      this.competitorSalesorgMapping = data;
this.competitorSalesorgMappingvirtual = data;
console.log('this.competitorSalesorgMapping >>>>',this.competitorSalesorgMapping );
console.log('Display name.....>' + data[0].displayName);
let salesOrgNam = this.competitorSalesorgMapping[0].compSalesOrgName;
        console.log('SalesOrgName+++++++++ ', salesOrgNam);
        this.salesOrgName = salesOrgNam;

    }).catch(err=>console.log(err));
 }
  
 handleDisplayChange(event){

  
    
    let res = event.target.value;
      let key = event.target.dataset.id;
      console.log('res ++++++',res);
      console.log('key++++++++',key);
          

    
        this.competitorSalesorgMapping.forEach(ele => {
             if (ele.competitorSalesOrgMappingId== key) {
                  let elefound = this.mapDataSave.find(e => e.competitorSalesOrgMappingId == key);
                  console.log('elefound = ', elefound);
    
                  if (elefound) {
                      console.log('if = ', elefound);
                      
                      elefound.displayName = res;

                      console.log(elefound.displayName , 'elefound.displayName>>>>>');
                  } else {
                      console.log('else = ', elefound);
                      this.mapDataSave.push(JSON.parse(JSON.stringify(ele)));
                      let elefound1 = this.mapDataSave.find(e => e.competitorSalesOrgMappingId == key);
                      elefound1.displayName = res;
                      
                 }
                
             }
             
          });
          console.log('HIiiiii+++++++'    ,this.mapDataSave);   




 }

handleChangeCheckbox(event){
  console.log(event);
  let res = event.target.value;
      let key = event.target.dataset.id;
      console.log('res ++++++',res);
      console.log('key++++++++',key);
          
      let ccpid = event.target.dataset.ccpid;
      checkStatusComp({ccpid : ccpid}).then(Active =>{
        console.log('Active in checking ',Active);
        
        if (Active) {            
          let dataRet = this.competitorSalesorgMapping.findIndex(elem => elem.competitorSalesOrgMappingId == key);
          console.log('return data after click ',dataRet);
          this.competitorSalesorgMapping[dataRet].compstatus ='Actives';
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Warning',
              message: 'GTM Competitor cannot be "Inactive"',
              variant: 'warning'
            })
          );
          
          setTimeout(() => {
            console.log('sdasdsadasdadsad ',JSON.stringify(this.competitorSalesorgMapping));
            this.paginatedCompetitorSalesorgMapping = JSON.parse(JSON.stringify(this.competitorSalesorgMapping)); 
            this.refreshData();
         //false spinner value
           }, 200);
      
        }
      
      else
      {
    
        this.competitorSalesorgMapping.forEach(ele => {
             if (ele.competitorSalesOrgMappingId== key) {
                  let elefound = this.mapDataSave.find(e => e.competitorSalesOrgMappingId == key);
                  console.log('elefound = ', elefound);
    
                  if (elefound) {
                      console.log('if = ', elefound);
                      elefound.compstatus = res;
                     

                      console.log(elefound.displayName , 'elefound.displayName>>>>>');
                  } else {
                      console.log('else = ', elefound);
                      this.mapDataSave.push(JSON.parse(JSON.stringify(ele)));
                      let elefound1 = this.mapDataSave.find(e => e.competitorSalesOrgMappingId == key);
                      elefound1.compstatus = res;
                      
                    }
                  
                  }
                  
               });
               console.log('HIiiiii+++++++'    ,this.mapDataSave);    
           }
   
         }).catch(err=>console.log(err));
       
   
     }
   
connectedCallback() {
     
  this.refreshData();
}
SavehandleClick(event){ 
  console.log(  'Hello Welcome +++++'  ,this.mapDataSave);
  updateCompetitorMapStatus({ statusmap:JSON.stringify(this.mapDataSave)}).then(result => {
    console.log('result = ' + result);
    this.refreshData();
    if(result == 'true'){
      console.log('result+++ ' + result);
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Success',
          message: 'Status updated successfully',
          variant: 'success'
       
   })
    );
    }
    if(result == 'false'){
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

  
  let test = JSON.parse(JSON.stringify(this.paginatedCompetitorSalesorgMapping));
  //console.log('Welcome', test);
  this.paginatedCompetitorSalesorgMapping = test;
 //console.log('Hello ', this.paginatedProductCategorySalesorgMapping);
  this.paginatedCompetitorSalesorgMapping.move(currentIndex, newIndex);
  //this.productCategorySalesorgMapping.move(currentIndex, newIndex);


 }
  }