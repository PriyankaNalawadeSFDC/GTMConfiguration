import { LightningElement, track, api, wire } from 'lwc';
import getGTMCompetition from '@salesforce/apex/GTMCompetition.getGTMCompetition';
import updateGTMDetails from '@salesforce/apex/GTMPathFinderHelper.updateGTMDetails';
import getCompetitorDetails from '@salesforce/apex/GTMPathFinderHelper.getCompetitorDetails';
import getInstructions1 from '@salesforce/apex/GTMPathFinderHelper.getInstructions';
import Customer_Lead_Customer from '@salesforce/label/c.Customer_Lead_Customer';
import Write_UPL_POSITION from '@salesforce/label/c.Write_UPL_POSITION';
import UPL_s_Share_of_Wallet from '@salesforce/label/c.UPL_s_Share_of_Wallet';
import Write_the_name_of_the_1_Company from '@salesforce/label/c.Write_the_name_of_the_1_Company';
import Indicate_the_Share_of_Wallet_of_the_1_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_1_Company';
import Write_the_name_of_the_2_Company from '@salesforce/label/c.Write_the_name_of_the_2_Company';
import Indicate_the_Share_of_Wallet_of_the_2_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_2_Company';
import Write_the_name_of_the_3_Company from '@salesforce/label/c.Write_the_name_of_the_3_Company';
import Indicate_the_Share_of_Wallet_of_the_3_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_3_Company';
import Write_the_name_of_the_4_Company from '@salesforce/label/c.Write_the_name_of_the_4_Company';
import Indicate_the_Share_of_Wallet_of_the_4_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_4_Company';
import Write_the_name_of_the_5_Company from '@salesforce/label/c.Write_the_name_of_the_5_Company';
import Indicate_the_Share_of_Wallet_of_the_5_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_5_Company';
import Write_the_name_of_the_6_Company from '@salesforce/label/c.Write_the_name_of_the_6_Company';
import Indicate_the_Share_of_Wallet_of_the_6_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_6_Company';
import Write_the_name_of_the_7_Company from '@salesforce/label/c.Write_the_name_of_the_7_Company';
import Indicate_the_Share_of_Wallet_of_the_7_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_7_Company';
import Write_the_name_of_the_8_Company from '@salesforce/label/c.Write_the_name_of_the_8_Company';
import Indicate_the_Share_of_Wallet_of_the_8_Company from '@salesforce/label/c.Indicate_the_Share_of_Wallet_of_the_8_Company';
import Remaining from '@salesforce/label/c.Remaining';
import Check_If_Distribution_Is_Correct from '@salesforce/label/c.Check_If_Distribution_Is_Correct';
import Distribution_completed from '@salesforce/label/c.Distribution_completed';
import Please_check_the_values_Not_matching_100 from '@salesforce/label/c.Please_check_the_values_Not_matching_100';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateshare from '@salesforce/apex/GTMCompetition.updateshare';
import Share_wallet_already_reached_100 from '@salesforce/label/c.Share_wallet_already_reached_100';
import isWindowPeriodClosed from '@salesforce/apex/GTMPathFinderHelper.isWindowPeriodClosed';
import getUser from '@salesforce/apex/GTMPathFinder.getUser';
import Combined_total_value_more_than_100_is_not_allowed from '@salesforce/label/c.Combined_total_value_more_than_100_is_not_allowed';
import Please_check_all_distribution from '@salesforce/label/c.Please_check_all_distribution';
import X1_to_8_values_for_UPL_is_not_allowed from '@salesforce/label/c.X1_to_8_values_for_UPL_is_not_allowed';
import getLeadRecordTypeId from '@salesforce/apex/GTMPathFinder.getLeadRecordTypeId';
import getGTMDetailsToDisable from '@salesforce/apex/GTMPathFinderHelper.getGTMDetailsToDisable';
import getLowerHierarchyRecordsToDisable from '@salesforce/apex/GTMPathFinder.getLowerHierarchyRecordsToDisable';

export default class GtmCompetition extends LightningElement {
    disableAll = false;
    @track gtmDetailsToDisable=[];
    showLoading = false;
    uplName = '';

