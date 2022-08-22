public with sharing class GTMOutlook {
	private static boolean isSalesRep = GTMPathFinder.isSalesRep;
      @AuraEnabled
      public static List<GTM_Details__c> getGTMOutlook(String year){
      Id gtmOutlookRecordType = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Outlook').getRecordTypeId();
       List<Account> accList = GTMPathFinder.getGTMCustomers();
       Sales_Org__c salesorg = GTMPathFinder.getSalesOrg();
       String fiscalYear = year;
       List<GTM__c> gtmList = [Select Id, Sales_Org__c, Fiscal_Year__c, Sales_Rep__c From GTM__c 
                               WHERE Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c AND Fiscal_Year__c=:fiscalYear AND Sales_Rep__c=:userInfo.getUserId()];
      
       User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Id,UserRole.Name,UGDN_Number__c FROM User where Id=:userInfo.getUserId()];

       System.debug('List Of gtm--->' +gtmList); 
       GTM__c gtm;
       if(gtmList.size()==0 && Schema.sObjectType.GTM__c.isCreateable() && isSalesRep){
        gtm = new GTM__c();
        gtm.Fiscal_Year__c = fiscalYear;
        gtm.GTM_Status__c = 'Draft';
        gtm.Sales_Org__c = salesorg.Id;
        gtm.Sales_Rep__c = userInfo.getUserId();
        gtm.Sales_Rep_Name__c = userInfo.getName();
        gtm.Combination_key__c = userDetails.UGDN_Number__c+fiscalYear+salesOrg.Sales_Org_Code__c;
        System.debug('insert Details ');
        insert gtm;
       }else{
           gtm = isSalesRep==true?gtmList[0]:null;
           System.debug('Please provide GTM__c');
       }
       List<GTM_Details__c> gtmDetailsList = new List<GTM_Details__c>();
       GTMPathFinderHelper.createOutlookDetails(gtm,gtmOutlookRecordType,accList);
       
        gtmDetailsList = [Select Id, GTM_Customer__r.Name, GTM_Customer__c,GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c,GTM_Customer__r.Lead_Customer__c,Estimated_Growth_NY_to_2NY__c, Estimated_Growth_PY_to_CY__c, Estimated_Growth_PY_to_NY__c, Sales_Org__c,GTM_Customer__r.Path_Finder__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c WHERE GTM__r.Fiscal_Year__c=:fiscalYear AND recordTypeId=:gtmOutlookRecordType AND Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c order by  GTM_Customer__r.Name ASC];
         return gtmDetailsList;
    }

    @AuraEnabled
    public static GTM_Details__c updateGtmDetails(String apiName, String value, String recordId){
      System.debug('apiName :'+apiName+' value:'+value+' recordId '+recordId);
    GTM_Details__c updateGtmDetails = [Select Id,GTM_Customer__c,GTM_Customer__r.Path_Finder__c,GTM_Customer__r.Name,GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c,Estimated_Growth_NY_to_2NY__c,Estimated_Growth_PY_to_CY__c,Estimated_Growth_PY_to_NY__c, Sales_Org__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c WHERE Id=:recordId];

      if(apiName=='Estimated_Growth_PY_to_CY__c')
      {
       updateGtmDetails.Estimated_Growth_PY_to_CY__c = value!=null?decimal.valueof(value):null;
      }
      else if(apiName=='Estimated_Growth_PY_to_NY__c')
      {
        updateGtmDetails.Estimated_Growth_PY_to_NY__c = value!=null?decimal.valueof(value):null;
      }
      else if(apiName=='Estimated_Growth_NY_to_2NY__c')
      {
        updateGtmDetails.Estimated_Growth_NY_to_2NY__c = value!=null?decimal.valueof(value):null;
      }
       update updateGtmDetails;
       System.debug('updateGtmDetails :'+updateGtmDetails);
       return updateGtmDetails;

    }

    @AuraEnabled(cacheable=true)
    public static GTM_Country_Configuration__c getInstructions(){
      
      //Get Sales Org
      Sales_Org__c salesorg = GTMPathFinder.getSalesOrg();

      List<GTM_Country_Configuration__c> gcc = [select Id,Name ,Instruction_Outlook__c,Sales_Org__c from GTM_Country_Configuration__c where Sales_Org__c=:salesorg.Id];
        if(gcc.size()>0){
            return gcc[0];
        }
        return null;
    }

    
    /*
    * @Description  This method used to get FAQ information
    * @return       returns GTM_Country_Configuration__c having Sales oeg and FAQ details.
    */
    @AuraEnabled(cacheable=true)
    public static GTM_Country_Configuration__c getFaq(){
      Sales_Org__c salesorg = GTMPathFinder.getSalesOrg();
      List<GTM_Country_Configuration__c> gccfaqList = [Select Id, Name,Instruction_FAQ__c,Sales_Org__c from GTM_Country_Configuration__c Where Sales_Org__c=:salesorg.Id];
      if (gccfaqList.size()>0) {
        return gccfaqList[0];
      }
      return null;
    }
 }