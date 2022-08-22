import { LightningElement, track, api, wire } from 'lwc';
import getLeadCustomerList from '@salesforce/apex/GtmLeadCustomer.getLeadCustomerList';
import updateAccountMethod from '@salesforce/apex/GtmLeadCustomer.updateAccountMethod';
import downloadCSV from '@salesforce/apex/GtmLeadCustomer.downloadCSV';
import saveFile from '@salesforce/apex/GtmLeadCustomer.saveFile';
import leadCustomerListForSelected from '@salesforce/apex/GtmLeadCustomer.leadCustomerListForSelected';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

//this is for all Custom Label 

import Both from '@salesforce/label/c.Both';
import Select from '@salesforce/label/c.Select';
import Account_Saved_successfully from '@salesforce/label/c.Account_Saved_successfully';
import Select_atleast_one_record  from '@salesforce/label/c.Select_atleast_one_record';

import Lead_Customer from '@salesforce/label/c.Lead_Customer';

import Non_Lead_Customer from '@salesforce/label/c.Non_Lead_Customer';
import OR from '@salesforce/label/c.OR';
import Update_Customer_Data from '@salesforce/label/c.Update_Customer_Data';
import Download from '@salesforce/label/c.Download';
import Sort_by from '@salesforce/label/c.Sort_by';
import Lead_Customer_Name from '@salesforce/label/c.Lead_Customer_Name';
import Lead_Code_SAP_Code from '@salesforce/label/c.Lead_Code_SAP_Code';
import Ownership from '@salesforce/label/c.Ownership';
import Customer_Type from '@salesforce/label/c.Customer_Type';
import Path_Finder from '@salesforce/label/c.Path_Finder';
import Last_Modified_By from '@salesforce/label/c.Last_Modified_By';
import Last_Modified_By_Date from '@salesforce/label/c.Last_Modified_By_Date';
import Save from '@salesforce/label/c.Save';
import Cancel from '@salesforce/label/c.Cancel';
import Reset from '@salesforce/label/c.Reset';
import Filter_By from '@salesforce/label/c.Filter_By';
import File_Size_is_to_long_to_process from '@salesforce/label/c.File_Size_is_to_long_to_process';
import Uploaded_Successfully from '@salesforce/label/c.Uploaded_Successfully';
import Error_while_uploading_File from '@salesforce/label/c.Error_while_uploading_File';





 



export default class GtmLeadCustomer extends LightningElement {
  

  @track customer = {
    id:'',
    name:''
    }
    @track leadAccData=[];
    @track ownerShipBlank=[];
    instrustions = '';
    
   @track customerTypeForFilter='';
   @track ownerRecId ='';
   @track accRecId ='';
   @track paginatedLeadAccData =[];
   @track showLoadingSpinner = false;

  showPage=true;
  tmpLeadData=[];


  @track disableBtn = {first:false,previous:false,next:false,last:false};
  


  // for files decalration 
  filesUploaded = [];
  @track fileName = '';  
  @track data;
  @track isTrue = false;
  @track showLoadingSpinner = false;
  @track selectCount = 0;

  @track clickedButtonLabel = '';  
  @track boolVisible = false; 


  file;
  fileContents;
  fileReader;
  content;
  MAX_FILE_SIZE = 1500000;

  accSelectedData =[];
 
  checkboxMap={};

  ownerMap={};
  pathfindMap={};
  customertypeMap={};

  pageLimit=10;
  pageNumber=1;
  pageItems=[];

  label = {
    Lead_Customer,
	Non_Lead_Customer,
	OR,
	Update_Customer_Data,
	Download,
	Sort_by,
	Lead_Customer_Name,
	Lead_Code_SAP_Code,Ownership,
	Customer_Type,
	Path_Finder,
	Last_Modified_By,
	Last_Modified_By_Date,
	Save,
	Cancel,
	Reset,
	Filter_By,
	File_Size_is_to_long_to_process,
	Uploaded_Successfully,
	Error_while_uploading_File,
  Select,
  Account_Saved_successfully,
  Select_atleast_one_record,
  Both
    
};
  