    @track labels = {
        Customer_Lead_Customer: Customer_Lead_Customer,
        Write_UPL_POSITION: Write_UPL_POSITION,
        UPL_s_Share_of_Wallet1: UPL_s_Share_of_Wallet.split('<br/>')[0],
        UPL_s_Share_of_Wallet2: UPL_s_Share_of_Wallet.split('<br/>')[1],
        Remaining: Remaining,
        Check_If_Distribution_Is_Correct: Check_If_Distribution_Is_Correct,
        Distribution_completed: Distribution_completed,
        Please_check_the_values_Not_matching_100: Please_check_the_values_Not_matching_100,
        Share_wallet_already_reached_100: Share_wallet_already_reached_100,

        Write_the_name_of_the_1_Company: Write_the_name_of_the_1_Company,


        Indicate_the_Share_of_Wallet_of_the_1_Company1: Indicate_the_Share_of_Wallet_of_the_1_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_1_Company2: Indicate_the_Share_of_Wallet_of_the_1_Company.split('<br/>')[1],

       Write_the_name_of_the_2_Company: Write_the_name_of_the_2_Company,

       Indicate_the_Share_of_Wallet_of_the_2_Company1: Indicate_the_Share_of_Wallet_of_the_2_Company.split('<br/>')[0],
       Indicate_the_Share_of_Wallet_of_the_2_Company2: Indicate_the_Share_of_Wallet_of_the_2_Company.split('<br/>')[1],

        Write_the_name_of_the_3_Company: Write_the_name_of_the_3_Company,
        Indicate_the_Share_of_Wallet_of_the_3_Company1: Indicate_the_Share_of_Wallet_of_the_3_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_3_Company2: Indicate_the_Share_of_Wallet_of_the_3_Company.split('<br/>')[1],
        Write_the_name_of_the_4_Company: Write_the_name_of_the_4_Company,
        Indicate_the_Share_of_Wallet_of_the_4_Company1: Indicate_the_Share_of_Wallet_of_the_4_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_4_Company2: Indicate_the_Share_of_Wallet_of_the_4_Company.split('<br/>')[1],
        Write_the_name_of_the_5_Company: Write_the_name_of_the_5_Company,
        Indicate_the_Share_of_Wallet_of_the_5_Company1: Indicate_the_Share_of_Wallet_of_the_5_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_5_Company2: Indicate_the_Share_of_Wallet_of_the_5_Company.split('<br/>')[1],
        Write_the_name_of_the_6_Company: Write_the_name_of_the_6_Company,
        Indicate_the_Share_of_Wallet_of_the_6_Company1: Indicate_the_Share_of_Wallet_of_the_6_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_6_Company2: Indicate_the_Share_of_Wallet_of_the_6_Company.split('<br/>')[1],
        Write_the_name_of_the_7_Company: Write_the_name_of_the_7_Company,
        Indicate_the_Share_of_Wallet_of_the_7_Company1: Indicate_the_Share_of_Wallet_of_the_7_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_7_Company2: Indicate_the_Share_of_Wallet_of_the_7_Company.split('<br/>')[1],
        Write_the_name_of_the_8_Company: Write_the_name_of_the_8_Company,
        Indicate_the_Share_of_Wallet_of_the_8_Company1: Indicate_the_Share_of_Wallet_of_the_8_Company.split('<br/>')[0],
        Indicate_the_Share_of_Wallet_of_the_8_Company2: Indicate_the_Share_of_Wallet_of_the_8_Company.split('<br/>')[1],
        Combined_total_value_more_than_100_is_not_allowed:Combined_total_value_more_than_100_is_not_allowed,
        Please_check_all_distribution:Please_check_all_distribution,
        X1_to_8_values_for_UPL_is_not_allowed:X1_to_8_values_for_UPL_is_not_allowed,
    }
    gtmcompetitorVirtual = [];
    @track hasOptionsAdded = false;
    @track gtmcompetitor = [];
    @track gtmcompetitor1
    @track currentPage = 1;
    @track sortDirection = true;
    @track panelStatus = {
        notFilled: '0',
        inProgress: '0',
        completed: '0'
    }

    leadRecordTypeId = '';
    @api getCountryValueFromParent;
    

    gtmDetail = {
        Id:'',
        Competitor_Name_1__c:'',
        Indicate_share_wallet_of_competitor_1__c:'',
        Competitor_Name_2__c:'',
        Indicate_share_wallet_of_competitor_2__c:'',
        Competitor_Name_3__c:'',
        Indicate_share_wallet_of_competitor_3__c:'',
        Competitor_Name_4__c:'',
        Indicate_share_wallet_of_competitor_4__c:'',
        Competitor_Name_5__c:'',
        Indicate_share_wallet_of_competitor_5__c:'',
        Competitor_Name_6__c:'',
        Indicate_share_wallet_of_competitor_6__c:'',
        Competitor_Name_7__c:'',
        Indicate_share_wallet_of_competitor_7__c:'',
        Competitor_Name_8__c:'',
        Indicate_share_wallet_of_competitor_8__c:'',
        UPL_Position__c:'',
        UPLs_share_of_wallet__c:''
    }
    
    instrustions = '';
    hasRendered = false;
    @api recordId;
    fiscalYear = '';
    set gtmFiscalYear(value) {
        this.fiscalYear = value;
    }
    @api get gtmFiscalYear() {
        return this.fiscalYear;
    }
    @wire(getInstructions1) getInstruction({ error, data }) {
        if (data) {
            this.instrustions = data.Instruction_Competitor__c;
            this.uplName = data.UPL_Competitor__c;
            console.log('this.instrustions UPL Name' , this.uplName);
        }
    }
    countryLocale = 'es-AR'
    constructor() {
        super();
        getInstructions1().then(data => {
            this.instrustions = data.Instruction_Competitor__c;
            this.uplName = data.UPL_Competitor__c;
            console.log('Constructor UPL Name' , this.uplName);
        })
        getUser().then(user => {
            console.log('Country user ', user);
            if (user) {
                if (user.Country == 'Argentina') {
                    this.countryLocale = 'es-AR';
                }
                if (user.Country == 'Mexico') {
                    this.countryLocale = 'es-MX';
                }
                if (user.Country == 'Italy') {
                    this.countryLocale = 'it-IT';
                }
            }
        }).catch(error => {
            console.log(error);
        })
    }
    
    value = 'new';
    statusOptions = [];
    

    @api onTabRefresh() {
        setTimeout(() => {
            this.hasOptionsAdded = true;
            this.connectedCallback();
        }, 500);
    }

    checkDataYear() {
        let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let d = new Date();
        let monthName = month[d.getMonth()];
        let currentYear = d.getFullYear();
        let year = (monthName == 'Jan' || monthName == 'Feb' || monthName == 'Mar') ? this.fiscalYear.split('-')[1] : this.fiscalYear.split('-')[0];
        if (currentYear != year) {
             this.disableAll = true;
        } else {
            isWindowPeriodClosed().then(isDisable => {
                this.disableAll = isDisable
            });
        }
    }

