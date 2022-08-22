import { LightningElement,track,api } from 'lwc';
import Customer_Lead_Customer from '@salesforce/label/c.Customer_Lead_Customer';
import Search_By_Customer_Name from '@salesforce/label/c.Search_By_Customer_Name';
import Filter_By from '@salesforce/label/c.Filter_By';
import Nos_Not_Filled from '@salesforce/label/c.Nos_Not_Filled';
import Nos_are_Completed from '@salesforce/label/c.Nos_are_Completed';
import Nos_in_Progress from '@salesforce/label/c.Nos_in_Progress';
import Select from '@salesforce/label/c.Select';
import Filter_by_Path_Finder from '@salesforce/label/c.Filter_by_Path_Finder';
import Filter_By_Status from '@salesforce/label/c.Filter_By_Status';
import reset from '@salesforce/label/c.Reset_All_filters';
import Lead_Customer from '@salesforce/label/c.Lead_Customer';
import Non_Lead_Customer from '@salesforce/label/c.Non_Lead_Customer';
import Both from '@salesforce/label/c.Both';
import Not_Fill from '@salesforce/label/c.Not_Fill';
import In_Progress from '@salesforce/label/c.In_Progress';
import Completed from '@salesforce/label/c.Completed';
import None from '@salesforce/label/c.None';
import Yes from '@salesforce/label/c.Yes';
import No from '@salesforce/label/c.No';

export default class GtmFilterPanel extends LightningElement {
    @track panelStatusObj={
        notFilled:'05',
        inProgress:'10',
        completed:'20'
    }
    @api get panelStatus(){
        return this.panelStatusObj;
    }

    labels={
        Customer_Lead_Customer,
        Search_By_Customer_Name,
        Filter_By,
        Nos_Not_Filled,
        Nos_are_Completed,
        Nos_in_Progress,
        Select,
        Filter_by_Path_Finder,
        Filter_By_Status,
        reset,
        Lead_Customer,
        Non_Lead_Customer,
        Both,
        Not_Fill,
        In_Progress,
        Completed,
        None,
        Yes,
        No
    }

    set panelStatus(value){
        // console.log('values to set',value.inProgress)
        setTimeout(() => {
            if(value){
                this.panelStatusObj.notFilled = value.notFilled;
                this.panelStatusObj.inProgress = value.inProgress;
                this.panelStatusObj.completed = value.completed;
            }
        }, 1000);
    }
    @track filters = {
        search:'',
        filter1:'',
        filter2:'',
        filter3:''
    }
    get options1() {
        return [
            { label: this.labels.Lead_Customer, value: 'Lead Customer'  },
            { label: this.labels.Non_Lead_Customer, value: 'Non Lead Customer' },
            { label: this.labels.Both, value: 'Both' },
        ];
    }
    get options2() {
        return [
            { label: this.labels.None, value: 'None' },
            { label: this.labels.Not_Fill, value: 'Not Fill' },
            { label: this.labels.In_Progress, value: 'In Progress' },
            { label: this.labels.Completed, value: 'Completed' },
        ];
    }
    get options3() {
        return [
            { label: this.labels.Yes, value: 'true' },
            { label: this.labels.No, value: 'false' },
            { label: this.labels.Both, value: 'Both' },
        ];
    }

    connectedCallback(){
        // this.dispatchAllevents();
    }

    handleValueChange(event){
        if(event.target.name=='search'){
            this.filters.search = event.target.value;
            var key = event.keyCode || event.charCode;
            if( key == 8 || key == 46 ){
                this.dispatchEvent(new CustomEvent('back',{detail:this.filters}))
            }
        }
        if(event.target.name=='filter1'){
            this.filters.filter1 = event.target.value;
        }
        if(event.target.name=='filter2'){
            this.filters.filter2 = event.target.value;
        }
        if(event.target.name=='filter3'){
            this.filters.filter3 = event.target.value;
        }
        if(event.target.name=='reset'){
            this.filters = {
                search:'',
                filter1:'',
                filter2:'',
                filter3:''
            }
        }
        this.dispatchAllevents();
    }

    dispatchAllevents(){
        console.log('event dispatched');
        this.dispatchEvent(new CustomEvent('action',{detail:this.filters}));
    }
}