  connectedCallback(){
    this.customerTypeForFilter ='Both';

    getLeadCustomerList({customerFilter: this.customerTypeForFilter}).then(data=>{
      
      let dataLength = data.length;
     
      let selectCount = data[dataLength-1].selectCnt;
      this.selectCount = selectCount;
      this.showLoadingSpinner = true;
      this.instrustions = 'New Instruction';
      this.leadAccData = data;
      this.tmpLeadData = data;
      this.clickedButtonLabel = 'Show';
      this.displayRecords();
      setTimeout(() => {
        this.showLoadingSpinner = false;
      }, 2000);
     
      
    }).catch(error=> console.log('error is ',error))
  }

  get pageSizeOptions(){
    return [10,20,50,100];
}

handleRecordsPerPage(event){
  this.pageLimit = event.target.value;
  this.pageNumber=1;
  this.displayRecords();
}

handleNext(event){
  if(this.pageLimit*this.pageNumber<this.leadAccData.length){
    this.pageNumber++;
    this.displayRecords();
  }

}

showInstruction(event){
  console.log('in show instruction');

  const label = event.target.name;  
  console.log('label in show ',label);
  
        if ( label === 'Show' ) {  
  
            this.clickedButtonLabel = 'Hide';  
            this.boolVisible = true;  
  
        } else if  ( label === 'Hide' ) {  
              
            this.clickedButtonLabel = 'Show';  
            this.boolVisible = false;  
  
        }  
}

handlePrevious(event){
  if(this.pageNumber>1){
    this.pageNumber--;
    this.displayRecords();
  }
}

displayRecords(){
  let lastIndex=this.pageLimit*this.pageNumber;
  let startIndex = lastIndex - this.pageLimit;
  if(this.pageLimit*this.pageNumber>this.leadAccData.length){
    lastIndex=this.leadAccData.length;
  }
  this.pageItems=[];
  for(let i=startIndex;i<lastIndex;i++){
    this.pageItems.push(this.leadAccData[i]);

  }
  

}
 
  handleCustomerFilter(event){
    
    let custType = event.target.value;
    
    this.customerTypeForFilter = custType;
    getLeadCustomerList({customerFilter: this.customerTypeForFilter}).then(data=>{
    
      this.leadAccData = data;
      
    }).catch(error=> console.log('error is ',error))


  }


    handleLookup(event){
      //console.log('in handle lookup after fire event from csearch component');
      
      var recId='';
      if(event.detail.data){
      
        recId =  event.detail.data.recordId;
        this.accRecId = recId;
      }else{
        this.accRecId ='';
        getLeadCustomerList({customerFilter: this.customerTypeForFilter}).then(data=>{
          
          this.leadAccData = data;
          
        }).catch(error=> console.log('error is ',error))

      }


     
      
      this.searchByCustomerByName(recId,this.ownerRecId);

    }


    showOwnerLookup(event){
      console.log('in show lookup functions');
      this.showLoadingSpinner = true;
      
      let accId = event.currentTarget.dataset.id;      
      let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);
      
      accObj.showOnwerLookup = true;
      accObj.showOnwerText = false;

     setTimeout(() => {
        this.showLoadingSpinner = false;
      }, 1000);

