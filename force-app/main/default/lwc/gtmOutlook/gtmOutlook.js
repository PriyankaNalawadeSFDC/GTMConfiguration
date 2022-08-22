import { LightningElement, track, wire, api} from "lwc";
import getGTMOutlook from "@salesforce/apex/GTMOutlook.getGTMOutlook";
import updateGtmDetails from "@salesforce/apex/GTMOutlook.updateGtmDetails";
import getInstructions from '@salesforce/apex/GTMPathFinderHelper.getInstructions';
import Instructions from '@salesforce/label/c.Instructions';
import GTM_Customer from '@salesforce/label/c.GTM_Customer';
import Total_Purchase_in_PY from '@salesforce/label/c.Total_Purchase_in_PY';
import Estimated_Growth_in_CY from '@salesforce/label/c.Estimated_Growth_in_CY';
import Estimated_Sales_in_CY from '@salesforce/label/c.Estimated_Sales_in_CY';
import Estimated_Growth_in_NY from '@salesforce/label/c.Estimated_Growth_in_NY';
import Estimated_Sales_in_NY from '@salesforce/label/c.Estimated_Sales_in_NY';
import Estimated_Growth_in_NNY from '@salesforce/label/c.Estimated_Growth_in_NNY';
import Estimated_Sales_in_NNY from '@salesforce/label/c.Estimated_Sales_in_NNY';
import isWindowPeriodClosed from '@salesforce/apex/GTMPathFinderHelper.isWindowPeriodClosed';
import getUser from '@salesforce/apex/GTMPathFinder.getUser';
import getGTMDetailsToDisable from '@salesforce/apex/GTMPathFinderHelper.getGTMDetailsToDisable';
import getLowerHierarchyRecordsToDisable from '@salesforce/apex/GTMPathFinder.getLowerHierarchyRecordsToDisable';

export default class GtmOutlook extends LightningElement {
  @api selectedCountry1;
  instrustions = '';
  countryLocale = 'es-Ar';
  hasRendered = false;
  disableAll = false;
  @track GTMOutlookDetails = [];
  GTMOutlookDetailsCopy = [];
  @track paginatedGTMOutlookDetails;
  @track error;
  @track pending = true;
  @track panelStatus={
    notFilled:'0',
    inProgress:'0',
    completed:'0'
  }
  @track sortDirection = true; 
  @track gtmDetailsToDisable = [];
  @track currentPage = 1;
    defaultSelectedOption = '';
  fiscalYear='';

    set gtmFiscalYear(value) {
      this.fiscalYear = value;
  }

  @api get gtmFiscalYear() {
      return this.fiscalYear;
  }
  @api getCountryValueFromParent;
   label = {
      Instructions:Instructions,
      GTM_Customer:GTM_Customer,
      Total_Purchase_in_PY:Total_Purchase_in_PY,
      Estimated_Growth_in_CY:Estimated_Growth_in_CY,
      Estimated_Sales_in_CY:Estimated_Sales_in_CY,
      Estimated_Growth_in_NY:Estimated_Growth_in_NY,
      Estimated_Sales_in_NY:Estimated_Sales_in_NY,
      Estimated_Growth_in_NNY:Estimated_Growth_in_NNY,
      Estimated_Sales_in_NNY:Estimated_Sales_in_NNY
    }
    

  @wire(getInstructions) getInsrustion({error,data}){
      if(data){
          console.log('Instruction Data',data);
          this.instrustions = data.Instruction_Outlook__c;
      }
  }

  constructor(){
    super()
    getUser().then(user=>{
        console.log('Country user ',user);
        if(user){
            if(user.Country=='Argentina'){
                this.countryLocale = 'es-AR';
            }
            if(user.Country=='Mexico'){
                this.countryLocale = 'es-MX';
            }
            if(user.Country=='Italy'){
                this.countryLocale = 'it-IT';
            }
        }
    }).catch(error=>{
        console.log(error);
    })
}

