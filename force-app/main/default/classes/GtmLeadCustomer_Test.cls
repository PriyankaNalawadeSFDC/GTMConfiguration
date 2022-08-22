/*
* Name: GtmLeadCustomer_Test
* Created On: 23/12/2021
* Author: Vishal Pawar (vishal.pawar@skinternational.com)
* Test Class for : GtmLeadCustomer
* 
*/

@isTest
private class GtmLeadCustomer_Test {
    static testMethod void validateData() {
        Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Distributor').getRecordTypeId();
        Id accountRecordLead = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Lead Customer').getRecordTypeId();
        
        Sales_Org__c salesOrgObj = new Sales_Org__c(
            Name = 'Argentina',            // Sales Org Name
            Company_Code__c = '5631',        // Company Code
            Sales_Org_Code__c = '5631',      // Sales Org Code
            Country_Code__c = 'AR'          // Country Code
        );
        insert salesOrgObj;
        
        Division__c divisionObj = new Division__c(
            Name = 'Agro Formulation',// Division Name
            Division_Code__c = '10'    // Division Code
        );
        insert divisionObj;
        
        Distribution_Channel__c distChannelObj = new Distribution_Channel__c(
            Name = 'Direct',                    // Distribution Channel Name
            Distribution_Channel_Code__c = '10'  // Distribution Channel Code
        );
        insert distChannelObj;
        
        //SELECT Id, Name, For_Contry__c, Sales_Org_Code__c FROM Login_Country__c;
        Login_Country__c logCountryObj = new Login_Country__c();
        logCountryObj.Name ='Argentina'; 
        logCountryObj.For_Contry__c ='Argentina';
        logCountryObj.Sales_Org_Code__c ='5631';
        insert logCountryObj;
            
        
        
        
        userrole  usrole = new userrole();
        usrole.Name ='Regional/Zonal Managers for Spain';
        
        Profile p = [SELECT Id,name FROM Profile WHERE Name = 'Standard User'];        
        User sobj1 = new User();
        sobj1.Alias = 'zonaa';                                                            
        sobj1.Email = 'skim@skinternational123.com';                             
        sobj1.ProfileId  = p.ID;
        // sobj1.ContactId=con.Id;
        sobj1.UserRoleId=usrole.id;
        sobj1.Username = 'zonal_aaexe1232@upl122333.com.devbox';                                    
        sobj1.IsActive = true; 
        sobj1.Country ='Argentina'; 
        sobj1.LastName='Terriotory Manager';
        sobj1.CommunityNickname = 'zonalExe1222 Di'; 
        sobj1.TimeZoneSidKey = 'Asia/Kolkata'; 
        sobj1.LocaleSidKey = 'en_IN';                                    
        sobj1.LanguageLocaleKey = 'en_US';                                             
        sobj1.ForecastEnabled = false;                                                     
        sobj1.EmailEncodingKey = 'ISO-8859-1';    
        sobj1.Show_Inventory__c = false;                                                     
        sobj1.Show_Credit_Limit__c = false; 
        
        
        insert sobj1;
        
        
        
        System.runAs(sobj1) {
            Account AccObj = new Account(
            Sales_Org__c = salesOrgObj.Id,                // Sales Org
            Depot_Code__c = 'AR13',                             // Depot Code
            Name = 'ABENAMA S.A.',                             // Account Name
            RecordTypeId = accountRecordTypeId,                         // Account Record Type
            Account_Type__c = 'Sold To Party',                  // Account Type           
            Last_Name__c = 'ABENAMA S.A.',                      // Last Name            
            Division__c = divisionObj.Id,                    // Division Name
            Is_Community_Active__c = false,                     // Is Community Active
            Distribution_Channel__c = distChannelObj.Id,        // Distribution Channel
            //Lead_Customer__c = '9758',                          // Lead Customer
            Lead_Customer_Ownership__c = sobj1.Id,     // Lead Customer Ownership
            Lead_Customer_Type__c = 'Government',                 // Lead Customer Type
            Path_Finder__c = false                             // Path Finder
        );
        insert AccObj;
            
            GtmLeadCustomer.getSalesOrg();
            //GtmLeadCustomer.getLeadCustomerList('Both');
            //GtmLeadCustomer.getLeadCustomerList('Lead Customer');
            GtmLeadCustomer.getLeadCustomerList('Non Lead Customer');
            Integer rowIndex =0;
            List<GtmLeadCustomer.LeadAccountListWrapper> leadCustwraList = new List<GtmLeadCustomer.LeadAccountListWrapper>();
            GtmLeadCustomer.LeadAccountListWrapper wrapObj = new GtmLeadCustomer.LeadAccountListWrapper();
            wrapObj.isSelected= false;
            wrapObj.showOnwerLookup= false;
            wrapObj.showOnwerText= true;
            
            
            wrapObj.leadCustomerId= AccObj.Id;
            
            wrapObj.index = 0;
            rowIndex = rowIndex +1;
            wrapObj.leadCustomerName= AccObj.Name;
           
            
            if(accObj.SAP_Code__c!=null){
                wrapObj.leadCustomerCode= AccObj.SAP_Code__c;
            }else{
                wrapObj.leadCustomerCode= AccObj.Lead_Customer__c;
            }
            
            
            wrapObj.ownerShip= AccObj.Lead_Customer_Ownership__c;
            if(AccObj.Lead_Customer_Ownership__r.Name!=null){
                wrapObj.ownerShipName= AccObj.Lead_Customer_Ownership__r.Name;
                wrapObj.ownerUGDNCode = AccObj.Lead_Customer_Ownership__r.UGDN_Number__c;
            }else{
                wrapObj.ownerShipName= '';   
                wrapObj.ownerUGDNCode = '';
            }           
            wrapObj.customerType= AccObj.Lead_Customer_Type__c;
            wrapObj.pathFinder= AccObj.Path_Finder__c;
            wrapObj.lastModifiedByName= AccObj.LastModifiedBy.Name;
            wrapObj.lastModifiedDate= AccObj.LastModifiedDate;
            wrapObj.recordTypeName= AccObj.recordType.Name;
            
            
            leadCustwraList.add(wrapObj);
            
            String serlizeStr = JSON.serialize(leadCustwraList); 
            
            
                GtmLeadCustomer.updateAccountMethod(serlizeStr); 
          
                //System.debug('Error Occure Line Number '+ex.getLineNumber());
                //System.debug('Error Occure Message  '+ex.getMessage());
            
            
            String body = 'Updated Record Id,  Lead Customer Name, Lead Code/ SAP Code, UGDN, Path Finder\r\n';
            body+='0010k00000wSxD0AAK,ABENAMA S.A.,9758,20011076,Retailer,Inactive\r\n';
            body+='0010k0000197GDRAA2,ADECO AGROPECUARIA S.A.,1234,20011076,Retailer,Active\r\n';
            
            GtmLeadCustomer.saveFile(body);
            
            
            gtmLeadCustomer.leadCustomerListForSelected(AccObj.Id, sobj1.Id);
            gtmLeadCustomer.leadCustomerListForSelected('', sobj1.Id);
            gtmLeadCustomer.leadCustomerListForSelected('', '');
            gtmLeadCustomer.leadCustomerListForSelected(AccObj.Id, '');
            
           /* gtmLeadCustomer.leadForSelected(AccObj.Id, sobj1.Id);
            gtmLeadCustomer.leadForSelected('', sobj1.Id);
            gtmLeadCustomer.leadForSelected('', '');
            gtmLeadCustomer.leadForSelected(AccObj.Id, '');*/
            
            
            
            try{
                gtmLeadCustomer.downloadCSV(serlizeStr);
            }
            catch(Exception ex){
                System.debug('Error Line '+ex.getLineNumber());
                System.debug('Error msg '+ex.getMessage());
            }
           
   
            
        }
        
        
        
    }
}