    let tmData = JSON.parse(JSON.stringify(this.leadAccData));
    this.leadAccData = tmData;
    

    }

    handleLookupOwner(event){
       
       
       var recId='';
       if(event.detail.data){
         
         recId =  event.detail.data.recordId;
         this.ownerRecId = recId;
       }else{
        
        this.ownerRecId ='';
          getLeadCustomerList({customerFilter: this.customerTypeForFilter}).then(data=>{
            
            this.leadAccData = data;
           
          }).catch(error=> console.log('error is ',error))
 
       }
       
       this.searchByCustomerByName(this.accRecId,recId);

    }



    searchByCustomerByName(accRecId,ownerRecIds){
      leadCustomerListForSelected({ accId: accRecId, ownerId:ownerRecIds}).then(data=>{
        
        this.leadAccData = data;
        
      }).catch(error=> console.log('error is ',error));
    }

    get options() {
        return [
          { label: 'Dealer', value: 'Dealer' },
          { label: 'B2B', value: 'B2B' },
          { label: 'Farmer', value: 'Farmer' },
          { label: 'Cooperative', value: 'Cooperative' },
          { label: 'Distributor', value: 'Distributor' },
          { label: 'Government', value: 'Government' },
          { label: 'Non-Crop', value: 'Non-Crop' },
          { label: 'Dealer & Retail', value: 'Dealer & Retail' },
          { label: 'Intercompany', value: 'Intercompany' },
          { label: 'Other', value: 'Other' },
          
           
           
        ];


    }

   
   
    
    activeSections = ['A','B'];
    activeSectionsMessage = '';


     
    DragStart(event) {
      this.dragStart = event.target.title;
      event.target.classList.add("drag");
    }
  
    DragOver(event) {
      event.preventDefault();
      return false;
    }
  
    Drop(event) {
      event.stopPropagation();
      const DragValName = this.dragStart;
      const DropValName = event.target.title;
      if (DragValName === DropValName) {
        return false;
      }
      const index = DropValName;
      const currentIndex = DragValName;
      const newIndex = DropValName;
      Array.prototype.move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
      };
      this.ElementList.move(currentIndex, newIndex);
      this.csoElement.move(currentIndex, newIndex);
      this.competitorElement.move(currentIndex, newIndex);
      
    }

    @api recordId;
    get acceptedFormats() {
        return ['.csv'];
    }



    importcsv(event){
      if (event.target.files.length > 0) {
          this.filesUploaded = event.target.files;
          this.filename = event.target.files[0].name;
          
          if (this.filesUploaded.size > this.MAX_FILE_SIZE) {
              this.filename = this.label.File_Size_is_to_long_to_process;
          }else{
            this.uploadHelper();
          } 
  }
  }

   
  uploadHelper() {
    this.file = this.filesUploaded[0];
   if (this.file.size > this.MAX_FILE_SIZE) {

         return ;

    }
    this.showLoadingSpinner = true;
    this.fileReader= new FileReader();
    this.fileReader.onloadend = (() => {
        this.fileContents = this.fileReader.result;
        this.saveToFile();
    });
    this.fileReader.readAsText(this.file);

}


saveToFile() {

  console.log('json file string ',JSON.stringify(this.fileContents));
  
  saveFile({ base64Data: JSON.stringify(this.fileContents), cdbId: this.recordid})
  .then(result => {
      
      
      this.data = result;
      console.log('data after uploading files  ',this.data);
      if(this.data=='ok'){    
      this.fileName = this.fileName + ' - Uploaded Successfully';
      this.isTrue = false;
      this.showLoadingSpinner = false;
      this.dispatchEvent(
          new ShowToastEvent({
              title: 'Success!!',
              message: this.file.name + ' - '+this.label.Uploaded_Successfully,
              variant: 'success',
          }),
          
      );
      location.reload();
    }else{
      this.dispatchEvent(
        new ShowToastEvent({
            title: 'Error!!',
            message: 'Can not be changed sequence or name of columns.',
            variant: 'error',
        }),
        
    );
    this.showLoadingSpinner = false;
    }
  })
  .catch(error => {
      
      this.dispatchEvent(
          new ShowToastEvent({
              title: this.label.Error_while_uploading_File,
              message: error.message,
              variant: 'error',
          }),
      );
      this.showLoadingSpinner = false;
  });

  

}


handleCheckChange(event){
  
 // this.leadAccData[event.target.value].isSelected = event.target.checked;
 this.showLoadingSpinner = true;
  let accId = event.currentTarget.dataset.id; 
  let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);

  let flgCount = event.target.checked;
  
  
  if(flgCount == true){
    this.selectCount = this.selectCount + 1;
    accObj.isSelected = flgCount;
  }else{
    this.selectCount = this.selectCount - 1;
    accObj.isSelected = flgCount;
}


 let tmData = JSON.parse(JSON.stringify(this.leadAccData));
  this.leadAccData = tmData;
  
  setTimeout(() => {
    this.showLoadingSpinner = false;
  }, 1000);
  

 
  


  

}


