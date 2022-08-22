import { LightningElement,track,api,wire } from 'lwc';
import getCropAllocation from '@salesforce/apex/GTMPathFinder.getCropAllocation'
import getFiscalYear from '@salesforce/apex/GTMPathFinder.getFiscalYear'
import updateGTMDetail from '@salesforce/apex/GTMPathFinder.updateGTMDetailCropAllocation';
import getInstructions from '@salesforce/apex/GTMPathFinderHelper.getInstructions';
import isWindowPeriodClosed from '@salesforce/apex/GTMPathFinderHelper.isWindowPeriodClosed';
import getUser from '@salesforce/apex/GTMPathFinder.getUser';
import All_Companies_Purchase_to_Customer from '@salesforce/label/c.All_Companies_Purchase_to_Customer';
import Customer_Lead_Customer from '@salesforce/label/c.Customer_Lead_Customer';
import Remaining from '@salesforce/label/c.Remaining';
import Check_If_Distribution_Is_Correct from '@salesforce/label/c.Check_If_Distribution_Is_Correct';
import Distribution_completed from '@salesforce/label/c.Distribution_completed';
import Please_check_the_values_Not_matching_100 from '@salesforce/label/c.Please_check_the_values_Not_matching_100';
import Combined_Total_Value from '@salesforce/label/c.Combined_Total_Value';
import Combined_total_value_more_than_100_is_not_allowed from '@salesforce/label/c.Combined_total_value_more_than_100_is_not_allowed';
import Instructions from '@salesforce/label/c.Instructions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLeadRecordTypeId from '@salesforce/apex/GTMPathFinder.getLeadRecordTypeId';
import getGTMDetailsToDisable from '@salesforce/apex/GTMPathFinderHelper.getGTMDetailsToDisable';
import getLowerHierarchyRecordsToDisable from '@salesforce/apex/GTMPathFinder.getLowerHierarchyRecordsToDisable';
export default class GtmCropAllocation extends LightningElement {
    @api selectedCountry1;
    filtersOnPage = '';
    gtmDetailsToDisable = [];
    instrustions = '';
    hasRendered = false;
    @track cropAllocations = [];
    copyCropAllocationsVirtual = [];
    showLoading = false;
    disableAll = false;
    countryLocale = 'es-AR'
    @track options = {
        notFilled:'0',
        inProgress:'0',
        completed:'0' 
    }
    sortDirection = true;
    @track paginatedCropAllocation = [];
    leadRecordTypeId = '';
    columns = [];
    fiscalYear = '';
    columnfiscalYear = '';
    set gtmFiscalYear(value) {
        this.fiscalYear = value;
    }

    @api get gtmFiscalYear() {
        return this.fiscalYear;
    }

    @api getCountryValueFromParent;

    @wire(getInstructions) getInstrustion({error,data}){
        if(data){
            this.instrustions = data.Instruction_Crop_Allocation__c;
        }
    }
   
    
      @wire(getLeadRecordTypeId) getLeadRecordType({err,data}){
        if(data){
            this.leadRecordTypeId = data;
            console.log('leadRecordTypeId ',this.leadRecordTypeId);
        }
        if(err){
            console.log('Error while getting Lead Record Type ',err);
        }
    }


