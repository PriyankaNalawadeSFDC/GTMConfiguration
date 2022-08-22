@isTest
public class GTMPathFinderHelperTest {
  	//public static Sales_Org__c salesOrg = GTMPathFinderTest.createSalesOrg();
    public static User argentinaUser = GTMPathFinderTest.createuser();
    public static Id loggedInUserId = argentinaUser.Id;
    public static Login_Country__c loginCountry = GTMPathFinderTest.createLoginCountry();
    public static List < Account > gtmCustomers = GTMPathFinderTest.createGTMCustomers();
    public static List < Crop__c > crops = GTMPathFinderTest.createCrops();
    static String fiscalYear = '2021-2022';
    
    @isTest
    public static void getGTMDetailsToDisableTest(){
        List<GTM_Details__c> details = GTMPathFinderHelper.getGTMDetailsToDisable('Profile & Potential');
        System.assert(details.size()>0,'Potential Profile record found');
    }
   	@isTest
    public static void getGTMSalesRepCustomerTest(){
        System.runAS(argentinaUser){ 
       		Id leadcustomerRecordType = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Lead Customer').getRecordTypeId();
       		Id nonleadcustomerRecordType = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId(); 
            sales_org__c salesorg = [Select Id, Name from sales_org__c limit 1];
       		List<Account> accounts =  GTMPathFinderHelper.getGTMSalesRepCustomer(leadcustomerRecordType ,nonleadcustomerRecordType ,salesOrg.Sales_Org_Code__c);
       		System.assert(accounts.size()>0, 'GTM Sales Rep Customer Found');
    	}
  	}
    
}