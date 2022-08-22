import { LightningElement, track,api, wire } from 'lwc';
import getFiscalYear from '@salesforce/apex/GTMPathFinder.getFiscalYear'
import Submit from '@salesforce/label/c.Submit'
import Cancel from '@salesforce/label/c.Cancel'
import Currency_in_USD_Amount_in_Million from '@salesforce/label/c.Currency_in_USD_Amount_in_Million';
import Entered_data_auto_save_into_the_system from '@salesforce/label/c.Entered_data_auto_save_into_the_system';
import Instructions from '@salesforce/label/c.Instructions';
import GTM_FY from '@salesforce/label/c.CLIENT_PATHFINDER';
import OUTLOOK from '@salesforce/label/c.OUTLOOK';
import IDENTIFICATION from '@salesforce/label/c.IDENTIFICATION';
import COMPETITION from '@salesforce/label/c.COMPETITION';
import FAQ from '@salesforce/label/c.FAQ';
import CATEGORY_ALLOCATION from '@salesforce/label/c.CATEGORY_ALLOCATION';
import CROP_ALLOCATION from '@salesforce/label/c.CROP_ALLOCATION';
import POTENTIAL_AND_PROFILE from '@salesforce/label/c.POTENTIAL_AND_PROFILE';
import getPotentialAndProfile from '@salesforce/apex/GTMPathFinder.getPotentialAndProfile';
import getCatergoryAllocation from '@salesforce/apex/GTMPathFinder.getCatergoryAllocation';
import getCropAllocation from '@salesforce/apex/GTMPathFinder.getCropAllocation';
import getGTMCompetition from '@salesforce/apex/GTMCompetition.getGTMCompetition';
import getGTMOutlook from '@salesforce/apex/GTMOutlook.getGTMOutlook';
import getNewGTMCustomers from '@salesforce/apex/GTMPathFinder.getNewGTMCustomers';
import createNewCustomerDetails from '@salesforce/apex/GTMPathFinderHelper.createNewCustomerDetails';
import getNewlyAddedCrop from '@salesforce/apex/GTMPathFinder.getNewlyAddedCrop';
import createGTMAndDetailsCropAllocation from '@salesforce/apex/GTMPathFinderHelper.createGTMAndDetailsCropAllocation';
import submitGTMDetails from '@salesforce/apex/GTMPathFinder.submitGTMDetails';
import getGTM from '@salesforce/apex/GTMPathFinder.getGTM';
import setFiscalYear from '@salesforce/apex/GTMPathFinder.setFiscalYear';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Unable_to_Submit_GTM from '@salesforce/label/c.Unable_to_Submit_GTM';
import GTM_Submitted_Successfully from '@salesforce/label/c.GTM_Submitted_Successfully';
import SUCCESS from '@salesforce/label/c.Success'
import ERROR from '@salesforce/label/c.Error';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
import updateSelectedSalesOrgName from '@salesforce/apex/GTMPathFinder.updateSelectedSalesOrgName';
import { getRecord } from 'lightning/uiRecordApi';
import Id from '@salesforce/user/Id';
import { NavigationMixin } from 'lightning/navigation';

export default class GtmPathFinder extends NavigationMixin(LightningElement) {
    country = '';
    instrustions = '';
    @track isShowModal = false;
    @track title = '';
    gtmRecordId = '';
    disableSubmit = false;
   @track isPathFinder = false;
    error = '';
    country = '';
    instrustions = '';
    @track prfName = '';
    selectedCountry = '';
    @api recordId;
    showLoading = false;
    
   // @track areDetailsVisible = false;



    

   @wire(getRecord, { recordId: Id, fields: [PROFILE_NAME_FIELD]})
        userDetails({error, data}) {
            if (data) {
                this.prfName = data.fields.Profile.value.fields.Name.value;
                console.log('this.prfName>>>>>>>>>>>>>>>>>' +this.prfName);
                if(this.prfName == 'Pathfinder'){
                this.isPathFinder=true;
               // this.areDetailsVisible=true;
                } else {
                this.isPathFinder=false;
               // this.areDetailsVisible=false;
                }
            } else if (error) {
                this.error = error ;
            }
	    }

    set gtmid(value){
        this.gtmRecordId = value;
    }

    @api get gtmid(){
        return this.gtmRecordId;
    }
    


    fiscalyear = '';
    loadedPerviousData = false;

    labels = {
        Submit,
        Cancel,
        Currency_in_USD_Amount_in_Million,
        Entered_data_auto_save_into_the_system,
        Instructions,
        GTM_FY,
        OUTLOOK,
        IDENTIFICATION,
        COMPETITION,
        FAQ,
        CATEGORY_ALLOCATION,
        CROP_ALLOCATION,
        POTENTIAL_AND_PROFILE,
        Unable_to_Submit_GTM,
        GTM_Submitted_Successfully,
        SUCCESS,
        ERROR
    }

    @api getFiredFromAura(){
        console.log('connectedCallback 1',this.gtmid);
        // this.connectedCallback();
    }