    renderedCallback() {
        if (!this.hasRendered && this.gtmcompetitor.length> 0) {
            let temp=JSON.parse(JSON.stringify(this.gtmcompetitor))
            console.log('length temp',temp.length);

            setTimeout(() => {
                temp.forEach(row => {
                    //console.log('submitted',row.isSubmitted__c);
                    if (row.isSubmitted__c) {
                        
                        this.template.querySelectorAll('[data-id="' + row.id + '"]').forEach(cell => {
                           // console.log('cell ', cell);
                            cell.disabled = true;
                        })
                    }
                })
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


    connectedCallback() {
        this.showLoading = true;
        getLeadRecordTypeId().then(leadRecordId=>{
            this.leadRecordTypeId = leadRecordId;
        Promise.all([getCompetitorDetails(), getGTMCompetition({ year: this.fiscalYear })]).then(result => {
            let data = [];
            if (!this.hasOptionsAdded) {
                let objNone = { label: 'None', value: "none" };
                this.statusOptions.push(objNone);
            }

            if (result.length == 2) {
                console.log('New Comp data',result[0]);
                result[0] = this.sortCompetitor('competitiorname', 'asc', result[0])
                result[0].forEach(element => {
                    // console.log('element', element);
                    let obj = { label: element.competitiorname, value: element.competitiorId };
                    if (!this.hasOptionsAdded) {
                        this.statusOptions.push(obj);
                    }
                });
                data = result[1];
            }
            let tempData = [];
            if (data) {
                data.forEach(ele => {
                    let obj = {
                        id: ele.Id,
                        customer: ele.GTM_Customer__r.Name,
                        customerId: ele.GTM_Customer__c,
                        Competitor1: ele.Competitor_Name_1__c ? ele.Competitor_Name_1__c : '',
                        Competitor1Name: ele.Competitor_Name_1__r ? ele.Competitor_Name_1__r.Name : '',
                        Indicate1: ele.Indicate_share_wallet_of_competitor_1__c,
                        Competitor2: ele.Competitor_Name_2__c ? ele.Competitor_Name_2__c : '',
                        Competitor2Name: ele.Competitor_Name_2__r ? ele.Competitor_Name_2__r.Name : '',
                        Indicate2: ele.Indicate_share_wallet_of_competitor_2__c,
                        Competitor3: ele.Competitor_Name_3__c ? ele.Competitor_Name_3__c : '',
                        Competitor3Name: ele.Competitor_Name_3__r ? ele.Competitor_Name_3__r.Name : '',
                        Indicate3: ele.Indicate_share_wallet_of_competitor_3__c,
                        Competitor4: ele.Competitor_Name_4__c ? ele.Competitor_Name_4__c : '',
                        Competitor4Name: ele.Competitor_Name_4__r ? ele.Competitor_Name_4__r.Name : '',
                        Indicate4: ele.Indicate_share_wallet_of_competitor_4__c,
                        Competitor5: ele.Competitor_Name_5__c ? ele.Competitor_Name_5__c : '',
                        Competitor5Name: ele.Competitor_Name_5__r ? ele.Competitor_Name_5__r.Name : '',
                        Indicate5: ele.Indicate_share_wallet_of_competitor_5__c,
                        Competitor6: ele.Competitor_Name_6__c ? ele.Competitor_Name_6__c : '',
                        Competitor6Name: ele.Competitor_Name_6__r ? ele.Competitor_Name_6__r.Name : '',
                        Indicate6: ele.Indicate_share_wallet_of_competitor_6__c,
                        Competitor7: ele.Competitor_Name_7__c ? ele.Competitor_Name_7__c : '',
                        Competitor7Name: ele.Competitor_Name_7__r ? ele.Competitor_Name_7__r.Name : '',
                        Indicate7: ele.Indicate_share_wallet_of_competitor_7__c,
                        Competitor8: ele.Competitor_Name_8__c ? ele.Competitor_Name_8__c : '',
                        Competitor8Name: ele.Competitor_Name_8__r ? ele.Competitor_Name_8__r.Name : '',
                        Indicate8: ele.Indicate_share_wallet_of_competitor_8__c ? ele.Indicate_share_wallet_of_competitor_8__c : '',
                        uplposition: ele.UPL_Position__c ? ele.UPL_Position__c : '',
                        uplshare: ele.UPLs_share_of_wallet__c ? ele.UPLs_share_of_wallet__c : '',
                        status: '',
                        numberOfFieldsFilled: '',
                        isSubmitted__c: ele.isSubmitted__c,
                        isLeadCustomer: ele.GTM_Customer__r.RecordTypeId== this.leadRecordTypeId ? true : false,

                        pathFinder: ele.GTM_Customer__r.Path_Finder__c,
                        options: this.statusOptions,
                        remainingOptions1: [],
                        remainingOptions2: [],
                        remainingOptions3: [],
                        remainingOptions4: [],
                        remainingOptions5: [],
                        remainingOptions6: [],
                        remainingOptions7: [],
                        remainingOptions8: [],
                        remainingPercentage: 100,
                        isDistributionCompleted: false,
                        isUPLSelected: false,

                        validateIndicator1:false,
                        validateIndicator2:false,
                        validateIndicator3:false,
                        validateIndicator4:false,
                        validateIndicator5:false,
                        validateIndicator6:false,
                        validateIndicator7:false,
                        validateIndicator8:false,
                        validateIndicator9:false,

                    }
                    

                    tempData.push(obj);

                });
                console.log('update all records picklist value for each competitor');
                tempData.forEach(obj => {
                    this.updatePicklistOptions(obj,'');
                })
                setTimeout(() => {
                    this.gtmcompetitor = tempData;
                    this.gtmcompetitorVirtual = tempData;
                    this.gtmcompetitor1 = this.gtmcompetitor;
                    this.updateStatusLabel();
                    this.showLoading = false;
                }, 200);
                console.log('Competitior  data ', this.gtmcompetitor);
                console.log('Competitior1  data ', this.gtmcompetitor1);
                
            }
        })
    })
    getGTMDetailsToDisable({recordTypeName:'Competitor'}).then(gtmDetailsToDisable=>{
        this.gtmDetailsToDisable = JSON.parse(JSON.stringify(gtmDetailsToDisable));

        getLowerHierarchyRecordsToDisable({fiscalyear:this.fiscalYear,recordTypeName:'Competitor'}).then(gtmDetailsOfLowerUser=>{
            this.gtmDetailsToDisable.push(...JSON.parse(JSON.stringify(gtmDetailsOfLowerUser)));
        })
       
        console.log('gtmDetailsToDisable ',gtmDetailsToDisable);
    }).catch(err=>console.log('gtmDetailsToDisable ',err));
        this.checkDataYear();
    }


    handleInputChange(event) {
        
        let value = event.target.value;
        let id = event.currentTarget.dataset.id;
        let name = event.currentTarget.dataset.name;
        let accountId = event.currentTarget.dataset.account;
       
        console.log('picklist value ', event.detail.value);
        console.log('target value', value);
        console.log('the name is', name);
        if (value == '') {
            value = null;
        }
        if (name == 'UPL_Position__c' && value < 9) {
            value = null;
        }
        if ((value < 0 || value > 100) && name != 'UPL_Position__c') {
            value = null;
        }
        
        let gtmIndex = this.gtmcompetitor.findIndex((obj => obj.id == id));
        let tempOptions = this.statusOptions.filter(op => String(op.value) == String(value))[0];
        let optionValue = tempOptions ? tempOptions.label : '';
        let tempIndicate1=this.gtmcompetitor[gtmIndex].Indicate1;
        let tempIndicate2=this.gtmcompetitor[gtmIndex].Indicate2;
        let tempIndicate3=this.gtmcompetitor[gtmIndex].Indicate3;
        let tempIndicate4=this.gtmcompetitor[gtmIndex].Indicate4;
        let tempIndicate5=this.gtmcompetitor[gtmIndex].Indicate5;
        let tempIndicate6=this.gtmcompetitor[gtmIndex].Indicate6;
        let tempIndicate7=this.gtmcompetitor[gtmIndex].Indicate7;
        let tempIndicate8=this.gtmcompetitor[gtmIndex].Indicate8;
       
        console.log('optionValue ', optionValue);
        if (optionValue == this.uplName) {
           
            updateshare({ recordId: id,value:value }).then(data => {
                console.log('Empty UPL and UPL share wallet', data);
            });
        } 

        if (name == 'Competitor_Name_1__c') {
            this.gtmcompetitor[gtmIndex].Competitor1 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor1Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;
          
             if( this.gtmcompetitor[gtmIndex].Competitor1Name.toLowerCase()==this.uplName.toLowerCase())
             {           
                this.gtmcompetitor[gtmIndex].uplposition=1;   
              
                 
             }


            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate1 = null;
               
            }
        }
        if (name == 'Indicate_share_wallet_of_competitor_1__c') {
            if((Number(tempIndicate2))<=Number(value)|| this.isEmpty((tempIndicate2))){
                this.gtmcompetitor[gtmIndex].Indicate1 = this.gtmcompetitor[gtmIndex].Competitor1?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator1 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor1Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate1;
               
                }

            }else{
               
                this.gtmcompetitor[gtmIndex].validateIndicator1 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator1?null:value;
                this.gtmcompetitor[gtmIndex].Indicate1 = null;
                
            }
        }

        if (name == 'Competitor_Name_2__c') {
            this.gtmcompetitor[gtmIndex].Competitor2 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor2Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;
            if( this.gtmcompetitor[gtmIndex].Competitor2Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=2;   
                
                 
             }



            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate2 = null;
            }
        } 
        if (name == 'Indicate_share_wallet_of_competitor_2__c') {
            if(Number(tempIndicate1>=Number(value))&&((tempIndicate3)<=Number(value))||((this.isEmpty((tempIndicate3)))&&(Number((tempIndicate1)>=Number(value)))||(this.isEmpty(tempIndicate1)))){
                this.gtmcompetitor[gtmIndex].Indicate2 = this.gtmcompetitor[gtmIndex].Competitor2?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator2 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor2Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate2;
               
                }

            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator2 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator2?null:value;
                this.gtmcompetitor[gtmIndex].Indicate2 = null;
            }
        } 
        if (name == 'Competitor_Name_3__c') {
            this.gtmcompetitor[gtmIndex].Competitor3 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor3Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;

            if( this.gtmcompetitor[gtmIndex].Competitor3Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=3;   
               
                 
             }
           
            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate3 = null;
            }
        } 
        if (name == 'Indicate_share_wallet_of_competitor_3__c') {
            if(Number((tempIndicate2)>=Number(value))&&((tempIndicate4)<=Number(value))||((this.isEmpty((tempIndicate4)))&&(Number((tempIndicate2)>=Number(value)))||(this.isEmpty(tempIndicate2)&&(Number((tempIndicate1)>=Number(value)))))){
                this.gtmcompetitor[gtmIndex].Indicate3 = this.gtmcompetitor[gtmIndex].Competitor3?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator3 = value?false:value==null?false:true;

                if( this.gtmcompetitor[gtmIndex].Competitor3Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate3;
                
                }
                
            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator3 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator3?null:value;
                this.gtmcompetitor[gtmIndex].Indicate3 = null;
            }
        } if (name == 'Competitor_Name_4__c') {
            this.gtmcompetitor[gtmIndex].Competitor4 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor4Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;
            if( this.gtmcompetitor[gtmIndex].Competitor4Name.toLowerCase()==this.uplName.toLowerCase())
            {
               this.gtmcompetitor[gtmIndex].uplposition=4;   
               
                
            }
            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate4 = null;
            }
        } 
        if (name == 'Indicate_share_wallet_of_competitor_4__c') {
           if(Number((tempIndicate3)>=Number(value))&&((tempIndicate5)<=Number(value))||((this.isEmpty((tempIndicate5)))&&(Number((tempIndicate3)>=Number(value)))||(this.isEmpty(tempIndicate3)))){

                this.gtmcompetitor[gtmIndex].Indicate4 = this.gtmcompetitor[gtmIndex].Competitor4?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator4 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor4Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate4;
             
                }



            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator4 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator4?null:value;
                this.gtmcompetitor[gtmIndex].Indicate4 = null;
            }
        } 
        if (name == 'Competitor_Name_5__c') {
            this.gtmcompetitor[gtmIndex].Competitor5 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor5Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;

            if( this.gtmcompetitor[gtmIndex].Competitor5Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=5;   
                
                 
             }
            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate5 = null;
            }
        } 
        if (name == 'Indicate_share_wallet_of_competitor_5__c') {
            if(Number((tempIndicate4)>=Number(value))&&((tempIndicate6)<=Number(value))||((this.isEmpty((tempIndicate6)))&&(Number((tempIndicate4)>=Number(value)))||(this.isEmpty(tempIndicate4)))){
                this.gtmcompetitor[gtmIndex].Indicate5 = this.gtmcompetitor[gtmIndex].Competitor5?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator5 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor5Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate5;
              
                }
            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator5 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator5?null:value;
                this.gtmcompetitor[gtmIndex].Indicate5 = null;
            }
        }
        if (name == 'Competitor_Name_6__c') {
            this.gtmcompetitor[gtmIndex].Competitor6 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor6Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;

            if( this.gtmcompetitor[gtmIndex].Competitor6Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=6;   
                 
             }
            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate6 = null;
            }
        } if (name == 'Indicate_share_wallet_of_competitor_6__c') {
            if(Number((tempIndicate5)>=Number(value))&&((tempIndicate7)<=Number(value))||((this.isEmpty((tempIndicate7)))&&(Number((tempIndicate5)>=Number(value)))||(this.isEmpty(tempIndicate5)))){
                this.gtmcompetitor[gtmIndex].Indicate6 = this.gtmcompetitor[gtmIndex].Competitor6?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator6 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor6Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate6;
             
                }

            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator6 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator6?null:value;
                this.gtmcompetitor[gtmIndex].Indicate6 = null;
            }
        } if (name == 'Competitor_Name_7__c') {
            this.gtmcompetitor[gtmIndex].Competitor7 = value != 'none' ? value : null;
           
            this.gtmcompetitor[gtmIndex].Competitor7Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;
            if( this.gtmcompetitor[gtmIndex].Competitor7Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=7;   
                 
             }



            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate7 = null;
            }
        } if (name == 'Indicate_share_wallet_of_competitor_7__c') {
            if(Number((tempIndicate6)>=Number(value))&&((tempIndicate8)<=Number(value))||((this.isEmpty((tempIndicate8)))&&(Number((tempIndicate6)>=Number(value)))||(this.isEmpty(tempIndicate6)))){
                this.gtmcompetitor[gtmIndex].Indicate7 = this.gtmcompetitor[gtmIndex].Competitor7?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator7 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor7Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate7;
                }


            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator7 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator7?null:value;
                this.gtmcompetitor[gtmIndex].Indicate7 = null;
            }
        } if (name == 'Competitor_Name_8__c') {
            console.log('Competitor_Name_8__c');
            this.gtmcompetitor[gtmIndex].Competitor8 = value != 'none' ? value : null;
            this.gtmcompetitor[gtmIndex].Competitor8Name = this.statusOptions.filter(op => String(op.value) == String(value))[0].label;
            if( this.gtmcompetitor[gtmIndex].Competitor8Name.toLowerCase()==this.uplName.toLowerCase())
             {
                this.gtmcompetitor[gtmIndex].uplposition=8;   
                 
             }
            if(value=='none'){
                this.gtmcompetitor[gtmIndex].Indicate8 = null;
            }
        } if (name == 'Indicate_share_wallet_of_competitor_8__c') {
            if(Number(tempIndicate7)>=Number(value) ||(this.isEmpty(tempIndicate7))){
                this.gtmcompetitor[gtmIndex].Indicate8 = this.gtmcompetitor[gtmIndex].Competitor8?value:value=null;
                this.gtmcompetitor[gtmIndex].validateIndicator8 = value?false:value==null?false:true;
                if( this.gtmcompetitor[gtmIndex].Competitor8Name.toLowerCase()==this.uplName.toLowerCase())
                {
                 this.gtmcompetitor[gtmIndex].uplshare =this.gtmcompetitor[gtmIndex].Indicate8;
                }



            }else{
                this.gtmcompetitor[gtmIndex].validateIndicator8 = isNaN(Number(value))?false:true;
                value = this.gtmcompetitor[gtmIndex].validateIndicator8?null:value;
                this.gtmcompetitor[gtmIndex].Indicate8 = null;
            }
        }

        if (name == 'UPL_Position__c') {
            this.gtmcompetitor[gtmIndex].uplposition = value;
        } if (name == 'UPLs_share_of_wallet__c')
         {   
            this.gtmcompetitor[gtmIndex].uplshare = value;
        }

        let gtmDetailObj = JSON.parse(JSON.stringify(this.gtmcompetitor[gtmIndex]));
        this.gtmDetail = {
            Id:gtmDetailObj.id,
            Competitor_Name_1__c:this.isBlank(gtmDetailObj.Competitor1)?undefined:gtmDetailObj.Competitor1,
            Indicate_share_wallet_of_competitor_1__c:this.isBlank(gtmDetailObj.Indicate1)?undefined:gtmDetailObj.Indicate1,
            Competitor_Name_2__c:this.isBlank(gtmDetailObj.Competitor2)?undefined:gtmDetailObj.Competitor2,
            Indicate_share_wallet_of_competitor_2__c:this.isBlank(gtmDetailObj.Indicate2)?undefined:gtmDetailObj.Indicate2,
            Competitor_Name_3__c:this.isBlank(gtmDetailObj.Competitor3)?undefined:gtmDetailObj.Competitor3,
            Indicate_share_wallet_of_competitor_3__c:this.isBlank(gtmDetailObj.Indicate3)?undefined:gtmDetailObj.Indicate3,
            Competitor_Name_4__c:this.isBlank(gtmDetailObj.Competitor4)?undefined:gtmDetailObj.Competitor4,
            Indicate_share_wallet_of_competitor_4__c:this.isBlank(gtmDetailObj.Indicate4)?undefined:gtmDetailObj.Indicate4,
            Competitor_Name_5__c:this.isBlank(gtmDetailObj.Competitor5)?undefined:gtmDetailObj.Competitor5,
            Indicate_share_wallet_of_competitor_5__c:this.isBlank(gtmDetailObj.Indicate5)?undefined:gtmDetailObj.Indicate5,
            Competitor_Name_6__c:this.isBlank(gtmDetailObj.Competitor6)?undefined:gtmDetailObj.Competitor6,
            Indicate_share_wallet_of_competitor_6__c:this.isBlank(gtmDetailObj.Indicate6)?undefined:gtmDetailObj.Indicate6,
            Competitor_Name_7__c:this.isBlank(gtmDetailObj.Competitor6)?undefined:gtmDetailObj.Competitor7,
            Indicate_share_wallet_of_competitor_7__c:this.isBlank(gtmDetailObj.Indicate7)?undefined:gtmDetailObj.Indicate7,
            Competitor_Name_8__c:this.isBlank(gtmDetailObj.Competitor8)?undefined:gtmDetailObj.Competitor8,
            Indicate_share_wallet_of_competitor_8__c:this.isBlank(gtmDetailObj.Indicate8)?undefined:gtmDetailObj.Indicate8,
            UPL_Position__c:this.isBlank(gtmDetailObj.uplposition)?undefined:gtmDetailObj.uplposition,
            UPLs_share_of_wallet__c:this.isBlank(gtmDetailObj.uplshare)?undefined:gtmDetailObj.uplshare
        }
        let upgtm = JSON.parse(JSON.stringify(this.gtmDetail)); // removing undefined variables
        console.log('updating GTM Detail ',upgtm);
        updateGTMDetails({upgtm:upgtm}).then(updateDetail=>{
            console.log('Updated Detail 1',updateDetail);
        }).catch(err=>{
            console.log('error while updating detail ',err);
        })
        this.updatePicklistOptions(this.gtmcompetitor[gtmIndex],name);
        setTimeout(() => {
            let tempData = JSON.parse(JSON.stringify(this.gtmcompetitor));
            // this.gtmcompetitor = tempData; // Edited on 13-06-2022
            this.gtmcompetitorVirtual = tempData;
            this.gtmcompetitor1 = this.gtmcompetitor;
            this.updateStatusLabel();
            console.log( 'value -->',value);
            if(!value)
            {
            this.clearCell(accountId,name)
            }
        }, 200);
    }

    isBlank(str){
        return String(str).length===0?true:false;  
    }
    isEmpty(str){
        return String(str).length===0||str==null||str==undefined?true:false;
        
    }


    updateStatusLabel() {
        let completeField = 0;
        let inProgressField = 0;
        let NotFilled = 0;
        this.gtmcompetitor.forEach(ele => {
            if (ele.remainingPercentage == 0) {//Completed
                completeField++;
                ele.status = 'Completed';
            }
            if (ele.remainingPercentage > 0 && ele.remainingPercentage < 100) {// In Progress
                inProgressField++;
                ele.status = 'INProgress';
            }
            if (ele.remainingPercentage == 100) { // Not Filled
                NotFilled++;
                ele.status = 'NotFilled';
            }
           
        });
        this.panelStatus = {
            notFilled: NotFilled,
            inProgress: inProgressField,
            completed: completeField     
        }
        this.gtmcompetitor1=JSON.parse(JSON.stringify(this.gtmcompetitor))
        console.log('competitor1 data',this.gtmcompetitor1);
    }


    getCalculatedPercentage() {
        this.gtmcompetitorVirtual.forEach((ele) => {
            let remainingPercentage = 100;

            let percentageLabel = '';
            if (remainingPercentage == 0) {
                percentageLabel = 'Completed';
            } else if (remainingPercentage > 0 && remainingPercentage < 100) {
                percentageLabel = 'In Progress';
            } else if (remainingPercentage == 100) {
                percentageLabel = 'Not Fill';
            }
            setTimeout(() => {
                ele.remainingPercentage = percentageLabel;
                ele.percentageValue = remainingPercentage;
                // console.log('percentage label ',ele.percentage);
            }, 50);
        })
    }

    clearCell(accountId,name){
        console.log('col name ',accountId,'name ',name);
		this.template.querySelectorAll('[data-account="' + accountId + '"]').forEach(col=>{
            if(col.name==name){
                col.value = '';
            }
        });
    }

    updateStatus(id) {
        let inputCompleted = 100;
        setTimeout(() => {
            this.template.querySelectorAll('[data-accountid="' + id + '"]').forEach(col => {
                //console.log('classes ',col.classList.value);
                if (col.classList.value.includes('inputDetails')) {
                    if (col.value) {
                        inputCompleted = Number(inputCompleted) - Number(col.value);
                        // console.log('value ',col.value);
                    }
                }
                if (col.classList.value.includes('percentage')) {
                    // console.log('percentage ',col);
                    col.firstChild.data = `${Number(Number(inputCompleted).toFixed(2)).toLocaleString(this.countryLocale)} %`;
                }
                if (col.classList.value.includes('distribution')) {
                    col.style.backgroundColor = 'green';
                    col.style.color = '#fff';
                    col.firstChild.data = 'Distribution completed'
                }
                if (col.classList.value.includes('distribution') && inputCompleted <= 100 && inputCompleted != 0) {
                    col.style.backgroundColor = 'red';
                    col.style.color = '#fff';
                    col.firstChild.data = 'Please check the values. Not matching 100%'
                }
            })
        }, 200);
    }


    handleSort(event) {
        let fieldName = event.target.name;
        this.sortDirection = !this.sortDirection;
        this.sortData(fieldName, this.sortDirection);

    }

    sortData(fieldname, direction) {
        direction = direction == true ? "asc" : "des";
        console.log("Field Name ", fieldname, " direction ", direction);
        let parseData = JSON.parse(JSON.stringify(this.gtmcompetitor1));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === "asc" ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : "";
            y = keyValue(y) ? keyValue(y) : "";
            return isReverse * ((x > y) - (y > x));
        });
        this.gtmcompetitor1 = parseData;
        console.log('The Sorting data', this.gtmcompetitor1)
    }

    sortCompetitor(fieldname, direction, wrapperdata) {

        console.log("Field Name ", fieldname, " direction ", direction);
        let parseData = JSON.parse(JSON.stringify(wrapperdata));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === "asc" ? 1 : -1;
        parseData.sort((x, y) => {
           
            x = keyValue(x) ? keyValue(x) : "";
            y = keyValue(y) ? keyValue(y) : "";
            return isReverse * ((x.toLowerCase() > y.toLowerCase()) - (y.toLowerCase() > x.toLowerCase()));
        });
        wrapperdata = parseData;

        console.log('competitior sorted', wrapperdata)
        return wrapperdata;
    }


    handlePaginationAction(event) {
        setTimeout(() => {
            console.log('curret Page ', event.detail.currentPage);
            this.gtmcompetitor1 = event.detail.values;
            this.hasRendered = false;
        }, 200);
    }


    handleFiltersAction(event) {
        let filtersValue = JSON.parse(JSON.stringify(event.detail));
        this.showLoading = true;
        setTimeout(() => {
            this.applyFiltersOnCustomer(filtersValue);
            this.showLoading = false;
        }, 200);
    }


    applyFiltersOnCustomer(filtersValue) {
        // this.showLoading = true;
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


        // this.gtmcompetitor = [];
        this.gtmcompetitor1 = [];

        this.gtmcompetitor1 = this.gtmcompetitorVirtual.filter(ele => {
            let custName = String(ele.customer).toLowerCase();
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
        setTimeout(() => {
            this.gtmcompetitor = JSON.parse(JSON.stringify(this.gtmcompetitor1));
            this.updateStatusLabel();
        }, 200);
    }

    updatePicklistOptions(obj,name) {
       
        obj.remainingOptions1 = obj.options.filter(ele => {
            return ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions2 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions3 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions4 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions5 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions6 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor7 && ele.value != obj.Competitor8
        });
        obj.remainingOptions7 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor8
        });
        obj.remainingOptions8 = obj.options.filter(ele => {
            return ele.value != obj.Competitor1 && ele.value != obj.Competitor2 && ele.value != obj.Competitor3 && ele.value != obj.Competitor4 && ele.value != obj.Competitor5 && ele.value != obj.Competitor6 && ele.value != obj.Competitor7
        });
        if (!obj.Competitor1 && !obj.Competitor2 && !obj.Competitor3 && !obj.Competitor4 && !obj.Competitor5 && !obj.Competitor6 && !obj.Competitor7 && !obj.Competitor8) {
            if (obj.remainingOptions1.length == 0) {
                obj.remainingOptions1 = obj.options;
            }
            if (obj.remainingOptions2.length == 0) {
                obj.remainingOptions2 = obj.options;
            }
            if (obj.remainingOptions3.length == 0) {
                obj.remainingOptions3 = obj.options;
            }
            if (obj.remainingOptions4.length == 0) {
                obj.remainingOptions4 = obj.options;
            }
            if (obj.remainingOptions5.length == 0) {
                obj.remainingOptions5 = obj.options;
            }
            if (obj.remainingOptions6.length == 0) {
                obj.remainingOptions6 = obj.options;
            }
            if (obj.remainingOptions7.length == 0) {
                obj.remainingOptions7 = obj.options;
            }
            if (obj.remainingOptions8.length == 0) {
                obj.remainingOptions8 = obj.options;
            }
        }
        if (String(obj.Competitor1Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor2Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor3Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor4Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor5Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor6Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor7Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor8Name).toLowerCase() == this.uplName.toLowerCase()) {
            obj.isUPLSelected = true
            
            //obj.uplposition = '';
           // obj.uplshare = '';

           // updateshare({ recordId: obj.id }).then(data => {

          //      console.log('The new data is', data);
           // });
        }
        else {
            obj.isUPLSelected = false
        }

        let indicator1 = isNaN(Number(obj.Indicate1))?0:Number(obj.Indicate1);
        let indicator2 = isNaN(Number(obj.Indicate2))?0:Number(obj.Indicate2);
        let indicator3 = isNaN(Number(obj.Indicate3))?0:Number(obj.Indicate3);
        let indicator4 = isNaN(Number(obj.Indicate4))?0:Number(obj.Indicate4);
        let indicator5 = isNaN(Number(obj.Indicate5))?0:Number(obj.Indicate5);
        let indicator6 = isNaN(Number(obj.Indicate6))?0:Number(obj.Indicate6);
        let indicator7 = isNaN(Number(obj.Indicate7))?0:Number(obj.Indicate7);
        let indicator8 = isNaN(Number(obj.Indicate8))?0:Number(obj.Indicate8);
        let uplshare =  isNaN(Number(obj.uplshare))?0:Number(obj.uplshare);
        let initialPercentage = NaN;
         initialPercentage =  initialPercentage || 0;
         if (String(obj.Competitor1Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor2Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor3Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor4Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor5Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor6Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor7Name).toLowerCase() == this.uplName.toLowerCase() || String(obj.Competitor8Name).toLowerCase() == this.uplName.toLowerCase()) {
          uplshare=0;

         initialPercentage = indicator1 + indicator2 + indicator3 +indicator4 +indicator5 +indicator6 +indicator7 + indicator8 + uplshare; 
            console.log('initial value2',initialPercentage)
         }
         else
         {
            initialPercentage = indicator1 + indicator2 + indicator3 +indicator4 +indicator5 +indicator6 +indicator7 + indicator8 + uplshare; 
             
         }
        
        // console.log('Name ',name);
        let gtmDetail = {
            Id:obj.id,
            Indicate_share_wallet_of_competitor_1__c:this.isBlank(obj.Indicate1)?undefined:obj.Indicate1,
            Indicate_share_wallet_of_competitor_2__c:this.isBlank(obj.Indicate2)?undefined:obj.Indicate2,
            Indicate_share_wallet_of_competitor_3__c:this.isBlank(obj.Indicate3)?undefined:obj.Indicate3,
            Indicate_share_wallet_of_competitor_4__c:this.isBlank(obj.Indicate4)?undefined:obj.Indicate4,
            Indicate_share_wallet_of_competitor_5__c:this.isBlank(obj.Indicate5)?undefined:obj.Indicate5,
            Indicate_share_wallet_of_competitor_6__c:this.isBlank(obj.Indicate6)?undefined:obj.Indicate6,
            Indicate_share_wallet_of_competitor_7__c:this.isBlank(obj.Indicate7)?undefined:obj.Indicate7,
            Indicate_share_wallet_of_competitor_8__c:this.isBlank(obj.Indicate8)?undefined:obj.Indicate8,
            UPLs_share_of_wallet__c:this.isBlank(obj.uplshare)?undefined:obj.uplshare
        }
        if(initialPercentage>100 && name){
            if(name=='Indicate_share_wallet_of_competitor_1__c'){obj.Indicate1 = null; initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_1__c);gtmDetail.Indicate_share_wallet_of_competitor_1__c=null}
            if(name=='Indicate_share_wallet_of_competitor_2__c'){obj.Indicate2 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_2__c);gtmDetail.Indicate_share_wallet_of_competitor_2__c=null}
            if(name=='Indicate_share_wallet_of_competitor_3__c'){obj.Indicate3 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_3__c);gtmDetail.Indicate_share_wallet_of_competitor_3__c=null}
            if(name=='Indicate_share_wallet_of_competitor_4__c'){obj.Indicate4 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_4__c);gtmDetail.Indicate_share_wallet_of_competitor_4__c=null}
            if(name=='Indicate_share_wallet_of_competitor_5__c'){obj.Indicate5 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_5__c);gtmDetail.Indicate_share_wallet_of_competitor_5__c=null}
            if(name=='Indicate_share_wallet_of_competitor_6__c'){obj.Indicate6 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_6__c);gtmDetail.Indicate_share_wallet_of_competitor_6__c=null}
            if(name=='Indicate_share_wallet_of_competitor_7__c'){obj.Indicate7 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_7__c);gtmDetail.Indicate_share_wallet_of_competitor_7__c=null}
            if(name=='Indicate_share_wallet_of_competitor_8__c'){obj.Indicate8 = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.Indicate_share_wallet_of_competitor_8__c);gtmDetail.Indicate_share_wallet_of_competitor_8__c=null}
            if(name=='UPLs_share_of_wallet__c'){obj.uplshare = null;initialPercentage = Number(initialPercentage) - Number(gtmDetail.UPLs_share_of_wallet__c);gtmDetail.UPLs_share_of_wallet__c=null}
            this.clearCell(obj.customerId,name);
            console.log('gtmDetail ',gtmDetail);
            gtmDetail = JSON.parse(JSON.stringify(gtmDetail));
            updateGTMDetails({upgtm:gtmDetail}).then(updateDetail=>{
                console.log('Updated Detail 2',updateDetail);
            }).catch(err=>{
                console.log('error while updating detail ',err);
            })
            this.showToast('', this.labels.Combined_total_value_more_than_100_is_not_allowed, 'error', 'dismissable');
        }
        // console.log('initialPercentage',initialPercentage);
        initialPercentage = 100 - initialPercentage;
        obj.remainingPercentage = Number(Number(initialPercentage).toFixed(2)).toLocaleString(this.countryLocale);
        // console.log('initialPercentage obj :', obj);
        // console.log('initialPercentage :', initialPercentage);
        if (obj.remainingPercentage > 0) {
            obj.isDistributionCompleted = false;
        } else if (obj.remainingPercentage == 0) {
            obj.isDistributionCompleted = true;
        }
    }
    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'error',
            mode: mode
        });
        this.dispatchEvent(event);
    }


}