  @api onTabRefresh(){
    setTimeout(() => {
        this.connectedCallback();
    }, 500);
}

renderedCallback(){
  if(!this.hasRendered && this.GTMOutlookDetailsCopy.length>0){
      setTimeout(() => {
          this.GTMOutlookDetailsCopy.forEach(row=>{
              if(row.isSubmitted__c){
                  this.template.querySelectorAll('[data-id="' + row.Id + '"]').forEach(cell=>{
                      console.log('cell ',cell);
                      cell.disabled = true;
                  })
              }
          })
          this.gtmDetailsToDisable.forEach(row => {
            console.log('row ',row);
            this.template.querySelectorAll('[data-id="' + row.Id + '"]').forEach(cell => {
                cell.disabled = true;
            })
        })
          this.hasRendered = true;
      }, 500);
  }
}
  connectedCallback() {
    //alert('hi divya11' +this.selectedCountry1);
    getGTMOutlook({year:this.fiscalYear}
      ).then((result) => {
        let tempData = [];
        result.forEach((ele) => {
          let confirmtotalSalesChannelCYFormula = Number((Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c)*Number(ele.Estimated_Growth_PY_to_CY__c)/100)+Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c)).toFixed(2)
          console.log('Calculated Value-->',ele.Estimated_Growth_PY_to_CY__c);

          let confirmtotalSalesChannelNYFormula = Number((Number(confirmtotalSalesChannelCYFormula)*Number(ele.Estimated_Growth_PY_to_NY__c)/100)+Number(confirmtotalSalesChannelCYFormula)).toFixed(2)

          let confirmtotalSalesChanneN2YFormula =Number((Number(confirmtotalSalesChannelNYFormula)*Number(ele.Estimated_Growth_NY_to_2NY__c)/100)+Number(confirmtotalSalesChannelNYFormula)).toFixed(2)

          let tempCompaniesPY = Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c)?Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c).toLocaleString(this.countryLocale):'';
          let obj = {
            Id: ele.Id,
            customerName: ele.GTM_Customer__r ? ele.GTM_Customer__r.Name : "",
            totalCompaniesPurchesLocale:tempCompaniesPY,
            totalCompaniesPurches:ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c,
            EstimatedGrowthCY: ele.Estimated_Growth_PY_to_CY__c?ele.Estimated_Growth_PY_to_CY__c:'',
            EstimatedGrowthNY: ele.Estimated_Growth_PY_to_NY__c?ele.Estimated_Growth_PY_to_NY__c:'',
            EstimatedGrowth2NY: ele.Estimated_Growth_NY_to_2NY__c?ele.Estimated_Growth_NY_to_2NY__c:'',
            confirmtotalSalesChannelCY:isNaN(confirmtotalSalesChannelCYFormula)?'':Number(confirmtotalSalesChannelCYFormula).toLocaleString(this.countryLocale),
            confirmtotalSalesChannelNY:isNaN(confirmtotalSalesChannelNYFormula)?'':Number(confirmtotalSalesChannelNYFormula).toLocaleString(this.countryLocale),
            confirmtotalSalesChanneN2Y:isNaN(confirmtotalSalesChanneN2YFormula)?'':Number(confirmtotalSalesChanneN2YFormula).toLocaleString(this.countryLocale),
            status:'',
            numberOfFieldsFilled:'',
            isLeadCustomer:ele.GTM_Customer__r.Lead_Customer__c?true:false,
            pathFinder:ele.GTM_Customer__r.Path_Finder__c,
            isSubmitted__c:ele.isSubmitted__c
          };
          tempData.push(obj);
        });

        setTimeout(() => {

          this.GTMOutlookDetails = tempData;
          console.log('GTMOutlook String', JSON.stringify(this.GTMOutlookDetails));
          this.GTMOutlookDetailsCopy = tempData;
          this.paginatedGTMOutlookDetails = this.GTMOutlookDetails;
                  this.GTMOutlookDetails.forEach(ele=>{
                  this.handleChangeStatusOnLoad(ele.Id);
                  this.updateStatusLabel();
           })
        }, 200);
        console.log("Data", result);
      })
      .catch((error) => {
        this.error = error;
        console.log("Error Data", error);
      })
      .finally(() => {
        this.pending = false;
      });

      getGTMDetailsToDisable({recordTypeName:'Outlook'}).then(gtmDetailsToDisable=>{
        this.gtmDetailsToDisable = JSON.parse(JSON.stringify(gtmDetailsToDisable));
        getLowerHierarchyRecordsToDisable({fiscalyear:this.fiscalYear,recordTypeName:'Outlook'}).then(gtmDetailsOfLowerUser=>{
          this.gtmDetailsToDisable.push(...JSON.parse(JSON.stringify(gtmDetailsOfLowerUser)));
      })
        console.log('gtmDetailsToDisable ',gtmDetailsToDisable);
    }).catch(err=>console.log('gtmDetailsToDisable ',err));

    this.checkDataYear();

    
    }

  handleFieldChange(event) {
    console.log(event.target.value);
    let value = event.target.value;
    let apiName = event.currentTarget.dataset.name;
    let recordId = event.currentTarget.dataset.id;
    console.log("Value", value, "ApiName", apiName, "Id", recordId);
  
      if(value>100){
        value=null;
      }
      updateGtmDetails({apiName:apiName,value:value?value:null,recordId:recordId}).then((res) => {
        console.log("Response-->", res);
      }).catch(error=>console.log('Update GTMDetails',error))

      let objIndex = this.GTMOutlookDetails.findIndex(obj=>obj.Id==recordId);

     
      
       if(apiName == 'Estimated_Growth_PY_to_CY__c'){
        this.GTMOutlookDetails[objIndex].EstimatedGrowthCY = value;
        this.refreshValue(objIndex,value,apiName);
       
         
       }
        if(apiName == 'Estimated_Growth_PY_to_NY__c'){
          this.GTMOutlookDetails[objIndex].EstimatedGrowthNY = value;
        this.refreshValue(objIndex,value,apiName)
      }
       if(apiName == 'Estimated_Growth_NY_to_2NY__c'){
        this.GTMOutlookDetails[objIndex].EstimatedGrowth2NY = value;
        this.refreshValue(objIndex,value,apiName);
         
      }

 
      setTimeout(() => {
        let tempData = JSON.parse(JSON.stringify(this.GTMOutlookDetails));
        this.GTMOutlookDetails = tempData;
        this.paginatedGTMOutlookDetails = this.GTMOutlookDetails;
        console.log("In HandleChange", this.paginatedGTMOutlookDetails);
        this.handleChangeStatusOnLoad(recordId);
        this.updateStatusLabel();
    }, 200);
  
  }

  refreshValue(objIndex,value,apiName){
    let confirmtotalSalesChannelCYFormula = 0;
    let confirmtotalSalesChannelNYFormula = 0;
    let confirmtotalSalesChanneN2YFormula = 0;

    if (value) {
      confirmtotalSalesChannelCYFormula = Number((Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowthCY)/100)+Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)).toFixed(2)
     
      if (this.GTMOutlookDetails[objIndex].EstimatedGrowthCY) {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChannelCY =isNaN(confirmtotalSalesChannelCYFormula)?'':Number(confirmtotalSalesChannelCYFormula).toLocaleString(this.countryLocale);
      }
     

      confirmtotalSalesChannelCYFormula = Number((Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowthCY)/100)+Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)).toFixed(2)
      confirmtotalSalesChannelNYFormula = Number((Number(confirmtotalSalesChannelCYFormula)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowthNY)/100)+Number(confirmtotalSalesChannelCYFormula)).toFixed(2)
       
      if (this.GTMOutlookDetails[objIndex].EstimatedGrowthNY && this.GTMOutlookDetails[objIndex].EstimatedGrowthCY) {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChannelNY =isNaN(confirmtotalSalesChannelNYFormula)?'':Number(confirmtotalSalesChannelNYFormula).toLocaleString(this.countryLocale);
       }
       

        confirmtotalSalesChannelCYFormula = Number((Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowthCY)/100)+Number(this.GTMOutlookDetails[objIndex].totalCompaniesPurches)).toFixed(2)
        confirmtotalSalesChannelNYFormula = Number((Number(confirmtotalSalesChannelCYFormula)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowthNY)/100)+Number(confirmtotalSalesChannelCYFormula)).toFixed(2)
        confirmtotalSalesChanneN2YFormula =Number((Number(confirmtotalSalesChannelNYFormula)*Number(this.GTMOutlookDetails[objIndex].EstimatedGrowth2NY)/100)+Number(confirmtotalSalesChannelNYFormula)).toFixed(2)
       
        if (this.GTMOutlookDetails[objIndex].EstimatedGrowth2NY && this.GTMOutlookDetails[objIndex].EstimatedGrowthNY && this.GTMOutlookDetails[objIndex].EstimatedGrowthCY) {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChanneN2Y = isNaN(confirmtotalSalesChanneN2YFormula)?
        '':Number(confirmtotalSalesChanneN2YFormula).toLocaleString(this.countryLocale);
       }
        


    }
    else{
      if (apiName == 'Estimated_Growth_PY_to_CY__c') {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChannelCY=null;
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChannelNY=null;
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChanneN2Y=null;
        this.GTMOutlookDetails[objIndex].EstimatedGrowthNY=null;
        this.GTMOutlookDetails[objIndex].EstimatedGrowth2NY=null;

        
      }
      else if (apiName=='Estimated_Growth_PY_to_NY__c') {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChannelNY=null;
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChanneN2Y=null;
        this.GTMOutlookDetails[objIndex].EstimatedGrowth2NY=null;
      }
      else if (apiName=='Estimated_Growth_NY_to_2NY__c') {
        this.GTMOutlookDetails[objIndex].confirmtotalSalesChanneN2Y=null;
      }
    }

  }

  updateStatusLabel(){
    let completeField = 0;
    let inProgressField = 0;
    let NotFilled = 0;
    this.GTMOutlookDetails.forEach(ele=>{
        if(ele.status=="Completed"){
            completeField++;
        }
        if(ele.status=="INProgress"){
            inProgressField++;
        }
        if(ele.status=="NotFilled"){
            NotFilled++;
        }
    });
    this.panelStatus = {
        notFilled:NotFilled,
        inProgress:inProgressField,
        completed:completeField
    }
}


  handleChangeStatusOnLoad(recordId){
    console.log('RecordId',recordId);
        this.GTMOutlookDetails.forEach(ele=>{
            console.log('ele',JSON.stringify(ele));
            let NumberOfFilled = 0;
            if (ele.EstimatedGrowthCY && Number(ele.EstimatedGrowthCY)!=0) {
              NumberOfFilled++;
              console.log('Condition 1');
            }
            if (ele.EstimatedGrowthNY && Number(ele.EstimatedGrowthNY)!=0) {
              NumberOfFilled++;
              console.log('Condition 2');
            }
            if (ele.EstimatedGrowth2NY && Number(ele.EstimatedGrowth2NY)!=0) {
              NumberOfFilled++;
              console.log('Condition 3');
            }
            ele.numberOfFieldsFilled = NumberOfFilled;
            if (NumberOfFilled==3) {
              ele.status = 'Completed';
              console.log('Condition 4');
            }
            if(NumberOfFilled<3 && NumberOfFilled>0){
              ele.status = 'INProgress';
              console.log('Condition 5');
          }
          if(NumberOfFilled==0){
              ele.status = 'NotFilled';
              console.log('Condition 6');
          }
    })

  }
  
  handleSort(event) {
    let fieldName = event.target.name;
    this.sortDirection = !this.sortDirection;
    this.sortData(fieldName, this.sortDirection);
  }

  sortData(fieldname, direction) {
    direction = direction == true ? "asc" : "des";
    console.log("Field Name ", fieldname, " direction ", direction);
    let parseData = JSON.parse(JSON.stringify(this.GTMOutlookDetailsCopy));
    let keyValue = (a) => {
      return a[fieldname];
    };
    let isReverse = direction === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";
      return isReverse * ((x > y) - (y > x));
    });
    this.GTMOutlookDetails = parseData;
    this.GTMOutlookDetailsCopy = parseData;
  }

  handleFiltersAction(event){
    console.log('filter action ',event.detail);
    let filterValues = JSON.parse(JSON.stringify(event.detail));
    this.applyFiltersOnCustomer(filterValues);
}

