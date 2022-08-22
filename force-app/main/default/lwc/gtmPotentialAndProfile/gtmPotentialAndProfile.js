import { LightningElement, track, wire, api } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import LeadCustomerType from '@salesforce/schema/Account.Lead_Customer_Type__c';
import getPotentialAndProfile from '@salesforce/apex/GTMPathFinder.getPotentialAndProfile'
import isWindowPeriodClosed from '@salesforce/apex/GTMPathFinderHelper.isWindowPeriodClosed';
import updateGTMDetailPotentialProfile from '@salesforce/apex/GTMPathFinder.updateGTMDetailPotentialProfile';
import getFiscalYear from '@salesforce/apex/GTMPathFinder.getFiscalYear';
import getInstructions from '@salesforce/apex/GTMPathFinderHelper.getInstructions';
import updateClassificationDependent from '@salesforce/apex/GTMPathFinder.updateClassificationDependent';
import getUser from '@salesforce/apex/GTMPathFinder.getUser';
import Instructions from '@salesforce/label/c.Instructions';
import Customer_Lead_Customer from '@salesforce/label/c.Customer_Lead_Customer';
import Customer_Type from '@salesforce/label/c.Customer_Type';
import Confirm_Customer_Type_Indicated_on_the_Left_Adjacent_Cell from '@salesforce/label/c.Confirm_Customer_Type_Indicated_on_the_Left_Adjacent_Cell';
import Total_Purcahse_of_Crop_Protection_Industry_Price from '@salesforce/label/c.Total_Purcahse_of_Crop_Protection_Industry_Price';
import Estimated_Number_Of_Sales_REP_on_Role from '@salesforce/label/c.Estimated_Number_Of_Sales_REP_on_Role';
import Number_of_Stories_That_the_Channel_has from '@salesforce/label/c.Number_of_Stories_That_the_Channel_has';
import Confirm_the_Estimated_Revenues_of_the_Customer_in from '@salesforce/label/c.Confirm_the_Estimated_Revenues_of_the_Customer_in';
import Estimated_Markup_of_Channel_In_of_Sales from '@salesforce/label/c.Estimated_Markup_of_Channel_In_of_Sales';
import USD_Million from '@salesforce/label/c.USD_Million';
import The_total_farm_gate_revenues_are_USD from '@salesforce/label/c.The_total_farm_gate_revenues_are_USD';
import Page from '@salesforce/label/c.Page';
import getLeadRecordTypeId from '@salesforce/apex/GTMPathFinder.getLeadRecordTypeId';
import getGTMDetailsToDisable from '@salesforce/apex/GTMPathFinderHelper.getGTMDetailsToDisable';
import getLowerHierarchyRecordsToDisable from '@salesforce/apex/GTMPathFinder.getLowerHierarchyRecordsToDisable';

export default class GtmPotentialAndProfile extends LightningElement {
    filterOnPage = '';
    hasRendered = false;
    instrustions = '';
    showLoading = false;
    countryLocale = 'es-AR'
    @track gtmPotentialProfile = [];
    gtmPotentialProfileVirtual = [];
    @track paginatedGtmPotentialProfile
    customerTypeOptions = [];
    optionsToDisable = ['Farmer', 'B2B'];
    sortDirection = true;
    disableAll = false;
    leadRecordTypeId = '';
    gtmDetailsToDisable = [];
    @track recordTypeId;
    @track panelStatus = {
        notFilled: '0',
        inProgress: '0',
        completed: '0'
    }
    @track currentPage = 1;
    defaultSelectedOption = '';
    fiscalYear = '';

    set gtmFiscalYear(value) {
        this.fiscalYear = value;
    }

    @api get gtmFiscalYear() {
        return this.fiscalYear;
    }

    @api getCountryValueFromParent;