    connectedCallback(){
        console.log('Profile Name>>>>>>>>>>>' +PROFILE_NAME_FIELD);
        
        if(!this.loadedPerviousData){
            console.log('connectedCallback 2',this.gtmRecordId,'this.gtmid ',this.gtmid);
            if(this.gtmid){
                getGTM({id:this.gtmid}).then(gtm=>{
                    if(gtm){
                        console.log('financialYear ',gtm.Fiscal_Year__c);
                        setFiscalYear({financialYear:gtm.Fiscal_Year__c}).then(fiscalyear=>{
                            this.fiscalyear = fiscalyear;
                            this.title = `${this.labels.GTM_FY} ${fiscalyear}`;
                            this.checkDataYear();
                            console.log('GTM Title ',this.title);
                        }).catch(err=>{
                            console.log('setFiscalYear ',err);
                        });
                    }
                })
            }else{
                this.loadCurrentYearGTM();
            }
            this.loadedPerviousData = true;
        }
    }

    loadCurrentYearGTM(){
        getFiscalYear().then(year=>{
            let title = year.replace('/','-');
            this.fiscalyear = title;
            this.title = `${this.labels.GTM_FY} ${title}`;
            if(this.fiscalyear){
                console.log('init');
                this.init();
            }
        })
        getNewGTMCustomers().then(newAccounts=>{
            if(newAccounts.length>0){
                console.log('new Accounts',newAccounts);
                createNewCustomerDetails({newAccounts:JSON.stringify(newAccounts)}).then(data=>{
                });
            }
        });
        getNewlyAddedCrop().then(listCrop=>{
            console.log('New Crops ',listCrop);
            if(listCrop.length>0 && this.fiscalyear){
                createGTMAndDetailsCropAllocation({activeCrops:listCrop,year:this.fiscalyear}).then(data=>{}).catch(err=>{console.log('createGTMAndDetailsCropAllocation ',err)})
            }
        }).catch(err=>console.log('getNewlyAddedCrop ',getNewlyAddedCrop));
    }

    async init() {
        try {
            await getPotentialAndProfile({year:this.fiscalyear}).catch(err=>console.log(err));
            await getCatergoryAllocation({year:this.fiscalyear}).catch(err=>console.log(err));
            await getCropAllocation({year:this.fiscalyear}).catch(err=>console.log(err));
            await getGTMCompetition({year:this.fiscalyear}).catch(err=>console.log(err));
            await getGTMOutlook({year:this.fiscalyear}).catch(err=>console.log(err));
        } catch (error) {
                console.log('error ',error);
        } finally {
            console.log('init completed')
        }
    }

    onTabChange(event){
        let cmpName = event.target.name;
        let cmp = this.template.querySelector(`${cmpName}`);
        if(cmp){
            cmp.onTabRefresh();
            cmp = undefined;
        }
    }
    
    handleclick() {
        let ml = this.template.querySelector(".sidebar");
        ml.toggleClass("active");
    }
    handleCancel(){
        this.handleListViewNavigation();
    }
    showModalBox() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
    }
    

    handleModelSubmit(){
        console.log('Submit model');
        this.isShowModal = false;
        this.submitDetails();
    }

    submitDetails(){
        submitGTMDetails().then(isSubmitted=>{
            this.showToast(this.labels.SUCCESS,this.labels.GTM_Submitted_Successfully,'success');
            if(isSubmitted){
                setTimeout(() => {
                    location.reload();
                }, 200);
            }
        }).catch(err=>{
            this.showToast(this.labels.ERROR,this.labels.Unable_to_Submit_GTM,'error');
        })
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
        if(this.fiscalyear){
            let year = (monthName=='Jan' || monthName=='Feb' || monthName=='Mar')?this.fiscalyear.split('-')[1]:this.fiscalyear.split('-')[0];
            if(currentYear!=year){
                this.disableSubmit = true; 
            }
        }
    }

    handleListViewNavigation() {
        // Navigate to the Accounts object's Recent list view.
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'GTM__c',
                actionName: 'list'
            },
            state: {
                // 'filterName' is a property on 'state'
                // and identifies the target list view.
                // It may also be an 18 character list view id.
                // or by 18 char '00BT0000002TONQMA4'
                filterName: 'Recent' 
            }
        });
    }

  get getcountries() {
    return [
        { label: 'Mexico', value: '5100' },
        { label: 'Argentina', value: '5631' },
        { label: 'Italy', value: '2410' },
    ];
  }

handleCountries(event) {
    this.showLoading = true;
   this.selectedCountry = event.target.value;
   console.log('this.selectedCountry >>>>>>>>>>' + this.selectedCountry);
   updateSelectedSalesOrgName({selectedCountryCode:this.selectedCountry}).then(data=>{
    console.log('updated',data);
    setTimeout(() => {
        this.showLoading = false;
    }, 3000);
}).catch(err=>console.log(err));
    /*if(this.isPathFinder==true) {
        let selectedAccId = this.selectedCountry;
        //custom event
        const passEvent = new CustomEvent('dropdownclick', {
            detail:{recordId:selectedAccId}
        });
        this.dispatchEvent(passEvent);
        //this.getinstructionsNew();
    }*/

}  

}