    @api onTabRefresh(){
        setTimeout(() => {
            this.connectedCallback();
        }, 500);
    }
    labels = {
        All_Companies_Purchase_to_Customer1:All_Companies_Purchase_to_Customer,
        Customer_Lead_Customer:Customer_Lead_Customer,
        Remaining:Remaining,
        Check_If_Distribution_Is_Correct:Check_If_Distribution_Is_Correct,
        Distribution_completed:Distribution_completed,
        Please_check_the_values_Not_matching_100:Please_check_the_values_Not_matching_100,
        Instructions:Instructions,
        Combined_total_value_more_than_100_is_not_allowed,
        Combined_Total_Value
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

    renderedCallback(){
        
        if(!this.hasRendered && this.copyCropAllocationsVirtual.length>0){
            setTimeout(() => {
                this.copyCropAllocationsVirtual.forEach(row=>{
                    row.crops.forEach(col=>{
                        if(col.isSubmitted__c){
                            this.template.querySelectorAll('[data-detail="' + col.GTMDetail + '"]').forEach(cell=>{
                                cell.disabled = true;
                            })
                        }
                    })
                })
                this.gtmDetailsToDisable.forEach(row => {
                    console.log('row ',row);
                    this.template.querySelectorAll('[data-detail="' + row.Id + '"]').forEach(cell => {
                        cell.disabled = true;
                    })
                })
                this.hasRendered = true;
            }, 500);
        }
    }

    connectedCallback(){
        //alert('hi divya11' +this.selectedCountry1);
        Promise.all([getCropAllocation({year:this.fiscalYear})]).then(result=>{
            let data = [];
            let tempCropAllocation=[];
            let tempAllCropAllocations = [];
            if(result.length>0){
                data = result[0]
            }
            for(let key in data){
                tempCropAllocation.push({key:key,value:data[key]})
            }
            tempCropAllocation.forEach(ele=>{
                let cropObj = this.mapCustomerCrop(ele.value,ele.key)
                tempAllCropAllocations.push(cropObj);
            });
            setTimeout(() => {
                console.log('tempAllCropAllocations ',tempAllCropAllocations);
                this.cropAllocations = tempAllCropAllocations;
                this.copyCropAllocationsVirtual = tempAllCropAllocations;
                this.paginatedCropAllocation = this.cropAllocations;
                let copyCropAllocations = this.cropAllocations;
                // this.sortData('customerName',true);
                this.getTableData(copyCropAllocations);
                setTimeout(() => {
                    this.paginatedCropAllocation.forEach(ele=>{
                        this.updateStatus(ele.customerId);
                    })
                }, 200);
                this.updateStatusLabel();
            }, 200);
        }).catch(err=>{
            this.showLoading = false;
            console.log(err)
        });
      
        getGTMDetailsToDisable({recordTypeName:'Crop Allocation'}).then(gtmDetailsToDisable=>{
            this.gtmDetailsToDisable = JSON.parse(JSON.stringify(gtmDetailsToDisable));
            getLowerHierarchyRecordsToDisable({fiscalyear:this.fiscalYear,recordTypeName:'Crop Allocation'}).then(gtmDetailsOfLowerUser=>{
                this.gtmDetailsToDisable.push(...JSON.parse(JSON.stringify(gtmDetailsOfLowerUser)));
            })
            console.log('gtmDetailsToDisable ',gtmDetailsToDisable);
        }).catch(err=>console.log('gtmDetailsToDisable ',err));
        this.checkDataYear();
    }

    getTableData(data){
        let year = this.fiscalYear.replace('-20','/');
        this.columnfiscalYear = `${this.labels.All_Companies_Purchase_to_Customer1} ${year}`;
        if(data[0]){
            this.columns = data[0].crops;
        }
    }
    handleCropDetailChange(event){
        let detailId =  event.currentTarget.dataset.detail;
        let accid = event.currentTarget.dataset.accountid;
        let value = event.target.value;
       

        let remainigPercentage = 0;
        let rowIndex = this.copyCropAllocationsVirtual.findIndex(ele=>ele.customerId==accid);
        if(this.copyCropAllocationsVirtual[rowIndex].crops){
            this.copyCropAllocationsVirtual[rowIndex].crops.forEach(e=>{
                if(e.GTMDetail==event.currentTarget.dataset.detail){
                    e.allocation = value;
                    this.updateStatus(event.currentTarget.dataset.accountid);
                }
            })
            this.copyCropAllocationsVirtual[rowIndex].crops.forEach(e=>{
                console.log('e.allocation ',e.allocation);
                let tempAllocation = isNaN(Number(e.allocation))?0:Number(e.allocation).toFixed(2);
                remainigPercentage = Number(Number(remainigPercentage).toFixed(2)) + Number(tempAllocation);
                console.log('total Percentage ',remainigPercentage);
            })
        
            if(remainigPercentage<0 || remainigPercentage>100){
                this.showToast(this.labels.Combined_Total_Value,this.labels.Combined_total_value_more_than_100_is_not_allowed,'error');
                remainigPercentage =0;
                value = '';
                this.copyCropAllocationsVirtual[rowIndex].crops.forEach(e=>{
                if(e.GTMDetail==event.currentTarget.dataset.detail){
                    e.allocation = null;
                    this.updateStatus(event.currentTarget.dataset.accountid);
                }
                })
            }
            this.cropAllocations = JSON.parse(JSON.stringify(this.copyCropAllocationsVirtual));
            this.applyFiltersOnCustomer(this.filtersOnPage);
        }

        if(!value || (Number(value)<0 && Number(value)>=100)){
            this.template.querySelector('[data-detail="' + detailId + '"]').value = '';
            value = null;
            this.updateGTMDetail(detailId,value);
            this.updateStatus(accid);
            this.onChangeLabelOption(value,accid,detailId);
            this.updateStatusLabel();
        }
        if(Number(value)>=0 && Number(value)<=100){
        if(accid && value){
            this.updateGTMDetail(detailId,value);
            this.updateStatus(accid);
            this.onChangeLabelOption(value,accid,detailId);
            setTimeout(() => {
                this.updateStatusLabel();
                // this.cropAllocations = JSON.parse(JSON.stringify(this.copyCropAllocationsVirtual));//Added in 1-31-2022
            }, 200);
        }
        // this.copyCropAllocationsVirtual.forEach(ele=>{
        //     ele.crops.forEach(e=>{
        //         if(e.GTMDetail==event.currentTarget.dataset.detail){
        //             e.allocation = value;
        //             this.updateStatus(event.currentTarget.dataset.accountid);
        //         }
        //     })
        // })
        }
    }
    onChangeLabelOption(value,accid,detailId){
        this.cropAllocations.forEach(ele=>{
            if(ele.customerId==accid){
                let percent = 100;
                let tempValue = value;
                ele.crops.forEach(e=>{
                    let tempAllocation = 0;
                    if(e.GTMDetail!=detailId){
                        tempAllocation = isNaN(e.allocation)?0:e.allocation;
                        tempValue = Number(Number(tempAllocation).toFixed(2)) + Number(Number(tempValue).toFixed(2));
                    }
                })
                percent = Number(Number(percent).toFixed(2)) - Number(Number(tempValue).toFixed(2));
                let percentageLabel = '';
                if(percent==0){
                    percentageLabel = 'Completed';
                }else if(percent>0 && percent<100){
                    percentageLabel = 'In Progress';
                }else if(percent==100){
                    percentageLabel = 'Not Fill';
                }
                ele.percentage = percentageLabel;
                ele.percentageValue = percent;
            }
        });
        this.copyCropAllocationsVirtual = JSON.parse(JSON.stringify(this.cropAllocations));
    }
    updateGTMDetail(tempGtmId,tempValue){
        updateGTMDetail({gtmId:tempGtmId,value:tempValue}).then(value=>{
        }).catch(err=>console.log('Error while updating GTMDetails ',gtmId,' ',err))
    }
    mapCustomerCrop(cropAllocation,customerid){
        let masterObj = {};
        let arr = [];
        let percentage = 100 
        cropAllocation.forEach(ele=>{
            let tempAllocation = 0;
            if(ele.GTM_Customer__c == customerid){
            tempAllocation = isNaN(ele.Crop_Allocation__c)?0:ele.Crop_Allocation__c;
            percentage = Number(Number(percentage).toFixed(2)) - Number(Number(tempAllocation).toFixed(2));
            let percentageLabel = '';
            if(percentage==0){
                percentageLabel = 'Completed';
            }else if(percentage>0 && percentage<100){
                percentageLabel = 'In Progress';
            }else if(percentage==100){
                percentageLabel = 'Not Fill';
            }
            let tempCompaniesPY = Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c)?Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c).toLocaleString(this.countryLocale):'';

            let helptext = ele.Crop__r.Help_Text__c?ele.Crop__r.Help_Text__c:'';
            let obj = {'cId':ele.Crop__r.Id,'cName':ele.Crop__r.Name,'GTMDetail':ele.Id,'allocation':ele.Crop_Allocation__c,isSubmitted__c:ele.isSubmitted__c,helpText:helptext};
            arr.push(obj)
            masterObj = {customerId:ele.GTM_Customer__c,customerName:ele.GTM_Customer__r.Name,totalCompaniesPurches:tempCompaniesPY,crops:arr,'isLeadCustomer':ele.GTM_Customer__r.RecordTypeId == this.leadRecordTypeId?true:false,percentage:percentageLabel,percentageValue:percentage,pathFinder:ele.GTM_Customer__r.Path_Finder__c};
            }
        });
        let other = masterObj.crops.filter(ele=>String(ele.cName).toLowerCase().includes('other'));
            let othersIndex = masterObj.crops.findIndex(ele=>String(ele.cName).toLowerCase().includes('other'));
            // console.log('other ',other,'index ',othersIndex);
            if(othersIndex!=-1 && other.length>0){
                masterObj.crops.splice(othersIndex,1);
                masterObj.crops.push(other[0]);
                masterObj.crops = masterObj.crops;
            }
        return masterObj;
    }
    updateStatus(customerId){
        let inputCompleted = 100;
        setTimeout(() => {
        this.template.querySelectorAll('[data-accountid="' + customerId + '"]').forEach(col=>{
            if(col.classList.value.includes('inputDetails')){
                if(col.value){
                    inputCompleted = Number(Number(inputCompleted).toFixed(2)) - Number(Number(col.value).toFixed(2));
                }
            }
            if(col.classList.value.includes('percentage')){
                col.firstChild.data = `${Number(Number(inputCompleted).toFixed(2)).toLocaleString(this.countryLocale)} %`;
            }
            if(col.classList.value.includes('distribution')){
                col.style.backgroundColor = 'green';
                col.style.color = '#fff';
                col.firstChild.data = this.labels.Distribution_completed
            }
            if(col.classList.value.includes('distribution') && inputCompleted<=100 && inputCompleted!=0){
                col.style.backgroundColor = 'red';
                col.style.color = '#fff';
                col.firstChild.data = this.labels.Please_check_the_values_Not_matching_100;
            }
        })
    }, 200);
    }

    updateStatusLabel(){
        let green= 0;
        let red=0;
        let yellow=0;
        this.cropAllocations.forEach(ele=>{
            if(ele.percentage=='Completed'){
                green++;
            }
            if(ele.percentage=='In Progress'){
                yellow++
            }
            if(ele.percentage=='Not Fill'){
                red++;
            }
        });

        this.options = {
            completed:green,
            inProgress:yellow,
            notFilled:red
        }
    }
    handlePaginationAction(event){
        this.paginatedCropAllocation = event.detail.values;
        let copyCropAllocations = this.copyCropAllocationsVirtual;
        this.getTableData(copyCropAllocations);
        setTimeout(() => {
                this.paginatedCropAllocation.forEach(ele=>{
                this.updateStatus(ele.customerId);
                })
            }, 200);
        this.updateStatusLabel();
        this.hasRendered = false;
    }
    handleFilterPanelAction(event){
        this.filtersOnPage = JSON.parse(JSON.stringify(event.detail));
        let filtersValue = JSON.parse(JSON.stringify(event.detail));
        if(filtersValue){
            this.applyFiltersOnCustomer(filtersValue);
        }
    }

    applyFiltersOnCustomer(filtersValue){
        if(filtersValue){
        this.template.querySelector('c-pagination-cmp').pagevalue = 1;
        let search = filtersValue.search.length!=0;
        let filter1 = filtersValue.filter1.length!=0 && filtersValue.filter1!='Both';
        let filter2 = filtersValue.filter2.length!= 0 && filtersValue.filter2!='None';
        let filter3 = filtersValue.filter3.length!= 0 && filtersValue.filter3!='Both';
        let searchValue = String(filtersValue.search).toLocaleLowerCase();
        let filter1Value = filtersValue.filter1;
        if(filter1Value=='Lead Customer'){
            filter1Value = true;
        }
        if(filter1Value=='Non Lead Customer'){
            filter1Value = false;
        }
        let filter2Value = filtersValue.filter2;
        let filter3Value = filtersValue.filter3;
        this.getCalculatedPercentage();
        this.cropAllocations = [];
        this.paginatedCropAllocation =[];
        this.cropAllocations = this.copyCropAllocationsVirtual.filter(ele=>{
            let custName = String(ele.customerName).toLowerCase();
            if (search && filter1 && filter2 && filter3) {
                return custName.includes(searchValue) && ele.isLeadCustomer==filter1Value && ele.percentage==filter2Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (search && filter1 && filter2 && !filter3) {
               return custName.includes(searchValue) && ele.isLeadCustomer==filter1Value && ele.percentage==filter2Value
            }
            else if (search && filter1 && !filter2 && filter3) {
                return custName.includes(searchValue) && ele.isLeadCustomer==filter1Value  && String(ele.pathFinder) == String(filter3Value);
            }
            else if (search && filter1 && !filter2 && !filter3) {
                return custName.includes(searchValue) && ele.isLeadCustomer==filter1Value;
            }
            else if (search && !filter1 && filter2 && filter3) {
                return custName.includes(searchValue) && ele.percentage==filter2Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (search && !filter1 && filter2 && !filter3) {
                return custName.includes(searchValue)  && ele.percentage==filter2Value;
            }
            else if (search && !filter1 && !filter2 && filter3) {
                return custName.includes(searchValue) && String(ele.pathFinder) == String(filter3Value);
            }
            else if (search && !filter1 && !filter2 && !filter3) {
                return custName.includes(searchValue);
            }
            else if (!search && filter1 && filter2 && filter3) {
                return ele.isLeadCustomer==filter1Value && ele.percentage==filter2Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && filter1 && filter2 && !filter3) {
                return ele.isLeadCustomer==filter1Value && ele.percentage==filter2Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && filter1 && !filter2 && filter3) {
                return ele.isLeadCustomer == filter1Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && filter1 && !filter2 && !filter3) {
                return  ele.isLeadCustomer==filter1Value;
            }
            else if (!search && !filter1 && filter2 && filter3) {
                return ele.percentage==filter2Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && !filter1 && filter2 && !filter3) {
                return ele.percentage==filter2Value;
            }
            else if (!search && !filter1 && !filter2 && filter3) {
                return String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && !filter1 && !filter2 && !filter3) {
                return true;
            }
        });
        this.copyCropAllocationsVirtual.forEach(ele=>{
            this.updateStatus(ele.customerId);
        })
        this.paginatedCropAllocation = JSON.parse(JSON.stringify(this.cropAllocations));
        }
    }

    getCalculatedPercentage(){
        this.copyCropAllocationsVirtual.forEach((ele)=>{
            let percentage = 100;
            let tempAllocation = 0;
            ele.crops.forEach(e=>{
                tempAllocation = isNaN(e.allocation)?0:e.allocation;
                percentage = Number(Number(percentage).toFixed(2)) - Number(Number(tempAllocation).toFixed(2)); 
                // console.log('cal percenatge ',percentage);
            })
            let percentageLabel = '';
            if(percentage==0){
                percentageLabel = 'Completed';
            }else if(percentage>0 && percentage<100){
                percentageLabel = 'In Progress';
            }else if(percentage==100){
                percentageLabel = 'Not Fill';
            }
            setTimeout(() => {
                ele.percentage = percentageLabel;
                ele.percentageValue = percentage;
            }, 50);
        })
    }
    handleSort(event){
        let fieldName = event.target.name;
        this.sortDirection = !this.sortDirection;
        this.sortData(fieldName,this.sortDirection);
    }

    sortData(fieldname, direction) {
        direction = direction==true?'asc':'des';
        let parseData = JSON.parse(JSON.stringify(this.copyCropAllocationsVirtual));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
           parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.cropAllocations = parseData;
    }
    showToast(title,message,variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
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