applyFiltersOnCustomer(filtersValue){
  console.log('filtersValue -------------->',filtersValue);
  this.template.querySelector('c-pagination-cmp').pagevalue = 1;
  let mapStatus = new Map([
      ["Not Fill", 'NotFilled'],
      ["In Progress", 'INProgress'],
      ["Completed", 'Completed']
    ]);
  let search = filtersValue.search.length!=0;
  let filter1 = filtersValue.filter1.length!=0 && filtersValue.filter1!='Both';
  let filter2 = filtersValue.filter2.length!= 0 && filtersValue.filter2!='None';
  let filter3 = filtersValue.filter3.length!= 0 && filtersValue.filter3!='Both';

  let searchValue = String(filtersValue.search).toLowerCase();
  let filter1Value = filtersValue.filter1;
  let filter2Value = filtersValue.filter2;
  let filter3Value = filtersValue.filter3;


  filter1Value = filter1Value=='Lead Customer'?true:false;

  this.GTMOutlookDetails = [];
  this.paginatedGTMOutlookDetails = [];

  this.GTMOutlookDetails = this.GTMOutlookDetailsCopy.filter(ele=>{
      let custName = String(ele.customerName).toLowerCase();
      console.log('Pathfinder Value', ele.pathFinder);
      if (search && filter1 && filter2 && filter3) {
        return custName.includes(searchValue) && ele.isLeadCustomer == filter1Value && ele.status == mapStatus.get(filter2Value) && String(ele.pathFinder) == String(filter3Value);
    }
    else if (search && filter1 && filter2 && !filter3) {
        return custName.includes(searchValue) && ele.isLeadCustomer == filter1Value && ele.status == mapStatus.get(filter2Value);
    }
    else if (search && filter1 && !filter2 && filter3) {
        return custName.includes(searchValue) && ele.isLeadCustomer == filter1Value && String(ele.pathFinder) == String(filter3Value);
    }
    else if (search && filter1 && !filter2 && !filter3) {
        return custName.includes(searchValue) && ele.isLeadCustomer == filter1Value;
    }
    else if (search && !filter1 && filter2 && filter3) {
        return custName.includes(searchValue) && ele.status == mapStatus.get(filter2Value) && String(ele.pathFinder) == String(filter3Value);
    }
    else if (search && !filter1 && filter2 && !filter3) {
        return custName.includes(searchValue) && ele.status == mapStatus.get(filter2Value);
    }
    else if (search && !filter1 && !filter2 && filter3) {
        return custName.includes(searchValue) && String(ele.pathFinder) == String(filter3Value);
    }
    else if (search && !filter1 && !filter2 && !filter3) {
        return custName.includes(searchValue);
    }
    else if (!search && filter1 && filter2 && filter3) {
        return ele.isLeadCustomer == filter1Value && ele.status == mapStatus.get(filter2Value) && String(ele.pathFinder) == String(filter3Value);
    }
    else if (!search && filter1 && filter2 && !filter3) {
        return ele.isLeadCustomer == filter1Value && ele.status == mapStatus.get(filter2Value);
    }
    else if (!search && filter1 && !filter2 && filter3) {
        return ele.isLeadCustomer == filter1Value && String(ele.pathFinder) == String(filter3Value);
    }
    else if (!search && filter1 && !filter2 && !filter3) {
        return ele.isLeadCustomer == filter1Value;
    }
    else if (!search && !filter1 && filter2 && filter3) {
        return ele.status == mapStatus.get(filter2Value) && String(ele.pathFinder) == String(filter3Value);
    }
    else if (!search && !filter1 && filter2 && !filter3) {
        return ele.status == mapStatus.get(filter2Value);
    }
    else if (!search && !filter1 && !filter2 && filter3) {
        return String(ele.pathFinder) == String(filter3Value);
    }
    else if (!search && !filter1 && !filter2 && !filter3) {
        return true;
    }
  })
  this.GTMOutlookDetailsCopy.forEach(ele=>{
      this.handleChangeStatusOnLoad(ele.Id);
  })
 this.paginatedGTMOutlookDetails = JSON.parse(JSON.stringify(this.GTMOutlookDetails));
 setTimeout(() => {
     this.updateStatusLabel();
 }, 200);
}
handlePaginationAction(event){
  setTimeout(() => {
   console.log('curret Page ',event.detail.currentPage);
   this.paginatedGTMOutlookDetails = event.detail.values;
   this.hasRendered = false;
}, 200);
}
checkDataYear(){
  let month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let d = new Date();
  let monthName = month[d.getMonth()];
  let currentYear = d.getFullYear();
  let year = (monthName=='Jan' || monthName=='Feb' || monthName=='Mar')?this.fiscalYear.split('-')[1]:this.fiscalYear.split('-')[0];
  if(currentYear!=year){
       this.disableAll = true;
  }else{
      isWindowPeriodClosed().then(isDisable=>{
          this.disableAll = isDisable
      });
  }
}

}