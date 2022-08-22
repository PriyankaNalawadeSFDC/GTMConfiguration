import { LightningElement, track, wire } from "lwc";

import Icons from "@salesforce/resourceUrl/Grz_Resourse";
import detailsLabel from '@salesforce/label/c.Grz_PricesDiscounts';
import FORM_FACTOR from '@salesforce/client/formFactor';
import getAccInfo from "@salesforce/apex/Grz_PricesDiscounts.getAccInfo";
import GetPriceBook from "@salesforce/apex/Grz_AdminPanel.GetPriceBook";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Grz_PricesSchems extends LightningElement {
  label={
    detailsLabel
};
 // @track countcontact;
  @track priceData; 
//@track pricesDiscountUrl;
//@track screenSize=FORM_FACTOR;
@track bgImage = Icons + '/Grz_Resourse/Images/Carousel.jpg';
//@track isMobileView=false;
@track yearType;
@track monthType;
@track accountId;
@track zoneName;
@track zoneNameFull;
@track sbuName;
@track zoneCode;
@track customerType;
@track customerTypeVal;
@track disableButton=false;
@track selectedMonth;
@track selectedYear;
loaded1 = false;

downloadIcon = Icons + "/Grz_Resourse/Images/DownloadIcon.png";

connectedCallback() {
  var today = new Date();
  this.monthType = (today.getMonth()+1).toString();
  this.yearType =  (today.getFullYear()).toString();
  console.log('this.yearType==>'+this.yearType);
  
}


@wire(getAccInfo)
    records(result) {
      console.log('result final==>',result);
        if (result.data) {
this.accountId=result.data.Id;
if(result.data.Price_List_Type__c!=undefined && result.data.Price_List_Type__r.Zone__c!=undefined){
  this.zoneName=result.data.Price_List_Type__r.Zone__r.Name.substring(0,3);
  this.zoneNameFull=result.data.Price_List_Type__r.Zone__r.Name;
  this.sbuName=result.data.Price_List_Type__r.SBU__r.Name;
  this.zoneCode=result.data.Price_List_Type__r.Zone__r.ZoneCode__c;
}
else{
  this.zoneName='';
  this.zoneNameFull='';
  this.sbuName='';
  this.zoneCode='';
}
if(result.data.PriceGroupCode__c!=undefined){
  this.customerType=result.data.PriceGroupCode__r.PG_Code__c;
  if(this.customerType=='03'){
    this.customerTypeVal='Dist';
  }
  else if(this.customerType=='49'){
    this.customerTypeVal='SuperDist';
  }
}
else{
  this.customerType='';
  this.customerTypeVal='';
}
console.log('this.zoneCode=>'+this.zoneCode);
console.log('this.customerType=>'+this.customerType);
}}


    getFiscalYearStart() {
      var fiscalyearStart = "";
      var today = new Date();
      
      if ((today.getMonth() + 1) <= 3) {
      fiscalyearStart = today.getFullYear() - 1;
      } else {
      fiscalyearStart = today.getFullYear()
      }
      console.log('-----fiscalyearStart---- '+fiscalyearStart);
      return fiscalyearStart;
      }


      handleYearOption(event) {
        this.yearType = event.detail.value.toString();
        if(this.yearType!=undefined && this.monthType!=undefined){
          this.disableButton=false;
        }
        else{
          this.disableButton=true;
        }
      }
      handleMonthOption(event) {
        this.monthType = event.detail.value; 
        if(this.yearType!=undefined && this.monthType!=undefined){
          this.disableButton=false;
        }
        else{
          this.disableButton=true;
        }       
      }
      get MonthOptions() {
        return [
          { label: "January", value: "1" },
          { label: "February", value: "2" },
          { label: "March", value: "3" },
          { label: "April", value: "4" },
           { label: "May", value: "5" },
          { label: "June", value: "6" },
          { label: "July", value: "7" },
          { label: "August", value: "8" },
           { label: "September", value: "9" },
          { label: "October", value: "10" },
          { label: "November", value: "11" },
          { label: "December", value: "12" }
        ];
      }
      get YearOptions() {
        return [
          { label: (this.getFiscalYearStart()-1).toString(), value: (this.getFiscalYearStart()-1).toString() },
          { label: this.getFiscalYearStart().toString(), value: this.getFiscalYearStart().toString() }
        ];
      }

      handleButtonClick(){
        this.loaded1 = true;
        this.disableButton=true;
        this.selectedYear=this.yearType.substring(2,4);
        var today = new Date();
        for(var i=0;i<this.MonthOptions.length;i++){
          if(this.MonthOptions[i].value==(today.getMonth()+1).toString()){
            this.selectedMonth=this.MonthOptions[i].label.substring(0,3);
          }
        }
        // var i=(today.getMonth()+1);
        // this.selectedMonth=this.MonthOptions[i].label.substring(0,3);
        GetPriceBook({
          Zones: this.zoneNameFull,
          StartDate: '',
          EndDate: '',
          Month: this.monthType,
          year: this.yearType,
          isRelatedList: false,
          sbu:this.sbuName,
          Customer:this.customerType
        }).then((result) => {
          this.loaded1 = false;
          this.priceData=[];
          console.log('aashima result==>',result);
          result.PricesListBook.forEach(item => {
            // var sd=new Date(item.StartDate__c);
            // var ed=new Date(item.EndDate__c);
            var StartDateFiscalYear;
            if((new Date(item.StartDate__c).getMonth() + 1) <= 3) {
              StartDateFiscalYear = (new Date(item.StartDate__c).getFullYear() - 1)+'-04-01';
              } else {
              StartDateFiscalYear = new Date(item.StartDate__c).getFullYear()+'-04-01';
              }
              console.log('StartDateFiscalYear==>'+StartDateFiscalYear);
            let price={
                Id:item.Id,
                StartDate:this.formatDate(item.StartDate__c),
                EndDate:this.formatDate(item.EndDate__c),
                pricesDiscountsUrl:"/uplpartnerportal/apex/Grz_AdminPanelStatementDownload?sbu="+
                this.sbuName+
              "&SelectedZones=" +
                this.zoneNameFull+
              "&zoneCode=" +
                this.zoneCode+
              "&startDate=" +
              item.StartDate__c+
              "&endDate=" +
              item.EndDate__c+
              "&Customer=" +
              this.customerType+
              "&StartDateFiscalYear="
              +StartDateFiscalYear
              }
              if(this.priceData.length==0){
                this.priceData.push(price);
              }
              else{
                for(var i=0;i<this.priceData.length;i++){
                  if(price.StartDate==this.priceData[i].StartDate && price.EndDate==this.priceData[i].EndDate){
                    break;
                  }
                  else if(i==(this.priceData.length)-1){
                    if(price.StartDate!=this.priceData[i].StartDate || price.EndDate!=this.priceData[i].EndDate){
                      this.priceData.push(price);
                    }
                  }
                }
              }
              
              
        });
        if(this.priceData.length==0){
          const event = new ShowToastEvent({
              title: 'No record found',
              variant: 'error',
              });
              this.dispatchEvent(event);
      }
      this.disableButton=false;
      // this.pricesDiscountsUrl="/apex/Grz_AdminPanelStatementDownload?sbu="+
      // this.sbuName+
      // "&monthSel=" +
      // this.monthType +
      // "&yearSel=" +
      // this.yearType+
      // "&accId=" +
      // this.accountId;
        }
      );
      }

      formatDate(date) {
          console.log('date before',date);
          var d=new Date(date);
         var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
         var day = d.getDate();
         var monthIndex = d.getMonth();
         var year = d.getFullYear();
         console.log('date after',monthNames[monthIndex]+ ' ' + day+ ',' + year);
         return monthNames[monthIndex]+ ' ' + day+ ',' + year;
       
      }
}