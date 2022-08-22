/*******************************************************************************************
* @Name         GTM Path Finder 
* @Author       Sandeep Vishwakarma <sandeep.vishwakarma@skinternational.com>
* @Date         03/08/2022
* @Group        SKI
* @Description  Test class for GTMPathFinder and GTMPathFinderHelper class
*******************************************************************************************/
/* MODIFICATION LOG
* Version          Developer         Date(MM/DD/YYYY)      Description
*-------------------------------------------------------------------------------------------
*  1.0              Sandeep             03/08/2022           Initial Creation    
*-------------------------------------------------------------------------------------------
*  1.1              Sandeep             14/08/2022           update (Adding Helper class)                                         
*******************************************************************************************/
@isTest
public without sharing class GTMPathFinderTest {
    public static Sales_Org__c salesOrg = createSalesOrg();
    public static User argentinaUser = createuser();
    public static Id loggedInUserId = argentinaUser.Id;
    public static Login_Country__c loginCountry = createLoginCountry();
    public static List < Account > gtmCustomers = createGTMCustomers();
    //public static List < Product_Category_Sales_Org_Mapping__c > pcsm = createProductSalesOrgMapping();
    public static List < Crop__c > crops = createCrops();
    static String fiscalYear = '2022-2023';



    @isTest
    public static void testGetPotentialAndProfile() {
        System.runAs(argentinaUser) {
            List < GTM_Details__c > gtmPotentialAndProfile = GTMPathFinder.getPotentialAndProfile(fiscalYear);
            GTMPathFinderHelper.createGTMDetail(fiscalYear);
            System.debug('gtmPotentialAndProfile size '+gtmPotentialAndProfile.size());
            System.assert(gtmPotentialAndProfile.size() > 0, 'Gtm Potential Profile created');
        }
    }
    @isTest
    public static void testGetCatergoryAllocation() {
        System.runAs(argentinaUser) {
            createProductSalesOrgMapping();
            Map < string, List < GTM_Details__c >> gtmProductCategory = GTMPathFinder.getCatergoryAllocation(fiscalYear);
            System.assert(gtmProductCategory.size() > 0, 'Gtm Potential Profile created');
        }
    }
    @isTest
    public static void testGetCropAllocation() {
        System.runAs(argentinaUser) {
            Map < string, List < GTM_Details__c >> gtmCropAllocation = GTMPathFinder.getCropAllocation(fiscalYear);
            System.assert(gtmCropAllocation.size() > 0, 'Gtm Crop Allocation created');
            GTM_Details__c gtmDetail = gtmCropAllocation.values()[0][0];
            String updateValue1 = GTMPathFinder.updateGTMDetailProductAllocation(gtmDetail.Id, '50');
            System.assertEquals('50', updateValue1, 'value Updated');
            String updateValue2 = GTMPathFinder.updateGTMDetailCropAllocation(gtmDetail.Id, '50');
            System.assertEquals('50', updateValue2, 'value Updated');
            String updateValue3 = GTMPathFinder.updateGTMDetailPotentialProfile(gtmDetail.Id, 'Total_Purchase_of_Crop_Protection_PY__c', '50');
            System.assertEquals('50', updateValue3, 'value Updated');
            String updateValue4 = GTMPathFinder.updateGTMDetailPotentialProfile(gtmDetail.Id, 'Estimated_Markup_of_Channel__c', '50');
            System.assertEquals('50', updateValue4, 'value Updated');
            String updateValue5 = GTMPathFinder.updateGTMDetailPotentialProfile(gtmDetail.Id, 'Estimated_Number_of_Sales_Rep_on_Role__c', '50');
            System.assertEquals('50', updateValue5, 'value Updated');
            String updateValue6 = GTMPathFinder.updateGTMDetailPotentialProfile(gtmDetail.Id, 'Number_of_Stores_That_the_Channel_Has__c', '50');
            System.assertEquals('50', updateValue6, 'value Updated');
            String updateValue7 = GTMPathFinder.updateGTMDetailPotentialProfile(gtmDetail.Id, 'GTM_Customer_Type__c', 'Distributor');
            System.assertEquals('Distributor', updateValue7, 'value Updated');
            boolean isUpdated = GTMPathFinder.updateClassificationDependent(gtmDetail.Id);
            GTM_Details__c detail = GTMPathFinderHelper.updateGTMDetails(gtmDetail);
            System.assert(isUpdated, 'Classification Field Updated with blank');
        }
    }

    @isTest
    public static void testGetInstructions() {
        System.runAs(argentinaUser) {
            GTM_Country_Configuration__c gcc = new GTM_Country_Configuration__c();
            gcc.Instruction_Profile_Potential__c = 'Instruction Profile Potential'; 
            gcc.Sales_Org__c = salesOrg.Id; 
            insert gcc;
            GTM_Country_Configuration__c gcc1 = GTMPathFinderHelper.getInstructions();
            System.assert(gcc1 != null, 'Instructions found');
            GTMPathFinderHelper.getGTMDetailsToDisable('Profile & Potential');
            
        }
    }

    @isTest
    public static void testIsWindowPeriodClosed() {
        System.runAs(argentinaUser) {
            GTM_Country_Configuration__c gcc = new GTM_Country_Configuration__c();
            gcc.Start_Day__c = '1';
            gcc.Start_Month__c = 'Jan';
            gcc.End_Day__c = '31';
            gcc.End_Month__c = 'Mar';
            gcc.Sales_Org__c = salesOrg.Id;
            insert gcc;
            boolean isClosePeriod = GTMPathFinderHelper.isWindowPeriodClosed();
            System.assertNotEquals(isClosePeriod,null,'Window period should not be null');
        }
    }

    @isTest
    public static void testCreateNewCustomerDetails() {
        System.runAs(argentinaUser) {
            Id nonleadcustomerRecordType = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId();
            String outlookRecordType = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Outlook').getRecordTypeId();
            Account a = new Account();
            a.Name = 'Test AccountNew';
            a.Account_Type__c = 'Sold To Party';
            a.Sales_Org__c = salesOrg.Id;
            a.recordTypeId = nonleadcustomerRecordType;
            a.Country__c = 'Other';
            a.Lead_Customer_Ownership__c = loggedInUserId;
            a.SAP_code__c = 'A1';
            insert a;
            GTM__c gtm = new GTM__c();
            gtm.Fiscal_Year__c = fiscalYear;
            gtm.GTM_Status__c = 'Draft';
            gtm.Sales_Org__c = salesOrg.Id;
            gtm.Sales_Rep__c = loggedInUserId;
            gtm.Combination_Key__c = 'UGDN'+fiscalYear+salesOrg.Sales_Org_Code__c;
            insert gtm;
            GTM__C g = GTMPathFinder.getGTM(gtm.Id);
            System.assert(g!= null, 'GTM Found');
            String newAcc = JSON.serialize(new List<Account>{a});
            List < Account > newAccounts = GTMPathFinder.getNewGTMCustomers();
            GTMPathFinder.getUser();
            System.assert(newAccounts.size() == 0, 'Newly Added Customers on load is zero');
            GTMPathFinderHelper.createNewCustomerDetails(newAcc);
            List<Crop__c> newcrops = GTMPathFinder.getNewlyAddedCrop();
            boolean isSubmitted = GTMPathFinder.submitGTMDetails();
            GTMPathFinderHelper.createOutlookDetails(gtm,outlookRecordType,new List<Account>{a});
            GTMPathFinderHelper.getCompetitorDetails();
        }
    }

    /*
    ################### Creating Sales org 
    */
    public static Sales_Org__c createSalesOrg() {
        Sales_Org__c salesOrg1 = new Sales_Org__c();
        salesOrg1.Name = 'Argentina';
        salesOrg1.Sales_Org_Code__c = '5631';
        insert salesOrg1;
        return salesOrg1;
    }

    /*
    ################### Creating GTM Customer 
    */
    public static List < Account > createGTMCustomers() {
        Id leadcustomerRecordType = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Lead Customer').getRecordTypeId();
        Id nonleadcustomerRecordType = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId();

        Account account = new Account();
        account.Sales_Org__c = salesOrg.Id;

        List < Account > accounts = new List < Account > ();
        for (Integer i = 1; i <= 50; i++) {
            Account gtmAccount = account.clone();
            gtmAccount.Name = 'Test Account ' + i;
            gtmAccount.Account_Type__c = 'Sold To Party';
            gtmAccount.Sales_Org__c = salesOrg.Id;
            gtmAccount.Country__c = 'Other';
            gtmAccount.SAP_code__c = 'A1'+i;
            //gtmAccount.PersonMobilePhone='1212121212';
            if (math.mod(i, 2) == 0) { //Lead Customer
                gtmAccount.Lead_Customer__c = '001';
                gtmAccount.recordTypeId = leadcustomerRecordType;
                gtmAccount.Lead_Customer_Ownership__c = loggedInUserId;
                
            } else { // Non-Lead Customer
                gtmAccount.recordTypeId = nonleadcustomerRecordType;
                gtmAccount.Lead_Customer_Ownership__c = loggedInUserId;

            }
            accounts.add(gtmAccount);
        }
        insert accounts;
        return accounts;
    }

    /*
    ################### Creating Login country custom Setting
    */
    public static Login_Country__c createLoginCountry() {
        Login_Country__c loginCountry = new Login_Country__c();
        loginCountry.Name = 'Argentina';
        loginCountry.Sales_Org_Code__c = '5631';
        insert loginCountry;
        return loginCountry;
    }


    /*
    ################### Creating Product Category
    */

    public static List < Product_Category_Sales_Org_Mapping__c > createProductSalesOrgMapping() {
        List < Product_Category_Sales_Org_Mapping__c > pscms = new List < Product_Category_Sales_Org_Mapping__c > ();
        Product_Category__c productCategory1 = new Product_Category__c();
        productCategory1.Name = 'Product1';
        productCategory1.Status__c = 'Active';
        productCategory1.Product_Category_Code__c = 'PC-001';
        insert productCategory1;

        Product_Category_Sales_Org_Mapping__c pcsm1 = new Product_Category_Sales_Org_Mapping__c();
        pcsm1.Product_Category__c = productCategory1.Id;
        pcsm1.Status__c = 'Active';
        pcsm1.Sales_Org__c = salesOrg.Id;
        pcsm1.Category_Index__c = 1;
        insert pcsm1;


        Product_Category__c productCategory2 = new Product_Category__c();
        productCategory2.Name = 'Product2';
        productCategory2.Status__c = 'Active';
        productCategory2.Product_Category_Code__c = 'PC-002';
        insert productCategory2;

        Product_Category_Sales_Org_Mapping__c pcsm2 = new Product_Category_Sales_Org_Mapping__c();
        pcsm2.Product_Category__c = productCategory2.Id;
        pcsm2.Status__c = 'Active';
        pcsm2.Sales_Org__c = salesOrg.Id;
        pcsm2.Category_Index__c = 2;
        insert pcsm2;
        pscms.add(pcsm1);
        pscms.add(pcsm2);
        return pscms;
    }

    /*
    ################### Creating Crops
    */

    public static List < Crop__c > createCrops() {
        List < Crop__c > crops = new List < Crop__c > ();
        Crop__c crop1 = new Crop__c();
        crop1.Name = 'crop1';
        crop1.GTM_Status__c = 'Active';
        crop1.SalesOrg__c = salesOrg.Id;
        crop1.Crop_code__c = 'c001';
        crop1.Category_Index__c = 1;
        insert crop1;
        Crop__c crop2 = new Crop__c();
        crop2.Name = 'crop2';
        crop2.GTM_Status__c = 'Active';
        crop2.SalesOrg__c = salesOrg.Id;
        crop2.Category_Index__c = 2;
        crop1.Crop_code__c = 'c002';
        insert crop2;
        crops.add(crop1);
        crops.add(crop2);
        return crops;
    }

    public static User createuser() {
        User argentinaUsr = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Territory Manager Argentina'].Id,
            LastName = 'Santiago',
            Email = 'sandeep.vishwakarma@skinternational.com',
            Username = 'test@test.com' + System.currentTimeMillis(),
            CompanyName = 'SK international',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            UGDN_Number__c = 'UGDNArgentia',
            Country = 'Argentina'
        );
        insert argentinaUsr;
        return argentinaUsr;
    }
    
    @isTest
    public static void testWithRespectToUser() {
        
    }

}