import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateProductCategoryMapStatus from '@salesforce/apex/GtmProductCompetition.updateProductCategoryMapStatus';
import setIndex from '@salesforce/apex/GtmProductCompetition.setIndex'
import getproductList from '@salesforce/apex/GtmProductCompetition.getproductList';
import checkStatus from '@salesforce/apex/GtmProductCompetition.checkStatus';
export default class GtmProductCategory extends LightningElement {
  @wire (getproductList) gtmWrapList;
  @track productCategorySalesorgMapping = [];
  @track paginatedProductCategorySalesorgMapping = [];
  @track dragStart = '';
  @track lstpscm = [];
  @track  ProductCategoryMapStatusUpdated= [];
  @api
  recordId;
  @track mapDataSave = [];

  
  
    handlePaginationAction (event){
      this.paginatedProductCategorySalesorgMapping=event.detail.values;
    }

    connectedCallback() {
        this.refreshData();

       
  }

  refreshData(){
    getproductList().then(data=>{
      console.log('DATA++++++++++++++',data);
      this.productCategorySalesorgMapping = data;
    }).catch(err=>console.log(err));
 }
  
 handleChangeCheckbox(event){
    console.log(event);
    let res = event.target.checked;
        let key = event.target.dataset.id;
        console.log('res ++++++',res);
        console.log('key++++++++',key);
            

      let pcid = event.target.dataset.pc;
      checkStatus({pcid : pcid}).then(ischecked =>{

        console.log('ischecked++++++++++' ,  ischecked);
        if (ischecked) {

          console.log('ischecked-----+', ischecked);
          if(res){
            let index = this.productCategorySalesorgMapping.findIndex(elem => elem.productCategorySalesOrgMappingId == key);
          console.log('index----', index);
            this.mapDataSave.push(JSON.parse(JSON.stringify(this.productCategorySalesorgMapping[index])));
          }
          else{
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Warning',
                message: 'GTM detail already created',
                variant: 'warning'
              })
            );
            let index = this.productCategorySalesorgMapping.findIndex(elem => elem.productCategorySalesOrgMappingId == key);
          console.log('index----', index);
          console.log('Productindex++++++', this.productCategorySalesorgMapping[index]);
          this.productCategorySalesorgMapping[index].status = true;
         // 
          
          }

          

          setTimeout(() => {
            this.paginatedProductCategorySalesorgMapping = JSON.parse(JSON.stringify(this.productCategorySalesorgMapping));
         
          }, 200);
         
          
        }

        

        else{
          this.paginatedProductCategorySalesorgMapping.forEach(ele => {
               if (ele.productCategorySalesOrgMappingId== key) {
                    let elefound = this.mapDataSave.find(e => e.productCategorySalesOrgMappingId == key);
                    console.log('elefound = ', elefound);
      
                    if (elefound) {
                        console.log('if = ', elefound);
                        elefound.status = res;
                    } else {
                        console.log('else = ', elefound);
                        this.mapDataSave.push(JSON.parse(JSON.stringify(ele)));
                        let elefound1 = this.mapDataSave.find(e => e.productCategorySalesOrgMappingId == key);
                        elefound1.status = res;
                   }
                  
               }
               
            });
            console.log('HIiiiii+++++++'    ,this.mapDataSave);    
        }

      }).catch(err=>console.log(err));
    
      setTimeout(() => {
        this.refreshData();
     
      }, 300);
     
  }

  SavehandleClick(event){ 
      console.log(  'Hello Welcome +++++'  ,this.mapDataSave);
      updateProductCategoryMapStatus({ statusmap:JSON.stringify(this.mapDataSave)}).then(result => {
        console.log('result = ' + result);
        this.refreshData();
      
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Success',
              message: 'Status updated successfully',
              variant: 'success'
           
       })
        );
        
        
        
})
.catch(error => {
     this.dispatchEvent(
        new ShowToastEvent({
           title: 'Error updating status',
          message: error.body.message,
             variant: 'error'
         })
     );
 });
}
      CanclehandleClick(){
  }

  DragStart(event) {
    this.dragStart = String(event.target.id).split('-')[0];
    event.target.classList.add("drag");
    console.log(this.DragStart);
  }

  DragOver(event) {
    event.preventDefault();
    return false;
  }

  Drop(event) {
    event.stopPropagation();
    const DragValName = this.dragStart;
    const DropValName = String(event.target.id).split('-')[0];
    console.log('41', this.DragStart);
    if (DragValName === DropValName) {
      return false;
    }
    const index = DropValName;
    const currentIndex = DragValName;
    const newIndex = DropValName;
    Array.prototype.move = function (from, to) {
      this.splice(to, 0, this.splice(from, 1)[0]);

    };

    
    let test = JSON.parse(JSON.stringify(this.paginatedProductCategorySalesorgMapping));
    //console.log('Welcome', test);
    this.paginatedProductCategorySalesorgMapping = test;
   //console.log('Hello ', this.paginatedProductCategorySalesorgMapping);
    this.paginatedProductCategorySalesorgMapping.move(currentIndex, newIndex);
    //this.productCategorySalesorgMapping.move(currentIndex, newIndex);

    setTimeout(() => {
      
   
   let categorySalesorgMapping = []; 
    console.log('currentIndex++++++++++'+currentIndex );
    console.log('newIndex----------------',newIndex );

   this.productCategorySalesorgMapping.forEach(ele=>{
     console.log('Index--++--' , this.template.querySelector('[data-pscm="' + ele.productCategorySalesOrgMappingId + '"]').id);
    
     
    let obj = {
      Id:ele.productCategorySalesOrgMappingId,
      Category_index__c:String(this.template.querySelector('[data-pscm="' + ele.productCategorySalesOrgMappingId + '"]').id).split('-')[0]
    }
    categorySalesorgMapping.push(obj);
    console.log('Obj--++--', obj);
   })
    setIndex({pscm:JSON.stringify(categorySalesorgMapping)}).then(data=>{
      console.log('Index Changed ===');
    })
  }, 500);
  }
}

  