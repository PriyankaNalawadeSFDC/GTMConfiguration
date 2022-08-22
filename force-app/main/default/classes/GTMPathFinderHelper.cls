/*******************************************************************************************
* @Name         GTM Path Finder 
* @Author       Sandeep Vishwakarma <sandeep.vishwakarma@skinternational.com>
* @Date         03/08/2022
* @Group        SKI
* @Description  This class contains all service methods related to GTM Path Finder used for creating GTM and GTM Details, Accessing GTM Configuration data like intrustion,window period. 
*******************************************************************************************/
/* MODIFICATION LOG
* Version          Developer          Date(MM/DD/YYYY)      Description
*-------------------------------------------------------------------------------------------
*  1.0              Sandeep              03/14/2022           Initial Creation                                                      
*******************************************************************************************/
public without sharing class GTMPathFinderHelper {
    private static String fiscalyear = GTMPathFinder.fiscalyear;
    private static Sales_Org__c  salesOrg = GTMPathFinder.salesOrg;
    private static boolean isSalesRep = GTMPathFinder.isSalesRep;
    @AuraEnabled(cacheable=true)
    public static List<GTM_Details__c> getGTMDetailsToDisable(String recordTypeName){
        Id detailRecordType = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();
        List<GTM_Details__c> gtmDetailsToDisable = new List<GTM_Details__c>();
        List<String> allCustomersId = new List<String>();
        List<GTM_Details__c> allGtmDetails = new List<GTM_Details__c>();
        List<GTM_Details__c> allGtmDetailsToDisable = new List<GTM_Details__c>();
        System.debug('isSalesRep '+isSalesRep);
        if(isSalesRep && Schema.sObjectType.GTM_Details__c.isAccessible()){
            allGtmDetails = [Select Id,recordTypeId,Name,GTM_Customer__c,GTM_Customer__r.Name,GTM_Customer__r.Path_Finder__c,GTM_Customer__r.Lead_Customer__c,GTM_Customer__r.Lead_Customer_Type__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c where GTM__r.Fiscal_Year__c=:fiscalyear and GTM__r.Sales_Org__c=:salesOrg.Id and GTM__r.Sales_Rep__c=:userInfo.getUserId() and recordTypeId=:detailRecordType];
            List<Account> allCustomers = GTMPathFinder.getGTMCustomers();
            for(Account a:allCustomers){
                allCustomersId.add(a.Id);
            }
            for(GTM_Details__c g:allGtmDetails){
                if(!allCustomersId.contains(g.GTM_Customer__c)){
                    gtmDetailsToDisable.add(g);
                }
            }
            System.debug('gtmDetailsToDisable '+gtmDetailsToDisable);
            allGtmDetailsToDisable = gtmDetailsToDisable;
        }else{
            allGtmDetails = GTMPathFinder.getAllDetailsDetailsToDisable(detailRecordType);
            allGtmDetailsToDisable = allGtmDetails;
        }
        return allGtmDetailsToDisable;
    }

    public static List<Account> getGTMSalesRepCustomer(String leadcustomerRecordType,String nonleadcustomerRecordType,String salesorgCode){
        List<Account> gtmCustomers = new List<Account>();
        List<Account> leadCustomerList = new List<Account>();
        List<Account> nonLeadCustomerList = new List<Account>();
        if(Schema.sObjectType.Account.isAccessible()){
            leadCustomerList = [select Id,Name,Lead_Customer_Type__c,SAP_Code__c from Account where Sales_Org_Code__c=:salesorgCode and Account_Type__c='Sold To Party' and recordType.Id=:leadcustomerRecordType and Lead_Customer_Ownership__c=:userInfo.getUserId()];
            System.debug('Lead Customer '+leadCustomerList);
            if(salesOrg.Sales_Org_Code__c!='5191'){
            nonLeadCustomerList = [select Id,Name,Lead_Customer_Type__c,SAP_Code__c from Account where Sales_Org_Code__c=:salesorgCode and Account_Type__c='Sold To Party' and Lead_Customer__c=null and Lead_Customer_Ownership__c=:userInfo.getUserId() and recordTypeId=:nonleadcustomerRecordType];
            }else{
                nonLeadCustomerList = [select Id,Name,Lead_Customer_Type__c,SAP_Code__c from Account where Sales_Org_Code__c=:salesOrg.Sales_Org_Code__c and Account_Type__c='Sold To Party' and Lead_Customer__c='001' and recordTypeId=:nonleadcustomerRecordType  and Lead_Customer_Ownership__c=:userInfo.getUserId()];
            }
            System.debug('non lead '+nonLeadCustomerList);
            gtmCustomers.addAll(leadCustomerList);
            gtmCustomers.addAll(nonLeadCustomerList);
        }
        System.debug('GTM Customer size'+gtmCustomers.size());
        return gtmCustomers;
    }

    public static void createGTMPotentialAndProfile(GTM__c gtm){
        Id recordTypePotentialProfile = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Profile & Potential').getRecordTypeId();
        List<GTM_Details__c> gtmDetails = new List<GTM_Details__c>();
        List<Account> listAccounts = GTMPathFinder.getGTMCustomers();
        for(Account acc:listAccounts){
            GTM_Details__c gtmd = new GTM_Details__c();
            gtmd.GTM_Customer__c = acc.Id;
            gtmd.recordTypeId = recordTypePotentialProfile;
            gtmd.GTM_Customer_Type__c = acc.Lead_Customer_Type__c;
            gtmd.GTM__c = gtm.Id;
            gtmd.Sales_Org__c = salesorg.Id;
            gtmd.Combination_key__c = acc.SAP_Code__c+'PotentialProfile'+gtm.Fiscal_Year__c;
            gtmDetails.add(gtmd);
            System.debug('Combination Key PotentialProfile '+gtmd.Combination_key__c);
        }
        System.debug('PotentialProfile '+gtmDetails.size());
        if(Schema.sObjectType.GTM_Details__c.isCreateable() && isSalesRep){
            insert gtmDetails;
        }
    }

    public static List<GTM_Details__c> createGTMAndDetailsProductAllocation(String year){
        List<GTM_Details__c> gtmDetails = new List<GTM_Details__c>();
        Id userId = userInfo.getUserId();
        List<GTM__c> gtms = new  List<GTM__c>();
        User userDetails = new User();
        if(Schema.sObjectType.GTM__c.isAccessible() && Schema.sObjectType.User.isAccessible()){
            gtms = [SELECT ID,Name,Fiscal_Year__c from GTM__c where Fiscal_Year__c=:year and Sales_Org__c=:salesOrg.Id and Sales_Rep__c=:userId];
            userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Id,UserRole.Name,UGDN_Number__c FROM User where Id=:userId ];
        }
        GTM__c gtm = new GTM__c();
        if(gtms.size()==0 && validateYear(year)){
            gtm.Fiscal_Year__c = year;
            gtm.GTM_Status__c = 'Draft';
            gtm.Sales_Org__c = salesOrg.Id;
            gtm.Sales_Rep__c = userInfo.getUserId();
            gtm.Sales_Rep_Name__c = userInfo.getName();
            gtm.Role__c = userDetails.UserRole.Name;
            gtm.Combination_key__c = userDetails.UGDN_Number__c+year+salesOrg.Sales_Org_Code__c;
            if(Schema.sObjectType.GTM__c.isCreateable()){
                System.debug('Create GTM');
                insert gtm;
                gtms.add(gtm);
            }else{
                System.debug('Please provide GTM__c Create Access to the profile');
            }
        }
        //Creating GTM_Details__c
        Id recordTypeProductCategory = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Product Category Allocation').getRecordTypeId();
        System.debug('recordTypeProductCategory '+recordTypeProductCategory);
        List<GTM_Details__c> gtmPotentialProfile = new List<GTM_Details__c>();
        if(GTMPathFinder.isGTMProfileAndPotentialCreated(year)==false && isSalesRep){
            createGTMPotentialAndProfile(gtms[0]);
        }
        gtmPotentialProfile = GTMPathFinder.getGTMPotentialProfile(year);
        Map<String,GTM_Details__c> mapPotentialProfile = new  Map<String,GTM_Details__c>();
        for(GTM_Details__c gtm1:gtmPotentialProfile){
            mapPotentialProfile.put(gtm1.GTM_Customer__c,gtm1);
        }
        List<Product_Category__c> listProductCategory = GTMPathFinder.getActiveProductCategory();
        List<Account> listAccounts = GTMPathFinder.getGTMCustomers();
        for(Account acc:listAccounts){
            for(Product_Category__c pc:listProductCategory){
                System.debug('For loop Product_Category__c '+pc);
                GTM_Details__c gtmDetail = new GTM_Details__c();
                gtmDetail.recordTypeId = recordTypeProductCategory;
                gtmDetail.Product_Category__c = pc.Id;
                gtmDetail.GTM_Customer__c = acc.Id;
                gtmDetail.Sales_Org__c = salesOrg.Id;
                gtmDetail.GTM__c = gtms[0].Id;
                gtmDetail.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
                gtmDetail.Combination_key__c = acc.SAP_Code__c+'ProductCategoryAllocation'+pc.Product_Category_Code__c+gtms[0].Fiscal_Year__c;
                gtmDetails.add(gtmDetail);
            }
        }
        if(Schema.sObjectType.GTM_Details__c.isCreateable() && isSalesRep){
            insert gtmDetails;
        }else{
            System.debug('Please provide GTM_Details__c Create Access to the profile');
        } 
    return GTMPathFinder.getGTMDetailsProduct(year);
    }

    @AuraEnabled
    public static List<GTM_Details__c> createGTMAndDetailsCropAllocation(List<Crop__c> activeCrops,String year){
        
        List<GTM_Details__c> gtmDetails = new List<GTM_Details__c>();
        Id userId = userInfo.getUserId();
        List<GTM__c> gtms = new  List<GTM__c>();
        gtms = [SELECT ID,Name,Fiscal_Year__c from GTM__c where Fiscal_Year__c=:year and Sales_Org__c=:salesOrg.Id and Sales_Rep__c=:userId];
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Id,UserRole.Name,UGDN_Number__c FROM User where Id=:userId ];
        GTM__c gtm = new GTM__c();
        if(gtms.size()==0 && validateYear(year)){
            gtm.Fiscal_Year__c = year;
            gtm.GTM_Status__c = 'Draft';
            gtm.Sales_Org__c = salesOrg.Id;
            gtm.Sales_Rep__c = userInfo.getUserId();
            gtm.Sales_Rep_Name__c = userInfo.getName();
            gtm.Role__c = userDetails.UserRole.Name; //TODO: Need to set user role using Query
            gtm.Combination_key__c = userDetails.UGDN_Number__c+year+salesOrg.Sales_Org_Code__c;
            if(Schema.sObjectType.GTM__c.isCreateable() && !String.isEmpty(year)){
                System.debug('Create GTM');//TODO
                insert gtm;
                gtms.add(gtm);
            }else{
                System.debug('Please provide GTM__c Create Access to the profile');
            }
        }
        List<GTM_Details__c> gtmPotentialProfile = new List<GTM_Details__c>();
        if(GTMPathFinder.isGTMProfileAndPotentialCreated(year)==false && isSalesRep){
            GTMPathFinderHelper.createGTMPotentialAndProfile(gtms[0]);
        }
        gtmPotentialProfile = GTMPathFinder.getGTMPotentialProfile(year);
        Map<String,GTM_Details__c> mapPotentialProfile = new  Map<String,GTM_Details__c>();
        for(GTM_Details__c gtm1:gtmPotentialProfile){
            mapPotentialProfile.put(gtm1.GTM_Customer__c,gtm1);
        }
        //Creating GTM_Details__c
        Id recordTypeCropAllocation = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Crop Allocation').getRecordTypeId();
        System.debug('recordTypeCropAllocation '+recordTypeCropAllocation);
        List<Account> listAccount = GTMPathFinder.getGTMCustomers();
        for(Account acc:listAccount){
            for(Crop__c crop:activeCrops){
                System.debug('For loop Crop__c '+crop);
                GTM_Details__c gtmDetail = new GTM_Details__c();
                gtmDetail.recordTypeId = recordTypeCropAllocation;
                gtmDetail.Crop__c = crop.Id;
                gtmDetail.GTM_Customer__c = acc.Id;
                gtmDetail.Sales_Org__c = salesOrg.Id;
                gtmDetail.GTM__c = gtms[0].Id;
                gtmDetail.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
                gtmDetail.Combination_key__c = acc.SAP_Code__c+'CropAllocation'+crop.Crop_Code__c+gtms[0].Fiscal_Year__c;
                gtmDetails.add(gtmDetail);
            }
        }
        if(Schema.sObjectType.GTM_Details__c.isCreateable() && isSalesRep){
            insert gtmDetails;
        }else{
            System.debug('Please provide GTM_Details__c Create Access to the profile');
        } 
    return GTMPathFinder.getGTMDetailsCrop(year);
   }

   @AuraEnabled
   public static string createNewCustomerDetails(String newAccounts){
       Id userId = userInfo.getUserId();
       System.debug('SOQL Query>>>>' +[SELECT ID,Name,Fiscal_Year__c from GTM__c where Fiscal_Year__c=:fiscalyear and Sales_Org__c=:salesOrg.Id and Sales_Rep__c=:userId limit 1]);
       GTM__c gtm = [SELECT ID,Name,Fiscal_Year__c from GTM__c where Fiscal_Year__c=:fiscalyear and Sales_Org__c=:salesOrg.Id and Sales_Rep__c=:userId limit 1];
       

       Map<String,GTM_Details__c> mapPotentialProfile = new  Map<String,GTM_Details__c>();
       List<Account> newCustomers = (List<Account>)JSON.deserialize(newAccounts,List<Account>.class);

       Id recordTypePotentialProfile = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Profile & Potential').getRecordTypeId();
       Id recordTypeCropAllocation = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Crop Allocation').getRecordTypeId();
       Id recordTypeProductCategory = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Product Category Allocation').getRecordTypeId();
       Id recordTypeCompetition = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
       Id recordTypeOutlook = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Outlook').getRecordTypeId();

       List<GTM_Details__c> gtmDetails = new List<GTM_Details__c>();
       //Create Potential Profile for newly added customers
       for(Account acc:newCustomers){
           GTM_Details__c gtmd = new GTM_Details__c();
           gtmd.GTM_Customer__c = acc.Id;
           gtmd.recordTypeId = recordTypePotentialProfile;
           gtmd.GTM_Customer_Type__c = acc.Lead_Customer_Type__c;
           gtmd.GTM__c = gtm.Id;
           gtmd.Sales_Org__c = salesorg.Id;
           gtmd.Combination_key__c = acc.SAP_Code__c+'PotentialProfile'+gtm.Fiscal_Year__c;
           gtmDetails.add(gtmd);
       }
       if(isSalesRep){
           insert gtmDetails;
       }
       
       for(GTM_Details__c gtm1:gtmDetails){
           mapPotentialProfile.put(gtm1.GTM_Customer__c,gtm1);
       }
       // Create Crop Allocation for newly added Customers
       List<Crop__c> listCrops = GTMPathFinder.getActiveCrop();
       gtmDetails.clear();
       for(Account acc:newCustomers){
           for(Crop__c crop:listCrops){
               System.debug('For loop Crop__c '+crop);
               GTM_Details__c gtmDetail = new GTM_Details__c();
               gtmDetail.recordTypeId = recordTypeCropAllocation;
               gtmDetail.Crop__c = crop.Id;
               gtmDetail.GTM_Customer__c = acc.Id;
               gtmDetail.Sales_Org__c = salesOrg.Id;
               gtmDetail.GTM__c = gtm.Id;
               gtmDetail.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
               gtmDetail.Combination_key__c = acc.SAP_Code__c+'CropAllocation'+crop.Crop_Code__c+gtm.Fiscal_Year__c;
               gtmDetails.add(gtmDetail);
           }
       }
       if(isSalesRep){
       insert gtmDetails;
       }

       // Create Product Allocation for newly added Customers
       List<Product_Category__c> listProductCategory = GTMPathFinder.getActiveProductCategory();
       gtmDetails.clear();
       for(Account acc:newCustomers){
           for(Product_Category__c pc:listProductCategory){
               System.debug('For loop Product_Category__c '+pc);
               GTM_Details__c gtmDetail = new GTM_Details__c();
               gtmDetail.recordTypeId = recordTypeProductCategory;
               gtmDetail.Product_Category__c = pc.Id;
               gtmDetail.GTM_Customer__c = acc.Id;
               gtmDetail.Sales_Org__c = salesOrg.Id;
               gtmDetail.GTM__c = gtm.Id;
               gtmDetail.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
               gtmDetail.Combination_key__c = acc.SAP_Code__c+'ProductCategoryAllocation'+pc.Product_Category_Code__c+gtm.Fiscal_Year__c;
               gtmDetails.add(gtmDetail);
           }
       }
       if(isSalesRep){
       insert gtmDetails;
       }

       // Create Competition for newly added Customers
       gtmDetails.clear();
       for(Account acc:newCustomers){
           GTM_Details__c gtmd = new GTM_Details__c();
           gtmd.recordTypeId = recordTypeCompetition;
           gtmd.GTM_Customer__c = acc.Id;
           gtmd.GTM__c=gtm.Id;
           gtmd.Sales_Org__c=salesOrg.Id;
           gtmd.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
           gtmd.Combination_key__c = acc.SAP_Code__c+'Competition'+gtm.Fiscal_Year__c;
           gtmDetails.add(gtmd);
       }
       if(isSalesRep){
       insert gtmDetails;
       }

       //Create outlook 
       gtmDetails.clear();
       for(Account acc :newCustomers){
           GTM_Details__c gtmDetailsTemp = new GTM_Details__c();
           gtmDetailsTemp.recordTypeId = recordTypeOutlook;
           gtmDetailsTemp.GTM_Customer__c = acc.Id;
           gtmDetailsTemp.Sales_Org__c = salesorg.Id;
           gtmDetailsTemp.GTM__c = gtm.Id;
           gtmDetailsTemp.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
           gtmDetailsTemp.Combination_key__c = acc.SAP_Code__c+'Outlook'+gtm.Fiscal_Year__c;
           gtmDetails.add(gtmDetailsTemp);
        }
        if(isSalesRep){
        insert gtmDetails;
        }
        return '';
   }

   public static List<GTM_Details__c> createGTMDetail(String year){
    List<Account> gtmCustomers = GTMPathFinder.getGTMCustomers();
    System.debug('The Gtm Customer size' +gtmCustomers.size());
    List<GTM_Details__c> gtmDetailstToInsert = new List<GTM_Details__c>();
    Id competitorRecordType = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
    List<GTM__c> gtms = new  List<GTM__c>();
    Id userId = userInfo.getUserId();
        gtms = [SELECT ID,Name,Fiscal_Year__c,Email__c from GTM__c where Fiscal_Year__c=:year and Sales_Org__c=:salesOrg.Id and Sales_Rep__c=:userId];
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Id,UserRole.Name,UGDN_Number__c FROM User where Id=:userId ];
        GTM__c gtm = new GTM__c();
        if(gtms.size()==0 && validateYear(year)){
            gtm.Fiscal_Year__c = year;
            gtm.GTM_Status__c = 'Draft';
            gtm.Sales_Org__c = salesOrg.Id;
            gtm.Sales_Rep__c = userInfo.getUserId();
            gtm.Sales_Rep_Name__c = userInfo.getName();
            gtm.Role__c = userDetails.UserRole.Name;
            gtm.Email__c=userDetails.Email;
            gtm.Combination_key__c = userDetails.UGDN_Number__c+year+salesOrg.Sales_Org_Code__c;
            if(Schema.sObjectType.GTM__c.isCreateable() && isSalesRep){
                System.debug('Create GTM');
                insert gtm;
                gtms.add(gtm);
            }else{
                System.debug('Please provide GTM__c Create Access to the profile');
            }
        }
        List<GTM_Details__c> gtmPotentialProfile = new List<GTM_Details__c>();
        if(GTMPathFinder.isGTMProfileAndPotentialCreated(year)==false && isSalesRep){
            GTMPathFinderHelper.createGTMPotentialAndProfile(gtms[0]);
        }
        gtmPotentialProfile = GTMPathFinder.getGTMPotentialProfile(year);

        Map<String,GTM_Details__c> mapPotentialProfile = new  Map<String,GTM_Details__c>();
        for(GTM_Details__c gtm1:gtmPotentialProfile){
            mapPotentialProfile.put(gtm1.GTM_Customer__c,gtm1);
        }



    for(Account acc:gtmCustomers){
        if(gtms.size()>0){
            GTM_Details__c gtmd = new GTM_Details__c();
            gtmd.recordTypeId = competitorRecordType;
            gtmd.GTM_Customer__c = acc.Id;
            gtmd.GTM__c=gtms[0].Id;
            gtmd.Sales_Org__c=salesorg.Id;
            gtmd.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
            gtmd.Combination_key__c = acc.SAP_Code__c+'Competition'+gtms[0].Fiscal_Year__c;
            gtmDetailstToInsert.add(gtmd);

        }
    }
    if(gtms.size()>0 && isSalesRep){
        insert gtmDetailstToInsert;
    }
    List<GTM_Details__c> gtmDetails =[select GTM_Customer__c, GTM_Customer__r.Name,GTM_Customer__r.Lead_Customer__c,Competitor_Name_1__c,Competitor_Name_1__r.Name,Indicate_share_wallet_of_competitor_1__c,Competitor_Name_2__c,Indicate_share_wallet_of_competitor_2__c,Competitor_Name_3__c,Indicate_share_wallet_of_competitor_3__c,Competitor_Name_4__c,Indicate_share_wallet_of_competitor_4__c,Competitor_Name_5__c,Indicate_share_wallet_of_competitor_5__c,Competitor_Name_6__c,Indicate_share_wallet_of_competitor_6__c,Competitor_Name_7__c,Indicate_share_wallet_of_competitor_7__c,Competitor_Name_8__c,Indicate_share_wallet_of_competitor_8__c,UPL_Position__c,UPLs_share_of_wallet__c,Competitor_Name_2__r.Name,Competitor_Name_3__r.Name,Competitor_Name_4__r.Name,Competitor_Name_5__r.Name,Competitor_Name_6__r.Name,Competitor_Name_7__r.Name,Competitor_Name_8__r.Name,GTM_Customer__r.Path_Finder__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c where recordTypeId=:competitorRecordType and  Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c AND 
    GTM__r.Sales_Rep__c=:userInfo.getUserId() AND GTM__r.Fiscal_Year__c=:year order by  GTM_Customer__r.Name ASC];
    System.debug('Gtm details size' +gtmDetails.size());
    return gtmDetails;
  }

  public static void createOutlookDetails(GTM__c gtm,String gtmOutlookRecordType,List<Account> accList){
    List<GTM_Details__c> gtmPotentialProfile = new List<GTM_Details__c>();
         if(GTMPathFinder.isGTMProfileAndPotentialCreated(gtm.Fiscal_Year__c)==false && isSalesRep){
          GTMPathFinderHelper.createGTMPotentialAndProfile(gtm);
         }
         gtmPotentialProfile = GTMPathFinder.getGTMPotentialProfile(gtm.Fiscal_Year__c);
          Map<String,GTM_Details__c> mapPotentialProfile = new  Map<String,GTM_Details__c>();

         for(GTM_Details__c gtm1:gtmPotentialProfile){
           mapPotentialProfile.put(gtm1.GTM_Customer__c,gtm1);
          }	

          List<GTM_Details__c> gtmDetailsList = [Select Id, GTM_Customer__r.Name, GTM_Customer__c,GTM_Customer__r.Lead_Customer__c, Estimated_Growth_NY_to_2NY__c,Estimated_Growth_PY_to_CY__c, GTM_Details__r.Total_Purchase_of_Crop_Protection_PY__c,
          Estimated_Growth_PY_to_NY__c, Sales_Org__c,GTM_Customer__r.Path_Finder__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c 
                                 WHERE GTM__r.Fiscal_Year__c=:gtm.Fiscal_Year__c AND recordTypeId=:gtmOutlookRecordType AND 
                                       Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c AND 
                                       GTM__r.Sales_Rep__c=:userInfo.getUserId()];
        
     System.debug('List Of gtmDetails--->' +gtmDetailsList.size());

       if (gtmDetailsList.size()==0 && Schema.sObjectType.GTM_Details__c.isCreateable() && isSalesRep) {
          for(Account acc :accList){
              system.debug('Inside For Loop' +acc);
                  //Create GTM Details
                   GTM_Details__c gtmDetailsTemp = new GTM_Details__c();
                   gtmDetailsTemp.recordTypeId = gtmOutlookRecordType;
                   gtmDetailsTemp.GTM_Customer__c = acc.Id;
                   gtmDetailsTemp.Sales_Org__c = salesorg.Id;
                   gtmDetailsTemp.GTM__c = gtm.Id;
                   gtmDetailsTemp.GTM_Details__c = mapPotentialProfile.get(acc.Id).Id;
                   gtmDetailsTemp.Combination_key__c = acc.SAP_Code__c+'Outlook'+gtm.Fiscal_Year__c;
                   gtmDetailsList.add(gtmDetailsTemp);
          }
          insert gtmDetailsList;
          }else{
              System.debug('Please provide GTM_Details__c');
          }
  }

  @AuraEnabled
 public static List<GTMCompetition.CompetitorWrapper> getCompetitorDetails(){
     List<Competitior_Sales_Org_Mapping__c> comp= new List<Competitior_Sales_Org_Mapping__c>();
     if(Schema.sObjectType.Competitior_Sales_Org_Mapping__c.isAccessible()){
        comp = [Select Id, Competitor__r.Name ,Display_Name__c,Status__c,Competitor__c from Competitior_Sales_Org_Mapping__c where Status__c ='Active' and Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c];
     }
     List<GTMCompetition.CompetitorWrapper> wrap=new List <GTMCompetition.CompetitorWrapper>();
     for(Competitior_Sales_Org_Mapping__c  a:comp) {
        GTMCompetition.CompetitorWrapper wrapper =new GTMCompetition.CompetitorWrapper();   
         if(!String.isEmpty(a.Display_Name__c)){
             wrapper.competitiorId=a.Competitor__c;
             wrapper.competitiorname=a.Display_Name__c;
         }
         else{
            wrapper.competitiorId=a.Competitor__c;
            wrapper.competitiorname=a.Competitor__r.Name;
        }
        wrap.add(wrapper);
     }
     return wrap;
 }

 @AuraEnabled
    public static boolean isWindowPeriodClosed(){
        List<String>  months = new List<String>{'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'};
        GTM_Country_Configuration__c gcc = new GTM_Country_Configuration__c();
        if(Schema.sObjectType.GTM_Country_Configuration__c.isAccessible()){
        gcc = [select Id,Start_Day__c,Start_Month__c,End_Day__c,End_Month__c  from GTM_Country_Configuration__c where Sales_Org__c=:salesOrg.Id  limit 1];
        }
        System.debug('gcc'+gcc);
        Date currentDate = Date.today();
        Integer startMonth = months.indexOf(gcc.Start_Month__c)+1;
        Integer endMonth = months.indexOf(gcc.End_Month__c)+1;
        Integer startDay = Integer.valueOf(gcc.Start_Day__c);
        Integer endDay = Integer.valueOf(gcc.End_Day__c);
        Integer currentMonth = currentDate.month();
        Integer currentDay = currentDate.day();
        System.debug('startMonth'+startMonth);
        System.debug('endMonth'+endMonth);
        System.debug('startDay'+startDay);
        System.debug('endDay'+endDay);
        System.debug('currentMonth'+currentMonth);
        System.debug('currentDay'+currentDay);
        if(currentDay>=startDay && currentDay<=endDay && currentMonth>=startMonth && currentMonth<=endMonth){//Users are allowed to edit records
            return false;
        }else{// Disable editing records
            return true;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static GTM_Country_Configuration__c getInstructions(){
        List<GTM_Country_Configuration__c> gcc = null; 
        if(Schema.sObjectType.GTM_Country_Configuration__c.isAccessible()){
            gcc = [select Id,Name ,Instruction_Profile_Potential__c,Instruction_Product_Category_Allocatio__c,Instruction_Crop_Allocation__c,Instruction_Competitor__c,Instruction_Identification__c,Instruction_FAQ__c,Instruction_Outlook__c,Countries__c,UPL_Competitor__c from GTM_Country_Configuration__c where Sales_Org__c=:salesOrg.Id];
        }
        if(gcc.size()>0){
            return gcc[0];
        }
        return null;
    }

    @AuraEnabled
    public static GTM_Details__c  updateGTMDetails(GTM_Details__c upgtm)
    {
      update upgtm;
      return upgtm;
   }

   @AuraEnabled(cacheable=true)
   public static string getHigherAuthoritiesProfiles(){
        PathFinderProfiles__mdt higherAuthoritiesProfiles = PathFinderProfiles__mdt.getInstance('HigherAuthoritiesProfiles');
        // System.debug('higherAuthoritiesProfiles '+higherAuthoritiesProfiles);
        return String.valueOf(higherAuthoritiesProfiles.ProfileName__c);
   }

   @AuraEnabled(cacheable=true)
   public static string getMyProfile(){
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Id,UserRole.Name,UGDN_Number__c FROM User where Id=:UserInfo.getUserId() ];
        return userDetails.Profile.Name;
   }
  
   public static boolean validateYear(String year){
        return year.contains('-');
   }
}