    labels = {
        Instructions: Instructions,
        Customer_Lead_Customer: Customer_Lead_Customer,
        Customer_Type: Customer_Type,
        Confirm_Customer_Type_Indicated_on_the_Left_Adjacent_Cell1: Confirm_Customer_Type_Indicated_on_the_Left_Adjacent_Cell,
        Total_Purcahse_of_Crop_Protection_Industry_Price1: Total_Purcahse_of_Crop_Protection_Industry_Price,
        Estimated_Markup_of_Channel_In_of_Sales1: Estimated_Markup_of_Channel_In_of_Sales,
        Confirm_the_Estimated_Revenues_of_the_Customer_in1: Confirm_the_Estimated_Revenues_of_the_Customer_in,
        Estimated_Number_Of_Sales_REP_on_Role1: Estimated_Number_Of_Sales_REP_on_Role,
        Number_of_Stories_That_the_Channel_has1: Number_of_Stories_That_the_Channel_has,
        Page: Page,
        The_total_farm_gate_revenues_are_USD: The_total_farm_gate_revenues_are_USD,
        USD_Million: USD_Million
    }

    @wire(getInstructions) getInstrustion({ error, data }) {
        if (data) {
            this.instrustions = data.Instruction_Profile_Potential__c;
        }
    }

    // @wire(getLeadRecordTypeId) getLeadRecordType({err,data}){
    //     if(data){
    //         this.leadRecordTypeId = data;
    //         console.log('leadRecordTypeId ',this.leadRecordTypeId);
    //     }
    //     if(err){
    //         console.log('Error while getting Lead Record Type ',err);
    //     }
    // }

    

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    wiredObjectInfo({ error, data }) {
        if (error) {
            // handle Error
        } else if (data) {
            console.log('Account data ', data);
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Lead Customer');
        }
    };
    @wire(getPicklistValues, {
        recordTypeId: "$recordTypeId",
        fieldApiName: LeadCustomerType
    })
    customerTypePicklistValues({ error, data }) {
        console.log('customerTypeOptions ', data);
        if (data) {
            console.log('picklist Values', data.values);
            let obj = { attributes: null, label: 'Customer Type is Already Correct', validFor: Array(0), value: '' }
            this.customerTypeOptions = [...data.values, obj];
        }
    }

    @api onTabRefresh() {

        setTimeout(() => {
            this.connectedCallback();
        }, 500);
    }