handleDownload(event){
  
  downloadCSV({ accData: JSON.stringify(this.leadAccData) })
  .then(result => {
  
    let url = result[1]+'/servlet/servlet.FileDownload?file='+result[0];
  
    window.open(url,"_blank" );


    // this.error = undefined;
  })
  .catch(error => {
    // this.error = error;
    // this.accounts = undefined;
  });

}



    handllePathFinder(event){
      let accId = event.currentTarget.dataset.id;
     
    this.pathfindMap[accId]=event.target.checked;
 
      let tmpCheck = event.target.checked;
      
      let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);
      if(tmpCheck){
        accObj.pathFinder = true;
      }else{
        accObj.pathFinder = false;
      }
      
      

      let tmData = JSON.parse(JSON.stringify(this.leadAccData));
          this.leadAccData = tmData;

    }




    handleChangeCustomerType(event){
      let accId = event.currentTarget.dataset.id;      
      
      
     // this.customertypeMap[accId]=event.target.value;
      let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);
      

    let selvalue = event.target.value;

    
    accObj.customerType = selvalue;

    let tmData = JSON.parse(JSON.stringify(this.leadAccData));
    this.leadAccData = tmData;
    
    }



    handleOwnershipChange(event){
      
      let accId = event.currentTarget.dataset.id;      
      
      
     // this.customertypeMap[accId]=event.target.value;
      let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);
      

    let selvalue = event.target.value;
    
    accObj.ownerShipName = selvalue;
      console.log('data of ownership ' , selvalue);
    let tmData = JSON.parse(JSON.stringify(this.leadAccData));
    this.leadAccData = tmData;


    }

    handleUsers(event){
      this.showLoadingSpinner = true;
      
      
      
      let usrName = event.detail.data.record.Name;
      console.log('@@@@ usrName ',usrName );
      if(usrName==undefined){
        usrName ='';
      }

      let accId = event.currentTarget.dataset.id;      
      

      let accObj = this.leadAccData.find(ele=>ele.leadCustomerId==accId);
      var recId='';
      if(event.detail.data){
      
        recId =  event.detail.data.recordId;
      }
      accObj.ownerShip = recId;
      accObj.ownerShipName = usrName;
      accObj.showOnwerLookup = false;
      accObj.showOnwerText = true;

    

       let tmData = JSON.parse(JSON.stringify(this.leadAccData));

       this.leadAccData = tmData;
       setTimeout(() => {
        this.showLoadingSpinner = false;
       }, 1000);
  

    }


    handleSaveClick(event){

      for (var i = 0; i < this.leadAccData.length; i++) {
        

        if (this.leadAccData[i].isSelected) {
          this.accSelectedData.push(this.leadAccData[i]);
        }
      }
       /*  if (!this.leadAccData[i].ownerShip && this.leadAccData[i].isSelected) {
         this.ownerShipBlank.push(this.leadAccData[i]);
          console.log('selected OwnershipNull found  ', this.leadAccData[i]);
        }
      
     if(this.ownerShipBlank.length>0){
        const toastEvent = new ShowToastEvent({
          title:'warning!',
          message:'You cannot remove the ownership',
          variant:'warning'
        });
        this.dispatchEvent(toastEvent);
        setTimeout(() => {
          location.reload();
          
        }, 200);
      }  
else{*/
      console.log('selected account for check box true ',this.accSelectedData);
      this.showLoadingSpinner = true;   

      if(this.leadAccData.length>0){
      
        updateAccountMethod({accountObjList:JSON.stringify(this.accSelectedData)})
        .then(result=>{
         
            
            
            const toastEvent = new ShowToastEvent({
              title:'Success!',
              message:this.label.Account_Saved_successfully,
              variant:'success'
            });
            this.accSelectedData =[];
            this.selectCount =0;
            this.dispatchEvent(toastEvent);
            this.showLoadingSpinner = false;
            location.reload();
        })
        .catch(error=>{
           this.error= error.message;
           window.console.log('Error occure while submitting ',this.error);
        });
      }else{
        

        const toastEvent = new ShowToastEvent({
          title:'Error!',
          message:this.label.Select_atleast_one_record,
          variant:'error'
        });
        this.dispatchEvent(toastEvent);
      }


    //}

   }


   handlePaginationAction(event){
     
     setTimeout(() => {
      this.paginatedLeadAccData = JSON.parse(JSON.stringify(event.detail.values));  
     }, 300);
     

     


   

    
    }

    handleResetClick(event){
    
    this.template.querySelector('c-search-component').handleClose();
    this.template.querySelector('c-lookup-owner').handleClose();
      
    }


    handleSort(event){
      let fieldName = event.target.name;
      
      this.sortDirection = !this.sortDirection;
      this.sortData(fieldName,this.sortDirection);
  }

  sortData(fieldname, direction) {
      direction = direction==true?'asc':'des';
      
      let parseData = JSON.parse(JSON.stringify(this.paginatedLeadAccData));
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
      this.paginatedLeadAccData = parseData;
      }

  }




  }