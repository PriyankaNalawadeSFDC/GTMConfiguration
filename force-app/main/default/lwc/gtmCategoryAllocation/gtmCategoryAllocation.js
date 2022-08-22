import { LightningElement,track,wire,api } from 'lwc';
import getCatergoryAllocation from '@salesforce/apex/GTMPathFinder.getCatergoryAllocation'
import getFiscalYear from '@salesforce/apex/GTMPathFinder.getFiscalYear'
import updateGTMDetail from '@salesforce/apex/GTMPathFinder.updateGTMDetailProductAllocation';
import getInstructions from '@salesforce/apex/GTMPathFinderHelper.getInstructions';
import isWindowPeriodClosed from '@salesforce/apex/GTMPathFinderHelper.isWindowPeriodClosed';
import getUser from '@salesforce/apex/GTMPathFinder.getUser';
import All_Companies_Purchase_to_Customer from '@salesforce/label/c.All_Companies_Purchase_to_Customer';
import Customer_Lead_Customer from '@salesforce/label/c.Customer_Lead_Customer';
import Remaining from '@salesforce/label/c.Remaining';
import Check_If_Distribution_Is_Correct from '@salesforce/label/c.Check_If_Distribution_Is_Correct';
import Please_check_the_values_Not_matching_100 from '@salesforce/label/c.Please_check_the_values_Not_matching_100';
import Distribution_completed from '@salesforce/label/c.Distribution_completed';
import Combined_Total_Value from '@salesforce/label/c.Combined_Total_Value';
import Combined_total_value_more_than_100_is_not_allowed from '@salesforce/label/c.Combined_total_value_more_than_100_is_not_allowed';
import Instructions from '@salesforce/label/c.Instructions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLeadRecordTypeId from '@salesforce/apex/GTMPathFinder.getLeadRecordTypeId';
import getGTMDetailsToDisable from '@salesforce/apex/GTMPathFinderHelper.getGTMDetailsToDisable';
import getLowerHierarchyRecordsToDisable from '@salesforce/apex/GTMPathFinder.getLowerHierarchyRecordsToDisable';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';

export default class GtmCategoryAllocation extends LightningElement {
    filtersOnPage = '';
    gtmDetailsToDisable = [];
    @track productAllocations = [];
    hasRendered = false;
    copyproductAllocationsVirtual = [];
    showLoading = false;
    disableAll = false;
    countryLocale = 'es-AR'
    @track options = {
        notFilled:'0',
        inProgress:'0',
        completed:'0' 
    }
    sortDirection = true;
    @track paginatedProductCategoryAllocation = [];
    columns = [];
    fiscalYear = '';
    columnfiscalYear = '';
    leadRecordTypeId = '';

    set gtmFiscalYear(value) {
        this.fiscalYear = value;
    }

    @api get gtmFiscalYear() {
        return this.fiscalYear;
    }

    @api getCountryValueFromParent;

    labels = {
        All_Companies_Purchase_to_Customer1:All_Companies_Purchase_to_Customer.split('<br />')[0],
        All_Companies_Purchase_to_Customer2:All_Companies_Purchase_to_Customer.split('<br />')[1]+` ${this.fiscalYear.replace('-20','/')}`,
        Customer_Lead_Customer:Customer_Lead_Customer,
        Remaining:Remaining,
        Check_If_Distribution_Is_Correct:Check_If_Distribution_Is_Correct,
        Please_check_the_values_Not_matching_100:Please_check_the_values_Not_matching_100,
        Distribution_completed:Distribution_completed,
        Instructions:Instructions,
        Combined_total_value_more_than_100_is_not_allowed,
        Combined_Total_Value
        
    }

