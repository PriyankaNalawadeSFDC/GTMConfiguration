import { LightningElement, track, wire, api } from 'lwc';
import getFaq from '@salesforce/apex/GTMPathFinderHelper.getInstructions';

export default class GtmFaqs extends LightningElement {
    Faq='';
    @api getCountryValueFromParent;
    @api onTabRefresh() {
        setTimeout(() => {
            this.connectedCallback();
        }, 500);
    }
    // @wire(getFaq) getFaq({error,data}){
    //     if(data){
    //         console.log('getFaq Data',data);
    //         this.Faq = data.Instruction_FAQ__c;
    //     }
    // }

    connectedCallback(){
        getFaq().then(data=>{
            if(data){
                console.log('getFaq Data ---',data);
                this.Faq = data.Instruction_FAQ__c;
            }
        }).catch(err=>{
            console.log('Err ',err);
        })
    }
}