    renderedCallback() {
        if (!this.hasRendered && this.gtmPotentialProfileVirtual.length > 0) {
            setTimeout(() => {
                this.gtmPotentialProfileVirtual.forEach(row => {
                    if (row.isSubmitted__c) {
                        this.template.querySelectorAll('[data-id="' + row.id + '"]').forEach(cell => {
                            cell.disabled = true;
                        })
                    }
                });
                this.gtmDetailsToDisable.forEach(row => {
                    // console.log('row ',row);
                    this.template.querySelectorAll('[data-id="' + row.Id + '"]').forEach(cell => {
                        cell.disabled = true;
                    })
                })
                this.hasRendered = true;
            }, 500);
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

    connectedCallback() {
        console.log('hi divya >>>>>>>>>>' +this.getCountryValueFromParent);
        console.log('GTM fiscal year', this.fiscalYear);
        this.showLoading = true;
        getLeadRecordTypeId().then(leadRecordType=>{
            this.leadRecordTypeId = leadRecordType;
        getPotentialAndProfile({ year: this.fiscalYear, selectedCountry: this.getCountryValueFromParent }).then(data => {
            console.log('Data ', data);
            let tempData = [];
            if (data) {
                data.forEach(ele => {
                    
                    let calculation = String(ele.Total_Purchase_of_Crop_Protection_PY__c) && String(ele.Estimated_Markup_of_Channel__c) ? ((Number(ele.Total_Purchase_of_Crop_Protection_PY__c) * Number(ele.Estimated_Markup_of_Channel__c)) / 100) + ele.Total_Purchase_of_Crop_Protection_PY__c : 0;
                    let tempValue = calculation ? calculation : 0;
                    let obj = {
                        id: ele.Id,
                        client: ele.GTM_Customer__r.Name,
                        clientId: ele.GTM_Customer__c,
                        customerType: ele.GTM_Customer__r.Lead_Customer_Type__c,
                        confirmCustomerType: ele.GTM_Customer_Type__c ? String(ele.GTM_Customer_Type__c) : '',
                        totalPurcahseCrop: ele.Total_Purchase_of_Crop_Protection_PY__c,
                        estimateChannel: ele.Estimated_Markup_of_Channel__c,
                        confirmEstimateRevenues: '',
                        estimateSalesRepRole: ele.Estimated_Number_of_Sales_Rep_on_Role__c,
                        storiesChannelHas: ele.Number_of_Stores_That_the_Channel_Has__c,
                        status: '',
                        numberOfFieldsFilled: '',
                        isLeadCustomer: ele.GTM_Customer__r.RecordTypeId==this.leadRecordTypeId ? true : false,
                        confirmEstimatedRevenue: `${this.labels.The_total_farm_gate_revenues_are_USD}  ${Number(tempValue).toLocaleString(this.countryLocale)} ${this.labels.USD_Million}	
                        `,
                        pathFinder: ele.GTM_Customer__r.Path_Finder__c,
                        disableFields: this.optionsToDisable.includes(ele.GTM_Customer_Type__c) || (this.optionsToDisable.includes(ele.confirmCustomerType)),
                        isSubmitted__c: ele.isSubmitted__c
                    }
                    tempData.push(obj);
                });
                setTimeout(() => {
                    console.log('tempData ',tempData);
                    this.gtmPotentialProfile = tempData;
                    this.gtmPotentialProfileVirtual = tempData;
                    this.paginatedGtmPotentialProfile = this.gtmPotentialProfile;
                    this.gtmPotentialProfile.forEach(ele => {
                        ele.disableFields = this.optionsToDisable.includes(ele.customerType) || (this.optionsToDisable.includes(ele.confirmCustomerType));
                        this.handleChangeStatusOnLoad(ele.id);
                        this.updateStatusLabel();
                    })
                    this.showLoading = false;
                }, 200);
            }
        });
    });
        if (!this.fiscalYear) {
            getFiscalYear().then(fiscalyear => {
                this.fiscalYear = fiscalyear.replace('-20', '/');
            });
        }
        getGTMDetailsToDisable({recordTypeName:'Profile & Potential'}).then(gtmDetailsToDisable=>{
            this.gtmDetailsToDisable = JSON.parse(JSON.stringify(gtmDetailsToDisable));
            getLowerHierarchyRecordsToDisable({fiscalyear:this.fiscalYear,recordTypeName:'Profile & Potential'}).then(gtmDetailsOfLowerUser=>{
                this.gtmDetailsToDisable.push(...JSON.parse(JSON.stringify(gtmDetailsOfLowerUser)));
            })
            console.log('gtmDetailsToDisable ',gtmDetailsToDisable);
        }).catch(err=>console.log('gtmDetailsToDisable ',err));
        this.checkDataYear();
    }

    countDecimals(value) {// TODO:
        if(Math.floor(value) === value) return 0;
        return value.toString().split(".")[1].length || 0; 
    }
    handleChangeInput(event) {

        let fieldName = event.target.dataset.name;
        let value = event.target.value;
        let detailId = event.target.dataset.id;
        // condition removed on 1-31-2020 --> && fieldName != 'Estimated_Markup_of_Channel__c'
        if (value == '' || (Number(value) < 0)) {
            value = null;
        }
        if((fieldName == 'Estimated_Markup_of_Channel__c' && Number(value) > 100)){
            value = null;
        }
        if ((fieldName == 'Estimated_Number_of_Sales_Rep_on_Role__c' || fieldName == 'Number_of_Stores_That_the_Channel_Has__c') && !Number.isInteger(Number(value))) {
            value = null;
        }
        updateGTMDetailPotentialProfile({ gtmId: detailId, name: fieldName, value: value }).then(res => {
            console.log('Response ', res);
        }).catch(err => console.log('Null Value' + err));

        let objIndex = this.gtmPotentialProfileVirtual.findIndex(obj => obj.id == detailId);

        if (fieldName == 'GTM_Customer_Type__c') {
            let comboboxValue = event.detail.value;
            if (comboboxValue) {
                // this.gtmPotentialProfile[objIndex].customerType = comboboxValue;
                this.gtmPotentialProfileVirtual[objIndex].disableFields = this.optionsToDisable.includes(value);
                this.gtmPotentialProfileVirtual[objIndex].confirmCustomerType = comboboxValue;
                if (this.optionsToDisable.includes(value)) {
                    this.gtmPotentialProfileVirtual[objIndex].estimateChannel = null;
                    this.gtmPotentialProfileVirtual[objIndex].estimateSalesRepRole = null;
                    this.gtmPotentialProfileVirtual[objIndex].storiesChannelHas = null;
                }
                this.gtmPotentialProfileVirtual[objIndex].confirmCustomerType = comboboxValue;

                let calculation = (value && this.gtmPotentialProfileVirtual[objIndex].estimateChannel) ? ((Number(value) * Number(this.gtmPotentialProfileVirtual[objIndex].estimateChannel)) / 100) + Number(value) : 0;
                this.gtmPotentialProfileVirtual[objIndex].confirmEstimatedRevenue = `${this.labels.The_total_farm_gate_revenues_are_USD} ${Number(Number(calculation).toFixed(2)).toLocaleString(this.countryLocale)} ${this.labels.USD_Million}`
                updateClassificationDependent({ detailId: detailId }).then(data => console.log(data)).catch(err => console.log(err));
            } else {
                this.gtmPotentialProfileVirtual[objIndex].disableFields = this.optionsToDisable.includes(this.gtmPotentialProfileVirtual[objIndex].customerType);
                if (this.optionsToDisable.includes(this.gtmPotentialProfileVirtual[objIndex].customerType)) {
                    this.gtmPotentialProfileVirtual[objIndex].estimateChannel = null;
                    this.gtmPotentialProfileVirtual[objIndex].estimateSalesRepRole = null;
                    this.gtmPotentialProfileVirtual[objIndex].storiesChannelHas = null;
                }
                this.gtmPotentialProfileVirtual[objIndex].confirmCustomerType = comboboxValue;
            }
        } else if (fieldName == 'Total_Purchase_of_Crop_Protection_PY__c') {
            this.gtmPotentialProfileVirtual[objIndex].totalPurcahseCrop = value;
            let calculation = (value && this.gtmPotentialProfileVirtual[objIndex].estimateChannel) ? ((Number(value) * Number(this.gtmPotentialProfileVirtual[objIndex].estimateChannel)) / 100) + Number(value) : 0;
            this.gtmPotentialProfileVirtual[objIndex].confirmEstimatedRevenue = `${this.labels.The_total_farm_gate_revenues_are_USD} ${Number(Number(calculation).toFixed(2)).toLocaleString(this.countryLocale)} ${this.labels.USD_Million}	
            `
        } else if (fieldName == 'Estimated_Markup_of_Channel__c') {
            this.gtmPotentialProfileVirtual[objIndex].estimateChannel = value;
            let calculation = (value && this.gtmPotentialProfileVirtual[objIndex].totalPurcahseCrop) ? ((Number(value) * Number(this.gtmPotentialProfileVirtual[objIndex].totalPurcahseCrop)) / 100) + Number(this.gtmPotentialProfileVirtual[objIndex].totalPurcahseCrop) : 0;

            this.gtmPotentialProfileVirtual[objIndex].confirmEstimatedRevenue = `${this.labels.The_total_farm_gate_revenues_are_USD} ${Number(Number(calculation).toFixed(2)).toLocaleString(this.countryLocale)} ${this.labels.USD_Million}`;
        } else if (fieldName == 'Estimated_Number_of_Sales_Rep_on_Role__c') {
            this.gtmPotentialProfileVirtual[objIndex].estimateSalesRepRole = value;
        } else if (fieldName == 'Number_of_Stores_That_the_Channel_Has__c') {
            if (Number.isInteger(Number(value))) {
                this.gtmPotentialProfileVirtual[objIndex].storiesChannelHas = value;
            } else {
                this.gtmPotentialProfileVirtual[objIndex].storiesChannelHas = null;
            }
        }

        setTimeout(() => {
            let tempData = JSON.parse(JSON.stringify(this.gtmPotentialProfileVirtual));
            this.gtmPotentialProfile = tempData;
            // this.gtmPotentialProfileVirtual = tempData; // line Added on 26-1-2022
            this.paginatedGtmPotentialProfile = this.gtmPotentialProfile;
            this.handleChangeStatusOnLoad(detailId);
            this.updateStatusLabel();
            this.applyFiltersOnCustomer(this.filterOnPage);
        }, 200);
        
    }


    updateStatusLabel() {
        let completeField = 0;
        let inProgressField = 0;
        let NotFilled = 0;
        this.gtmPotentialProfile.forEach(ele => {
            if (ele.status == "Completed") {
                completeField++;
            }
            if (ele.status == "INProgress") {
                inProgressField++;
            }
            if (ele.status == "NotFilled") {
                NotFilled++;
            }
        });
        this.panelStatus = {
            notFilled: NotFilled,
            inProgress: inProgressField,
            completed: completeField
        }
    }

    handleChangeStatusOnLoad(detailId) {
        let tempPotentialProfile = JSON.parse(JSON.stringify(this.gtmPotentialProfile));
        let index = tempPotentialProfile.findIndex(ele1 => ele1.id == detailId);
        let ele = this.gtmPotentialProfile[index];
        if (ele) {
            let NumberOfFilled = 0;
            if (ele.confirmCustomerType) {
                if (this.optionsToDisable.includes(ele.confirmCustomerType)) {
                    NumberOfFilled = NumberOfFilled + 4;
                } else {
                    NumberOfFilled++;
                }
            } else if (this.optionsToDisable.includes(ele.customerType)) {
                NumberOfFilled = NumberOfFilled + 4;
            } else if (ele.customerType) {
                NumberOfFilled++;
            }

            if (ele.totalPurcahseCrop && Number(ele.totalPurcahseCrop) != 0) {
                NumberOfFilled++;
            }
            if (ele.estimateChannel && Number(ele.estimateChannel) != 0) {
                NumberOfFilled++;
            }
            if (ele.estimateSalesRepRole && Number(ele.estimateSalesRepRole) != 0) {
                NumberOfFilled++;
            }
            if (ele.storiesChannelHas && Number(ele.storiesChannelHas) != 0) {
                NumberOfFilled++;
            }
            ele.numberOfFieldsFilled = NumberOfFilled;
            if (NumberOfFilled == 5) {
                ele.status = 'Completed';
            }
            if (NumberOfFilled < 5 && NumberOfFilled > 0) {
                ele.status = 'INProgress';
            }
            if (NumberOfFilled == 0) {
                ele.status = 'NotFilled';
            }
        }
    }

    handleChangeCustomerTypeOptions(event) {
        let filedName = event.target.dataset.name;
        let id = event.target.dataset.id;
        let value = event.target.value;
        this.gtmPotentialProfile.forEach(e => {
            if (e.id == id) {
                e.confirmCustomerType = value;
                e.disableFields = this.optionsToDisable.includes(value);
            }
        })
        setTimeout(() => {
            this.paginatedGtmPotentialProfile = this.gtmPotentialProfile;
        }, 200);
        console.log(event.target.value);
        updateGTMDetailPotentialProfile({ gtmId: id, name: filedName, value: value }).then(res => {
            console.log('Response ', res);
        })
    }

    handleFiltersAction(event) {
        console.log('filter action ', event.detail);
        this.filterOnPage = JSON.parse(JSON.stringify(event.detail)); 
        let filterValues = JSON.parse(JSON.stringify(event.detail));
        this.applyFiltersOnCustomer(filterValues);
    }

    applyFiltersOnCustomer(filtersValue) {
        if(filtersValue){
        this.template.querySelector('c-pagination-cmp').pagevalue = 1;
        console.log('filtersValue -------------->', filtersValue);
        let mapStatus = new Map([
            ["Not Fill", 'NotFilled'],
            ["In Progress", 'INProgress'],
            ["Completed", 'Completed']
        ]);
        let search = filtersValue.search.length != 0;
        let filter1 = filtersValue.filter1.length != 0 && filtersValue.filter1 != 'Both';
        let filter2 = filtersValue.filter2.length != 0 && filtersValue.filter2 != 'None';
        let filter3 = filtersValue.filter3.length != 0 && filtersValue.filter3 != 'Both';

        let searchValue = String(filtersValue.search).toLocaleLowerCase();
        let filter1Value = filtersValue.filter1;
        let filter2Value = filtersValue.filter2;
        let filter3Value = filtersValue.filter3;

        filter1Value = filter1Value == 'Lead Customer' ? true : false;

        this.gtmPotentialProfile = [];
        this.paginatedGtmPotentialProfile = [];

        this.gtmPotentialProfile = this.gtmPotentialProfileVirtual.filter(ele => {
            let custName = String(ele.client).toLowerCase();
            if (search && filter1 && filter2 && filter3) {
                return custName.includes(searchValue) && String(ele.isLeadCustomer) == String(filter1Value) && ele.status == mapStatus.get(filter2Value) && String(ele.pathFinder) == String(filter3Value);
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
                return String(ele.isLeadCustomer) == String(filter1Value) && ele.status == mapStatus.get(filter2Value);
            }
            else if (!search && filter1 && !filter2 && filter3) {
                return ele.isLeadCustomer == filter1Value && String(ele.pathFinder) == String(filter3Value);
            }
            else if (!search && filter1 && !filter2 && !filter3) {
                console.log(`isLeadCustomer ${ele.isLeadCustomer} filter1 ${filter1Value} ${String(ele.isLeadCustomer) == String(filter1Value)}`)
                return String(ele.isLeadCustomer) == String(filter1Value);
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
        this.gtmPotentialProfileVirtual.forEach(ele => {
            this.handleChangeStatusOnLoad(ele.id);
        })
        this.paginatedGtmPotentialProfile = JSON.parse(JSON.stringify(this.gtmPotentialProfile));
        setTimeout(() => {
            this.updateStatusLabel();
        }, 200);
    }
    }

    handlePaginationAction(event) {
        // this.gtmPotentialProfile = JSON.parse(JSON.stringify(this.gtmPotentialProfile));
        setTimeout(() => {
            console.log('curret Page ', event.detail.currentPage);
            this.paginatedGtmPotentialProfile = event.detail.values;
            this.hasRendered = false;
        }, 200);
    }

    handleSort(event) {
        let fieldName = event.target.name;
        this.sortDirection = !this.sortDirection;
        this.sortData(fieldName, this.sortDirection);
    }

    sortData(fieldname, direction) {
        direction = direction == true ? 'asc' : 'des';
        console.log('Field Name ', fieldname, ' direction ', direction);
        let parseData = JSON.parse(JSON.stringify(this.gtmPotentialProfileVirtual));
        if (parseData.length > 1) {
            let keyValue = (a) => {
                return a[fieldname];
            };
            let isReverse = direction === 'asc' ? 1 : -1;
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : '';
                y = keyValue(y) ? keyValue(y) : '';
                return isReverse * ((x > y) - (y > x));
            });
            this.gtmPotentialProfile = parseData;
            this.gtmPotentialProfileVirtual = parseData;
        }
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