    @wire(getInstructions) getInstrustion({error,data}){
        if(data){
            this.instrustions = data.Instruction_Product_Category_Allocatio__c;
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
        if(!this.hasRendered && this.copyproductAllocationsVirtual.length>0){
            setTimeout(() => {
                this.copyproductAllocationsVirtual.forEach(row=>{
                    row.productCategory.forEach(col=>{
                        if(col.isSubmitted__c){
                            this.template.querySelectorAll('[data-detail="' + col.GTMDetail + '"]').forEach(cell=>{
                                cell.disabled = true;
                            })
                        }
                    })
                });
                this.gtmDetailsToDisable.forEach(row => {
                    this.template.querySelectorAll('[data-detail="' + row.Id + '"]').forEach(cell => {
                        cell.disabled = true;
                    });
                })
                this.hasRendered = true;
            }, 1500);
        }
    }

    connectedCallback(){
        this.showLoading = true;
        Promise.all([getCatergoryAllocation({year:this.fiscalYear, selectedCountry: this.getCountryValueFromParent})]).then(result=>{
            let data = [];
            let tempProductAllocation=[];
            let tempAllProductAllocations = [];
            if(result.length>0){
                data = result[0]
            }
            for(let key in data){
                tempProductAllocation.push({key:key,value:data[key]})
            }
            tempProductAllocation.forEach(ele=>{
                let categoryObj = this.mapCustomerCategory(ele.value,ele.key)
                tempAllProductAllocations.push(categoryObj);
            });
            setTimeout(() => {
                this.productAllocations = tempAllProductAllocations;
                this.copyproductAllocationsVirtual = tempAllProductAllocations;
                this.paginatedProductCategoryAllocation = this.productAllocations;
                let copyProductAllocations = this.productAllocations;
                // this.sortData('customerName',true);
                this.getTableData(copyProductAllocations);
                setTimeout(() => {
                    this.paginatedProductCategoryAllocation.forEach(ele=>{
                        this.updateStatus(ele.customerId);
                    })
                }, 200);
                this.updateStatusLabel();
            }, 200);
            setTimeout(() => {
                this.showLoading = false;
            }, 1500);
            getGTMDetailsToDisable({recordTypeName:'Product Category Allocation'}).then(gtmDetailsToDisable=>{
                this.gtmDetailsToDisable = JSON.parse(JSON.stringify(gtmDetailsToDisable));
                getLowerHierarchyRecordsToDisable({fiscalyear:this.fiscalYear,recordTypeName:'Product Category Allocation'}).then(gtmDetailsOfLowerUser=>{
                    console.log('gtmDetailsOfLowerUser ',gtmDetailsOfLowerUser);
                    this.gtmDetailsToDisable.push(...JSON.parse(JSON.stringify(gtmDetailsOfLowerUser)));
                })
                console.log('gtmDetailsToDisable ',gtmDetailsToDisable);
            }).catch(err=>console.log('gtmDetailsToDisable ',err));
        }).catch(err=>{
            this.showLoading = false;
            console.log(err)
        });
        getUser().then(user=>{
            if(user.Country=='Argentina'){
                this.countryLocale = 'es-AR';
            }
            if(user.Country=='Mexico'){
                this.countryLocale = 'es-MX';
            }
            if(user.Country=='Italy'){
                this.countryLocale = 'it-IT';
            }
        });
        console.log('checkDataYearSatrted');
        this.checkDataYear();
    }

    handleProductDetailChange(event){
        let detailId =  event.currentTarget.dataset.detail;
        let accid = event.currentTarget.dataset.accountid;
        let value = event.target.value;
        
        let remainigPercentage = 0;
        let rowIndex = this.copyproductAllocationsVirtual.findIndex(ele=>ele.customerId==accid);
        if(this.copyproductAllocationsVirtual[rowIndex].productCategory){
            this.copyproductAllocationsVirtual[rowIndex].productCategory.forEach(e=>{
                if(e.GTMDetail==event.currentTarget.dataset.detail){
                    e.allocation = value;
                    this.updateStatus(event.currentTarget.dataset.accountid);
                }
            })
            this.copyproductAllocationsVirtual[rowIndex].productCategory.forEach(e=>{
                console.log('e.allocation ',e.allocation);
                let tempAllocation = isNaN(Number(e.allocation))?0:Number(e.allocation).toFixed(2);
                remainigPercentage = Number(Number(remainigPercentage).toFixed(2)) + Number(tempAllocation);
                console.log('TotalPercentage ',remainigPercentage);
            })
        
            if(remainigPercentage<0 || remainigPercentage>100){
                this.showToast(this.labels.Combined_Total_Value,this.labels.Combined_total_value_more_than_100_is_not_allowed,'error');
                remainigPercentage =0;
                value = '';
                this.copyproductAllocationsVirtual[rowIndex].productCategory.forEach(e=>{
                if(e.GTMDetail==event.currentTarget.dataset.detail){
                    e.allocation = null;
                    this.updateStatus(event.currentTarget.dataset.accountid);
                }
                })
            }
            this.productAllocations = JSON.parse(JSON.stringify(this.copyproductAllocationsVirtual));
            this.applyFiltersOnCustomer(this.filtersOnPage);
        }
        if(!value || (Number(value)<0 && Number(value)>=100)){// when inputs are Invalid
            this.template.querySelector('[data-detail="' + detailId + '"]').value = '';
            value = null;
            this.updateGTMDetail(detailId,value);
            this.updateStatus(accid);
            this.onChangeLabelOption(value,accid,detailId);
            this.updateStatusLabel();
        }
        if(Number(value)>=0 && Number(value)<=100){// when inputs are valid
        if(accid && value){
            this.updateGTMDetail(detailId,value);
            this.updateStatus(accid);
            this.onChangeLabelOption(value,accid,detailId);
            setTimeout(() => {
                this.updateStatusLabel();
            }, 200);
        }
       
    }
    console.log('actual obj',this.productAllocations);
    }

    onChangeLabelOption(value,accid,detailId){
        this.productAllocations.forEach(ele=>{
            if(ele.customerId==accid){
                let percent = 100;
                let tempValue = value;
                let tempAllocation = 0;
                ele.productCategory.forEach(e=>{
                    tempAllocation = isNaN(e.allocation)?0:Number(Number(e.allocation).toFixed(2));
                    if(e.GTMDetail!=detailId){
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
                console.log('actual obj percentage ',percent);
            }
        });
        this.copyproductAllocationsVirtual = JSON.parse(JSON.stringify(this.productAllocations));
    }
    
    updateGTMDetail(tempGtmId,tempValue){
        updateGTMDetail({gtmId:tempGtmId,value:tempValue}).then(value=>{
        }).catch(err=>console.log('Error while updating GTMDetails ',gtmId,' ',err))
    }

    getTableData(data){
        let year = this.fiscalYear.replace('-20','/');
        this.columnfiscalYear = `${this.labels.All_Companies_Purchase_to_Customer1} ${this.labels.All_Companies_Purchase_to_Customer2} ${year}`;
        if(data[0]){
        this.columns = data[0].productCategory;
        }
    }

    mapCustomerCategory(productAllocation,customerid){
        let masterObj = {};
        let arr = [];
        let percentage = 100 
        productAllocation.forEach(ele=>{
            let tempAllocation = 0;
            if(ele.GTM_Customer__c == customerid){
                tempAllocation = isNaN(ele.Product_Category_Allocation__c)?0:Number(Number(ele.Product_Category_Allocation__c).toFixed(2));
            percentage = Number(Number(percentage).toFixed(2)) -Number(Number(tempAllocation).toFixed(2));
            let percentageLabel = '';
            if(percentage==0){
                percentageLabel = 'Completed';
            }else if(percentage>0 && percentage<100){
                percentageLabel = 'In Progress';
            }else if(percentage==100){
                percentageLabel = 'Not Fill';
            }
            let tempCompaniesPY = Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c)?Number(ele.GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c).toLocaleString(this.countryLocale):'';

            let helptext = ele.Product_Category__r.Help_Text__c?ele.Product_Category__r.Help_Text__c:'';
            let obj = {'pId':ele.Product_Category__r.Id,'pName':ele.Product_Category__r.Name,'GTMDetail':ele.Id,'allocation':ele.Product_Category_Allocation__c,isSubmitted__c:ele.isSubmitted__c,helpText:helptext};
            arr.push(obj)
            masterObj = {customerId:ele.GTM_Customer__c,customerName:ele.GTM_Customer__r.Name,totalCompaniesPurches:tempCompaniesPY, productCategory:arr,'isLeadCustomer':ele.GTM_Customer__r.RecordTypeId==this.leadRecordTypeId ?true:false,percentage:percentageLabel,percentageValue:percentage,pathFinder:ele.GTM_Customer__r.Path_Finder__c};
            }
        })
        let other = masterObj.productCategory.filter(ele=>String(ele.pName).toLowerCase().includes('other'));
            let othersIndex = masterObj.productCategory.findIndex(ele=>String(ele.pName).toLowerCase().includes('other'));
            // console.log('other ',other,'index ',othersIndex);
            if(othersIndex!=-1 && other.length>0){
                masterObj.productCategory.splice(othersIndex,1);
                masterObj.productCategory.push(other[0]);
                masterObj.productCategory = masterObj.productCategory;
            }
        return masterObj;
    }

    handlePaginationAction(event){
        this.paginatedProductCategoryAllocation = event.detail.values;

        let copyProductAllocations = this.productAllocations;
        this.getTableData(copyProductAllocations);
            setTimeout(() => {
                this.paginatedProductCategoryAllocation.forEach(ele=>{
                    this.updateStatus(ele.customerId);
                })
            }, 200);
        this.updateStatusLabel();
        this.hasRendered = false;
    }
   
    handleFilterPanelAction(event){
        console.log('inside handleFilterPanelAction >>>>');
        this.filtersOnPage = JSON.parse(JSON.stringify(event.detail));
        let filtersValue = JSON.parse(JSON.stringify(event.detail));
        this.applyFiltersOnCustomer(filtersValue);
        console.log('exiting handleFilterPanelAction >>>>');
    }
//searchStr,isLead,percentage
    applyFiltersOnCustomer(filtersValue){
        console.log('inside applyFiltersOnCustomer>>>>>');
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
        console.log('Before getCalculatedPercentage function');
        this.getCalculatedPercentage();
        console.log('After getCalculatedPercentage function');
        this.productAllocations = [];
        this.paginatedProductCategoryAllocation =[];
        console.log('this.copyproductAllocationsVirtual>>>>>>>' +JSON.parse(JSON.stringify(this.copyproductAllocationsVirtual)));
        this.productAllocations = this.copyproductAllocationsVirtual.filter(ele=>{
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
                console.log('searchValue>>>>>>>>>'+searchValue);
                console.log('custName>>>>>>>>>'+custName);
                console.log('custName.includes(searchValue)>>>>>>>>>'+custName.includes(searchValue));
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
        this.copyproductAllocationsVirtual.forEach(ele=>{
            this.updateStatus(ele.customerId);
        })
    //    console.log('search ', this.productAllocations.length);
       this.paginatedProductCategoryAllocation = JSON.parse(JSON.stringify(this.productAllocations));
        }
        console.log('productAllocations >>>>'+this.productAllocations);
        console.log('paginatedProductCategoryAllocation >>>>'+this.paginatedProductCategoryAllocation);
        console.log('exiting applyFiltersOnCustomer >>>>'+this.productAllocations);
    }

    getCalculatedPercentage(){
        this.copyproductAllocationsVirtual.forEach((ele)=>{
            let percentage = 100;
            let tempAllocation = 0; 
            ele.productCategory.forEach(e=>{
                tempAllocation = isNaN(e.allocation)?0:Number(Number(e.allocation).toFixed(2));
                percentage = Number(Number(percentage).toFixed(2)) - Number(Number(tempAllocation).toFixed(2)); 
                console.log('cal percenatge ',percentage);
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
                // console.log('percentage label ',ele.percentage);
            }, 50);
        })
    }

    updateStatus(customerId){
        let inputCompleted = 100;
        setTimeout(() => {
        this.template.querySelectorAll('[data-accountid="' + customerId + '"]').forEach(col=>{
            //console.log('classes ',col.classList.value);
            if(col.classList.value.includes('inputDetails')){
                if(col.value){
                    inputCompleted = Number(Number(inputCompleted).toFixed(2)) - Number(Number(col.value).toFixed(2));
                }
            }
            if(col.classList.value.includes('percentage')){
                // console.log('percentage ',col);
                col.firstChild.data = `${Number(Number(inputCompleted).toFixed(2)).toLocaleString(this.countryLocale)} %`;
            }
            if(col.classList.value.includes('distribution')){
                col.style.backgroundColor = 'green';
                col.style.color = '#fff';
                col.firstChild.data = this.labels.Distribution_completed;
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
        console.log('status labels options ',this.productAllocations);
        this.productAllocations.forEach(ele=>{
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

    handleSort(event){
        let fieldName = event.target.name;
        this.sortDirection = !this.sortDirection;
        this.sortData(fieldName,this.sortDirection);
    }

    sortData(fieldname, direction) {
        direction = direction==true?'asc':'des';
        let parseData = JSON.parse(JSON.stringify(this.copyproductAllocationsVirtual));
        if(parseData.length>1){
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
           parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.productAllocations = parseData;
        }
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
        console.log('monthName'+monthName);
        let currentYear = d.getFullYear();
        let year = (monthName=='Jan' || monthName=='Feb' || monthName=='Mar')?this.fiscalYear.split('-')[1]:this.fiscalYear.split('-')[0];
        console.log(this.fiscalYear.split('-')[1]);
        console.log('fiscal year'+this.fiscalYear);
        console.log(year);
        console.log(currentYear);
        if(currentYear!=year){
            this.disableAll = true; 
        }else{
            console.log('----------********move to else***********');
            isWindowPeriodClosed().then(isDisable=>{
                console.log('isDisable'+isDisable);
                this.disableAll = isDisable
            })
        }
    }
}