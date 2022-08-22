/*
Created By: Abhishek Verma
Date : 29-5-2017
Discription : Controller for handling Calander Events of Activity Management 
*/
public with sharing class  ActivityManagementFranceController{
    
    static final String FRANCE_SALESORG_CODE = '2710';
    static final String NAM_SALESORG_CODE = System.Label.NAM_SalesOrg;
    static final String CAD_SALESORG_CODE = System.Label.Canada_SalesOrg;
    static final String COUNTRYNAM = 'USA';
    static final String COUNTRYCAD = 'Canada';
    public  List<Event> eventList{get;set;}
    private  List<Account> AccountList;//{get;set;}
    public List<List<Account>> nestedListAccount{get;set;}
    public List<List<Account>> nestedMyListAccount{get;set;}
    private Id LoginUserID;
    public Event eventToInsert{get;set;}
    public string accountSearchKey{get;set;}
    /*Event Fileds*/
    public String Meeting_Purpose{get;set;}
    public String Activity_Type{get;set;}
    //public String Activity_Type_for_NAM{get;set;}
    public String Start_Date{get;set;}
    public String Account_Type{get;set;}
    public String End_Date{get;set;}
    public String Account{get;set;}
    public String Location{get;set;}
    public String Meeting_Notes{get;set;}
    public String EventSubject{get;set;}
    public String StartDate{get;set;}
    public String StartTime{get;set;}
    public String EndDate{get;set;}
    public String EndTime{get;set;}
    public ID SelectedEventId{get;set;}
    public String contactIds{get;set;}
    public String status{get;set;}
    
    public Integer noOfKmTravel;//{get;set;}
    public Integer food;//{get;set;}
    public Integer nightStay;//{get;set;}
    public Integer otherExp;//{get;set;}
    public List<Attachment>AttachmentList{get;set;}
    public List<event>todaysEvent{get;set;}
    public List<contact>contactList{get;set;}
    public String groupedResultsString{get;set;}
    List<EventRelation>vfEventRelList{get;set;}
    public string jsonEventRelation{get;set;}
    public string inviteeToDelete{get;set;}
    public String attachmentToDelete{get;set;}
    public String userTimeZone{get;set;}
    public String inviteeTimeZone{get;set;}
    public User currentUser{get;set;}
    public String currentDateTimeStart {get;set;}
    public String currentDateTimeEnd {get;set;}
    public String parentStr {get;set;}
    /*End of Event Fields*/  
    public String ActivityCurrency{get;set;}  
    
    /*Load initial data of event and account*/
    public ActivityManagementFranceController(){
        
        try{
            parentStr ='';
            System.debug('Inside Constructor');
            System.debug(DateTime.now().format('yyyy-MM-dd\'T\'hh:mm'));
            currentDateTimeStart  = DateTime.now().format('yyyy-MM-dd\'T\'hh:mm');
            System.debug('End time'+DateTime.now().addHours(1).format('yyyy-MM-dd\'T\'hh:mm'));
            status = 'Planned';
            system.debug('hello status'+status);
            contactIds='';
            inviteeToDelete = '';
            inviteeTimeZone  = '';
            LoginUserID = UserInfo.getUserId();
            currentUser = [select id, Country,Profile.Name from user where id =: UserInfo.getUserId() ];
            TimeZone tz = UserInfo.getTimeZone();
            System.debug('Display name: ' +tz.getDisplayName());
            System.debug('ID: ' + tz.getID());
            System.debug('currentUser : ' + currentUser);
            userTimeZone =tz.getID(); 
            noOfKmTravel = 0;food=0;nightStay=0;otherExp=0;
            AggregateResult[] groupedResults = [SELECT sum(Night_Stay__c)nightstay,sum(Other_Expenses__c)otherexp,sum(Food__c)foodexp, sum(No_of_KMs_Travelled__c)noofkm,calendar_month(StartDateTime)month  from event where OwnerId=:LoginUserID  GROUP BY calendar_month(StartDateTime)];
            groupedResultsString = JSON.serialize(groupedResults);
            attachmentToDelete = '';
            eventList = new List<Event>();
            AttachmentList = new List<Attachment>();  
            AccountList = new List<Account>();
            eventList = [SELECT Id, Invitee_Timezone__c,Food__c,Night_Stay__c,Other_Expenses__c,
                         Meeting_Purpose__c,Location__c,Meeting_Notes__c,No_of_KMs_Travelled__c,
                         Account.name,toLabel(Subject),Activity_Status__c,ActivityStatus__c, AccountId, StartDateTime, 
                         EndDateTime,OwnerId,visit_type__c,activity_type__c
                         FROM Event 
                         where OwnerId=:LoginUserID AND StartDateTime!=null];//added visit type field
            system.debug('eventList'+eventList);
            if(currentUser.Country == COUNTRYNAM){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: NAM_SALESORG_CODE
                              limit 100];///limit 999 (by saurabh AND Sales_Org_Code__c='1000' )
            }
            else{
                if(currentUser.Country == COUNTRYCAD){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: CAD_SALESORG_CODE
                              limit 100];///limit 999 (by saurabh AND Sales_Org_Code__c='1000' )
                }else{
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: FRANCE_SALESORG_CODE
                              limit 100];///limit 999 (by saurabh AND Sales_Org_Code__c='1000' )
                }
            }
            
            nestedMyListAccount = new List<List<Account>>();
            Integer count = 0,index=0;
            System.debug('nestedMyListAccount');
            List<Account>asts = new List<Account>();
            if(AccountList.size()<999){
                nestedMyListAccount.add(AccountList);
            }
            for(Account acc : AccountList){
                count++;
                
                if(count>=999){
                    System.debug('count - '+count);
                    nestedMyListAccount.add(asts);  
                    asts= new List<Account>();
                    index++;
                    count=0; 
                }
                asts.add(acc);
                
                
            }
            System.debug('nestedListAccount');
            
            System.debug(nestedMyListAccount.size());
            
            parentStr = JSON.serialize(AccountList); 
            system.debug(AccountList.size());
            system.debug(parentStr.length());
            
            AttachmentList = [SELECT Id, Name, ParentId,ownerID FROM Attachment where ParentId IN : eventList];
            todaysEvent = [SELECT Id, Invitee_Timezone__c,Account.name,Subject,Activity_Status__c, AccountId, StartDateTime, EndDateTime,OwnerId FROM Event where OwnerId=:LoginUserID AND StartDateTime = TODAY AND StartDateTime!=null limit 999];
            contactList = [SELECT Id, FirstName,LastName,Title,AccountId, IsPersonAccount, Name, Phone, MobilePhone, Email, OwnerId FROM Contact where Account.ID IN:AccountList AND IsPersonAccount=false limit 0];
            vfEventRelList = [SELECT Id, Relation.name,eventID, Event.subject FROM EventRelation where eventID In :eventList AND IsInvitee =true];
            for(Integer i=0;i<contactList.size();i++){
                contactList[i].LastName = contactList[i].FirstName.replaceAll('/[^a-zA-Z0-9]/g', '')+' '+contactList[i].LastName.replaceAll('/[^a-zA-Z0-9]/g', ''); 
                //requirment chnges first name to be added 
                //contactList[i].LastName.replaceAll('"', '').replaceAll('\'', '');//
            }
            
            for(Integer i=0;i<AccountList.size();i++){
                AccountList[i].Name = AccountList[i].Name.replaceAll('"', '').replaceAll('\'', '');
            }
            jsonEventRelation =JSON.serialize(vfEventRelList); 
            //.remove('\'');
            jsonEventRelation= jsonEventRelation.replace('\\"', '').replaceAll('\'', '');
            
            eventToInsert = new Event();
            EventSubject='abhi';
            StartDate='19/5/2017';
            StartTime='1:00 PM';
            EndDate='19/5/2017';
            EndTime='2:00 PM';
            ActivityCurrency='INR';
            Activity_Type='';
            Location='';
            Account='';
            SelectedEventId='';
        }catch(Exception e){
            system.debug(e);
        }   
    }
    /*Method for Creating event from Calander*/
    public void CreateEvents(){
        System.debug('Inside CreateEvents()'+status);
        //status='Planned';
        eventToInsert = new Event();
        ID eveID;
        if(!String.isBlank(SelectedEventId)){
            eveID=Id.valueOf(SelectedEventId); 
            eventToInsert.id=eveID ;
        }
        try{
            system.debug('Account - '+Account);
            if(currentUser.Country == COUNTRYNAM || currentUser.Country == COUNTRYCAD){
                eventToInsert.Activity_Type__c = Activity_Type;
            }
            	eventToInsert.Subject = Activity_Type;
            // eventToInsert.WhatID = Account;
            eventToInsert.Account__c= Account;
            eventToInsert.StartDateTime = Datetime.newInstance(integer.ValueOf(Start_Date.split('-')[0]),integer.ValueOf(Start_Date.split('-')[1]),integer.ValueOf(Start_Date.split('-')[2].split('T')[0]),integer.ValueOf(Start_Date.split('T')[1].split(':')[0]),integer.ValueOf(Start_Date.split('T')[1].split(':')[1]),0);
            eventToInsert.EndDateTime = Datetime.newInstance(integer.ValueOf(End_Date.split('-')[0]),integer.ValueOf(End_Date.split('-')[1]),integer.ValueOf(End_Date.split('-')[2].split('T')[0]),integer.ValueOf(End_Date.split('T')[1].split(':')[0]),integer.ValueOf(End_Date.split('T')[1].split(':')[1]),0);
            eventToInsert.CurrencyIsoCode ='INR';
            eventToInsert.OwnerId = LoginUserID ;
            eventToInsert.No_of_KMs_Travelled__c = noOfKmTravel;//;
            eventToInsert.Food__c = food;//;
            eventToInsert.Night_Stay__c = nightStay;//;
            eventToInsert.Other_Expenses__c = otherExp;//;
            eventToInsert.Meeting_Purpose__c = Meeting_Purpose;//;
            eventToInsert.Location__c =Location;
            eventToInsert.Created_From__c = 'SFDC';
            eventToInsert.Meeting_Notes__c = Meeting_Notes.replace('\n',', ').replaceAll('\'', '');
            eventToInsert.Meeting_Notes__c = eventToInsert.Meeting_Notes__c.replaceAll('\\W+','').replaceAll('\'', '');
            system.debug(status+'status**');
            if(eventToInsert.StartDateTime> system.now() || eventToInsert.EndDateTime> system.now()){
                eventToInsert.Activity_Status__c='Planned';
            }
            else {
                eventToInsert.Activity_Status__c='Visited';
            }
            eventToInsert.Activity_Status__c=status;
            eventToInsert.Invitee_Timezone__c = inviteeTimeZone;
            
            //added by Swapnil - to Link Event with what Id and update Visit type    
            if (Schema.sObjectType.Event.fields.Visit_Type__c.isAccessible()){
                eventToInsert.Visit_Type__c=VisitType;
                eventToInsert.WhatId = Account;
                system.debug('Visit Type '+VisitType);
            }
            //end
            upsert eventToInsert;
            SelectedEventId =eventToInsert.id; 
            system.debug('SelectedEventId -- '+SelectedEventId);
            System.debug('contactIds -- '+contactIds);
            if(contactIds.length()>0){
                createEventRelation(SelectedEventId,contactIds);
            }
            //   todaysEvent = [SELECT Id, Invitee_Timezone__c,Account.name,Subject,Activity_Status__c, AccountId, StartDateTime, EndDateTime,OwnerId FROM Event where OwnerId=:LoginUserID AND StartDateTime = TODAY AND StartDateTime!=null];
            //   eventList = [SELECT Id, Invitee_Timezone__c,Food__c,Night_Stay__c,Other_Expenses__c,Meeting_Purpose__c,Location__c,Meeting_Notes__c,No_of_KMs_Travelled__c,Account.name,Subject,Activity_Status__c, AccountId, StartDateTime, EndDateTime,OwnerId FROM Event where OwnerId=:LoginUserID AND StartDateTime!=null];
            //  AttachmentList = [SELECT Id, Name, ParentId,ownerID FROM Attachment where ParentId IN : eventList];
            // contactList = [SELECT Id, Title,AccountId, IsPersonAccount, Name, Phone, MobilePhone, Email, OwnerId FROM Contact where Account.ID IN:AccountList AND IsPersonAccount=false];
            
        }catch(Exception e){
            System.debug('---'+e);
        }  
    }
    public void createEventRelation(String eveId,String inveteeIds){
        
        EventRelation er = new EventRelation();
        EventRelation er2 = new EventRelation();
        
        List<EventRelation>eventRelList = new List<EventRelation>();
        er2 = new EventRelation(EventId =eveId,RelationId =Account,IsInvitee =false,IsWhat=true,isParent=true );
        eventRelList.add(er2);
        System.debug('Inside createEventRelation()');
        for(string s:inveteeIds.split(',')){ //
            er = new EventRelation(EventId =eveId,RelationId =s,IsInvitee =false,IsWhat=false,isParent=true );
            eventRelList.add(er);
        }
        system.debug(eventRelList);
        if(eventRelList.size()>0){
            try{
                insert eventRelList;
            }catch(Exception e){
                system.debug('Exception  --- > '+e);
            }  
        }
        
    }
    
    public void deleteInvitee(){
        System.debug('Inside deleteInvitee()');
        if(!String.isBlank(inviteeToDelete)){
            EventRelation er = new EventRelation();
            er.id =inviteeToDelete; 
            try{
                delete er;
            }catch(Exception e){
                system.debug(e);
            }
            
        }
    }
    public void deleteAttachment(){
        System.debug('Inside deleteAttachment()');
        Attachment atTodlete = new Attachment();
        atTodlete.id =  attachmentToDelete;
        try{
            delete atTodlete;
        }catch(Exception e){
            system.debug(e);
        }  
        
    }
    public void getContact(){
        System.debug('Account'+Account);
        contactList = [SELECT Id, FirstName,LastName,Title,AccountId, IsPersonAccount, Name, Phone, MobilePhone, Email, OwnerId FROM Contact where Account.ID =: Account AND IsPersonAccount=false limit 999];
        if(contactList.size()>0){
        for(Integer i=0;i<contactList.size();i++){
            //  contactList[i].LastName=  contactList[i].LastName.replaceAll('"', '');// = contactList[i].FirstName.replaceAll('/[^a-zA-Z0-9]/g', '')+' '+contactList[i].LastName.replaceAll('/[^a-zA-Z0-9]/g', ''); 
            if(contactList[i].FirstName != null && contactList[i].LastName != null)
            	contactList[i].LastName=contactList[i].FirstName.replaceAll('/[^a-zA-Z0-9]/g', '')+' '+contactList[i].LastName.replaceAll('/[^a-zA-Z0-9]/g', ''); 
        }}
        System.debug('contactList '+contactList); 
        
    }
    public void searchAccount(){
        system.debug('accountSearchKey ---- '+accountSearchKey);
        String likeKey = '%'+accountSearchKey+'%';
        system.debug('Account_Type- '+Account_Type);
        if(currentUser.Country == COUNTRYNAM){
            AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, 
                          ShippingCity FROM Account 
                          where  
                          (RecordType.DeveloperName='Distributor' OR 
                           RecordType.DeveloperName='Ship To' OR 
                           RecordType.DeveloperName='Group' OR 
                           RecordType.DeveloperName='Influencer' OR 
                           RecordType.DeveloperName='Farmer') AND 
                          sales_org__r.Sales_org_code__c =: NAM_SALESORG_CODE AND
                          Name LIKE :likeKey limit 2850];
        }
        else{        
            if(currentUser.Country == COUNTRYCAD){
            AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, 
                          ShippingCity FROM Account 
                          where  
                          (RecordType.DeveloperName='Distributor' OR 
                           RecordType.DeveloperName='Ship To' OR 
                           RecordType.DeveloperName='Group' OR 
                           RecordType.DeveloperName='Influencer' OR 
                           RecordType.DeveloperName='Farmer') AND 
                          sales_org__r.Sales_org_code__c =: CAD_SALESORG_CODE AND
                          Name LIKE :likeKey limit 2850];
        }else{
            
            AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, 
                          ShippingCity FROM Account 
                          where  
                          (RecordType.DeveloperName='Distributor' OR 
                           RecordType.DeveloperName='Ship To' OR 
                           RecordType.DeveloperName='Group' OR 
                           RecordType.DeveloperName='Influencer' OR 
                           RecordType.DeveloperName='Farmer') AND 
                          sales_org__r.Sales_org_code__c =: FRANCE_SALESORG_CODE AND
                          Name LIKE :likeKey limit 2850];
        }
        }
        system.debug(AccountList);
        nestedListAccount = new List<List<Account>>();
        Integer count = 0,index=0;
        System.debug('nestedListAccount');
        List<Account>asts = new List<Account>();
        if(AccountList.size()<999){
            nestedListAccount.add(AccountList);
        }
        for(Account acc : AccountList){
            count++;
            
            if(count>=999){
                System.debug('count - '+count);
                nestedListAccount.add(asts);  
                asts= new List<Account>();
                index++;
                count=0; 
            }
            asts.add(acc);
            
            
        }
        System.debug('nestedListAccount');
        
        System.debug(nestedListAccount.size());
        System.debug('AccountList'+AccountList.size());
    }
    
    public void mysearchAccount(){
        system.debug('accountSearchKey ---- '+accountSearchKey);
        String likeKey = '%'+accountSearchKey+'%';
        system.debug('Account_Type- '+Account_Type);
        if(likeKey != ''){
            if(currentUser.Country == COUNTRYNAM){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: NAM_SALESORG_CODE AND
                              
                              Name LIKE :likeKey limit 2850];
            }else{
                if(currentUser.Country == COUNTRYCAD){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: CAD_SALESORG_CODE AND
                              
                              Name LIKE :likeKey limit 2850];
                }else{
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: FRANCE_SALESORG_CODE AND
                              
                              Name LIKE :likeKey limit 2850];
                }
            }
        }
        else{
            if(currentUser.Country == COUNTRYNAM){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: NAM_SALESORG_CODE  limit 2850];
            }
            else{
                if(currentUser.Country == COUNTRYCAD){
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: CAD_SALESORG_CODE  limit 2850];
                }else{
                AccountList =[SELECT Id,Name, Customer_Type__c,RecordType.Name,Phone, ShippingCity 
                              FROM Account 
                              where ownerid =: UserInfo.getUserId() 
                              AND sales_org__r.Sales_org_code__c =: FRANCE_SALESORG_CODE  limit 2850];
                }
            }
        }
        
        system.debug(AccountList);
        nestedMyListAccount = new List<List<Account>>();
        Integer count = 0,index=0;
        System.debug('nestedListAccount');
        List<Account>asts = new List<Account>();
        if(AccountList.size()<999){
            nestedMyListAccount.add(AccountList);
        }
        for(Account acc : AccountList){
            count++;
            
            if(count>=999){
                System.debug('count - '+count);
                nestedMyListAccount.add(asts);  
                asts= new List<Account>();
                index++;
                count=0; 
            }
            asts.add(acc);
            
            
        }
        System.debug('nestedListAccount');
        
        System.debug(nestedMyListAccount.size());
        System.debug('AccountList'+AccountList.size());
    }
    
    
    //added by swapnil - To Store Visit type field value
    public String VisitType {get; set;}
    public void passValueToController()   
    {        
        VisitType = eventToInsert.Visit_Type__c; //this will assign the selected value to Controller variable.
    }
    
    public List<SelectOption> getSubject()
    {
        List<SelectOption> options = new List<SelectOption>();
        
        Schema.DescribeFieldResult fieldResult =
            Event.Subject.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        for( Schema.PicklistEntry f : ple)
        {
            options.add(new SelectOption(f.getLabel(), f.getValue()));
        }       
        return options;
    }
    //end
    public List<SelectOption> getActivityType()
    {
        List<SelectOption> options = new List<SelectOption>();
        
        Schema.DescribeFieldResult fieldResult =
            Event.Activity_Type__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        for( Schema.PicklistEntry f : ple)
        {
            options.add(new SelectOption(f.getLabel(), f.getValue()));
        }       
        return options;
    }
}