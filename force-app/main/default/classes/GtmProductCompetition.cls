public Without Sharing class GtmProductCompetition {
    private static String fiscalyear = getFiscalYear();
    
    @AuraEnabled
    public static List < GtmProductCompWrapper > getproductList() {
        
        List < Product_Category__c > gtmproductList = [Select Id, Name, Status__c From Product_Category__c];
        List < Product_Category_Sales_Org_Mapping__c > productCategoriesMapping = new List < Product_Category_Sales_Org_Mapping__c > ();
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        
        
        for (Product_Category__c gtmProdObj: gtmproductList) {
            Product_Category_Sales_Org_Mapping__c categorySalesorgMap = new Product_Category_Sales_Org_Mapping__c();
            // Product_Category__c pc = new Product_Category__c();
            // pc.Id= gtmProductCategory.Id;
            categorySalesorgMap.Status__c = 'Inactive';
            categorySalesorgMap.Sales_Org__c = gtmSo.Id;
            categorySalesorgMap.Product_Category__c = gtmProdObj.Id;
            productCategoriesMapping.add(categorySalesorgMap);
            
        }
        
        List < Product_Category_Sales_Org_Mapping__c > lstSalesorgProductCategoryMap = [Select Id, Name, Product_Category__c, CreatedBy.Name, LastModifiedDate, CreatedDate, Sales_Org__r.Name, Product_Category__r.Name from Product_Category_Sales_Org_Mapping__c where Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c];
        
        if (lstSalesorgProductCategoryMap.size() == 0) {
            insert productCategoriesMapping;
        }
        
        return getWapper();  
    }
    @AuraEnabled
    public static List < GtmProductCompWrapper > getWapper() {
        List < GtmProductCompWrapper > gtmWrapList = new List < GtmProductCompWrapper > ();
        
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        List < Product_Category_Sales_Org_Mapping__c > SalesorgProductCategoryMap = [Select Id, Name, Status__c, CreatedBy.Name, LastModifiedDate, CreatedDate, Product_Category__c, Sales_Org__r.Name, Product_Category__r.Name from Product_Category_Sales_Org_Mapping__c where Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c order by Category_index__c ASC ];
        
        //return SalesorgProductCategoryMap;
        
        for (Product_Category_Sales_Org_Mapping__c obj: SalesorgProductCategoryMap) {
            GtmProductCompWrapper objwrap = new GtmProductCompWrapper();
            
            if (obj.Status__c == 'Inactive') {
                objwrap.status = false;
            }
            if (obj.Status__c == 'Active') {
                objwrap.status = true;
            }
            objwrap.productCategoryName = obj.Product_Category__r.Name;
            objwrap.productCategory = obj.Product_Category__c;
            objwrap.productCategorySalesOrgMappingId = obj.Id;
            objwrap.salesOrgName = obj.Sales_Org__r.Name;
            
            objwrap.createdByName = obj.CreatedBy.Name;
            objwrap.lastModifiedDateName = obj.LastModifiedDate;
            gtmWrapList.add(objwrap);
            System.debug('Hiiiii' + gtmWrapList);
        }
        return gtmWrapList;    
    }
    @AuraEnabled
    public static List < GtmProductCompWrapper > getWapperCrop() {
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        List < Crop__c > gtmCropList = [Select Id, Name, GTM_Status__c From Crop__c where SalesOrg__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c];
        List < GtmProductCompWrapper > gtmWrapCropList = new List < GtmProductCompWrapper > ();
        
        List < Crop__c > SalesorgCropMapping = [Select Id, Name, GTM_Status__c, LastModifiedBy.name,LastModifiedDate, SalesOrg__r.Name From Crop__c where SalesOrg__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c order by Category_index__c ASC];
        for (Crop__c obj: SalesorgCropMapping) {
            GtmProductCompWrapper objwrapcrop = new GtmProductCompWrapper();
            
            // if (obj.GTM_Status__c == 'Inactive') {
            //     objwrapcrop.gtmstatuscrop = Inactive;
            // }
            // if (obj.GTM_Status__c == 'Active') {
            //     objwrapcrop.gtmstatuscrop = Active;
            // }
            objwrapcrop.gtmstatuscrop = obj.GTM_Status__c;
            objwrapcrop.cropName = obj.Name;
            objwrapcrop.cropId = obj.Id;
            objwrapcrop.salesOrgNameCrop = obj.SalesOrg__r.Name;
            
            objwrapcrop.lastModByNameCrop= obj.LastModifiedBy.name;
            objwrapcrop.lastModifiedDateNameCrop= obj.LastModifiedDate;
            gtmWrapCropList.add(objwrapcrop);
            System.debug('Hiiiii' + gtmWrapCropList);
        }
        return gtmWrapCropList;
    }
    
    @AuraEnabled
    public static void updateProductCategoryMapStatus(String statusmap) {
        System.debug('Status Map ' + statusmap);
        List < GtmProductCompWrapper > listUpdatesItemIdnew = (List < GtmProductCompWrapper > ) json.deserialize(statusmap, List < GtmProductCompWrapper > .class);
        
        List < Product_Category_Sales_Org_Mapping__c > productCategoryMapStatusUpdated = new List < Product_Category_Sales_Org_Mapping__c > ();
        for (GtmProductCompWrapper pcsms: listUpdatesItemIdnew) {
            Product_Category_Sales_Org_Mapping__c productMapping = new Product_Category_Sales_Org_Mapping__c();
            productMapping.Id = pcsms.productCategorySalesOrgMappingId;
            productMapping.Status__c = pcsms.status ? 'Active' : 'Inactive';
            productCategoryMapStatusUpdated.add(productMapping);
        }
        
       update productCategoryMapStatusUpdated;
    }
    
    
    
    @AuraEnabled
    public static Boolean checkStatus(String pcid) {
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        String fiscalyear = getFiscalYear();
        List < GTM_Details__c > lstProductCategory = [Select Id, Name, Product_Category__c, Sales_Org__r.Name, Product_Category__r.Name from GTM_Details__c where GTM__r.Fiscal_Year__c =: fiscalyear and Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c and Product_Category__c =: pcid];
        if (lstProductCategory.size() != 0) {
            return true;
        }
        return false;
    }

    @AuraEnabled
    public static Boolean checkStatusComp(String ccpid) {
        System.debug('ccpid '+ccpid);
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        String fiscalyear = getFiscalYear();
        List < GTM_Details__c > lstComp = [Select Id, Name, 
                                           Competitor_Name_1__c, Competitor_Name_2__c,Competitor_Name_3__c,
                                           Competitor_Name_4__c, Competitor_Name_5__c,	Competitor_Name_6__c,Competitor_Name_7__c,
                                           Competitor_Name_8__c, Sales_Org__r.Name  
                                           from GTM_Details__c 
                                           where GTM__r.Fiscal_Year__c =: fiscalyear 
                                           and Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c 
                                           and (Competitor_Name_1__c =: ccpid
                                                or Competitor_Name_2__c =: ccpid 
                                                or Competitor_Name_3__c =: ccpid 
                                                or Competitor_Name_4__c =: ccpid 
                                                or Competitor_Name_5__c =: ccpid 
                                                or Competitor_Name_6__c =: ccpid 
                                                or Competitor_Name_7__c =: ccpid 
                                                or Competitor_Name_8__c =: ccpid)];
        
        System.debug('data is  '+lstComp);
        System.debug('data is size  '+lstComp.size());
        if (lstComp.size()>0) {
            return true;
        }
        return false;
    }
    
    
    @AuraEnabled
    public static Boolean checkStatusCrop(String cpid) {
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        String fiscalyear = getFiscalYear();
        List < GTM_Details__c > lstCrop = [Select Id, Name, Crop__c, Sales_Org__r.Name, Crop__r.Name from GTM_Details__c where GTM__r.Fiscal_Year__c =: fiscalyear and Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c and Crop__c =: cpid];
        if (lstCrop.size() != 0) {
            return true;
        }
        return false;
    }
    
    
    
    @AuraEnabled
    public static String getFiscalYear() {
        list < Period > listOfPeriod = new list < Period > ();
        if (Schema.sObjectType.Period.isAccessible()) {
            listOfPeriod = [SELECT FiscalYearSettings.Name, StartDate, EndDate, type FROM Period WHERE Type = 'Year'
                            AND StartDate <= TODAY AND EndDate >= TODAY limit 1
                           ];
        }
        if (listOfPeriod.size() > 0) {
            String startYear = String.valueOf(listOfPeriod[0].StartDate.year());
            String endYear = String.valueOf(listOfPeriod[0].EndDate.year());
            String fiscalyear = startYear + '-' + endYear;
            return fiscalyear;
        }
        return '';
    }
    
    
    @AuraEnabled
    public static String updateCropStatus(String statusmap) { 
        
        System.debug('Status Map ' + statusmap);
        
        List < GtmProductCompWrapper > listUpdatesItemIdnew = (List < GtmProductCompWrapper > ) json.deserialize(statusmap, List < GtmProductCompWrapper > .class);
        
        List < Crop__c > productCropStatusUpdated = new List < Crop__c > ();
        for (GtmProductCompWrapper crop: listUpdatesItemIdnew) {
            Crop__c cropMapping = new Crop__c();
            cropMapping.Id = crop.cropId;
            cropMapping.GTM_Status__c = crop.gtmstatuscrop;
            productCropStatusUpdated.add(cropMapping);
            
        }
        Integer ErrorCounter= 0;
        String returnvalue = '';
        Database.SaveResult[] SR = Database.update(productCropStatusUpdated,true);
        for(Database.SaveResult src : SR){
            if (!src.isSuccess()) {
                ErrorCounter++;
            }
        }
        
        if(ErrorCounter>0){
            returnvalue = 'false';
        }
        else if(ErrorCounter==0){
            returnvalue = 'true';
        }
        System.debug('returnvalue'+ returnvalue);
        return returnvalue;
        
    // update productCropStatusUpdated;
    }
    
       
        
    
    
    
    @AuraEnabled
    public static void setIndex(String pscm) {
        List < Product_Category_Sales_Org_Mapping__c > listIndexId = (List < Product_Category_Sales_Org_Mapping__c > ) json.deserialize(pscm, List < Product_Category_Sales_Org_Mapping__c > .class);
        System.debug('listIndexId+++++++' + listIndexId);
        update listIndexId;
    }
    
    @AuraEnabled
    public static void setcropIndex(String pscm) {
        List < Crop__c > listcropIndexId = (List < Crop__c > ) json.deserialize(pscm, List < Crop__c > .class);
        System.debug('listIndexId+++++++' + listcropIndexId);
        update listcropIndexId;
    }
    @AuraEnabled
    public static List < GtmProductCompWrapper > getCompetitorList() {
        
        List < Competitor__c > gtmcompetitorList = [Select Id, Name, Status__c From Competitor__c];
        List < Competitior_Sales_Org_Mapping__c > competitorCategoriesMapping = new List < Competitior_Sales_Org_Mapping__c > ();
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        
        for (Competitor__c gtmCompObj: gtmcompetitorList) {
            Competitior_Sales_Org_Mapping__c competitorSalesorgMap = new Competitior_Sales_Org_Mapping__c();
            // Product_Category__c pc = new Product_Category__c();
            // pc.Id= gtmProductCategory.Id;
            competitorSalesorgMap.Status__c = 'Inactive';
            competitorSalesorgMap.Sales_Org__c = gtmSo.Id;
            competitorSalesorgMap.Competitor__c = gtmCompObj.Id;
            competitorCategoriesMapping.add(competitorSalesorgMap);
            
        }
        
        List < Competitior_Sales_Org_Mapping__c > lstSalesorgCompetitorMap = [Select Id, Name, Competitor__c, CreatedBy.Name, LastModifiedDate, CreatedDate, Sales_Org__r.Name,Display_Name__c, Competitor__r.Name from Competitior_Sales_Org_Mapping__c where Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c];
        
        if (lstSalesorgCompetitorMap.size() == 0) {
            insert competitorCategoriesMapping;
        }
        
        return getCompWapper();
    }
    
    
    @AuraEnabled
    public static List < GtmProductCompWrapper > getCompWapper() {
        List < GtmProductCompWrapper > gtmWrapCompList = new List < GtmProductCompWrapper > ();
        
        Sales_Org__c gtmSo = GTMPathFinder.getSalesOrg();
        List < Competitior_Sales_Org_Mapping__c > SalesorgCompetitorMap = [Select Id, Name, Status__c,Display_Name__c, CreatedBy.Name, LastModifiedDate, CreatedDate, Competitor__c, Sales_Org__r.Name, Competitor__r.Name from Competitior_Sales_Org_Mapping__c where Sales_Org__r.Sales_Org_Code__c =: gtmSo.Sales_Org_Code__c  ];
        
        //return SalesorgProductCategoryMap;
        
        for (Competitior_Sales_Org_Mapping__c objcomp: SalesorgCompetitorMap) {
            GtmProductCompWrapper objwrap = new GtmProductCompWrapper();
            
            // if (objcomp.Status__c == 'Inactive') {
            //     objwrap.compstatus = false;
            // }
            // if (objcomp.Status__c == 'Active') {
            //     objwrap.compstatus = true;
            // }
            objwrap.compstatus = objcomp.Status__c;
            objwrap.competitorName = objcomp.Competitor__r.Name;
            objwrap.competitorCategory = objcomp.Competitor__c;
            objwrap.competitorSalesOrgMappingId = objcomp.Id;
            objwrap.compSalesOrgName = objcomp.Sales_Org__r.Name;
            System.debug(objcomp.Display_Name__c + 'Display Name ++++++Before');
            objwrap.displayName = objcomp.Display_Name__c;
            System.debug(objwrap.displayName + 'Display Name ++++++After');
            objwrap.compcreatedByName = objcomp.CreatedBy.Name;
            objwrap.complastModifiedDateName = objcomp.LastModifiedDate;
            gtmWrapCompList.add(objwrap);
            System.debug('Hiiiii' + gtmWrapCompList);
        }
        return gtmWrapCompList;
        
    }
    
    
    @AuraEnabled
    public static String updateCompetitorMapStatus(String statusmap ) {
        System.debug('Status Map ' + statusmap);
        
        List < GtmProductCompWrapper > listUpdatesItemIdnew = (List < GtmProductCompWrapper > ) json.deserialize(statusmap, List < GtmProductCompWrapper > .class);
        
        List < 	Competitior_Sales_Org_Mapping__c > CompetitorStatusUpdated = new List < 	Competitior_Sales_Org_Mapping__c > ();
        for (GtmProductCompWrapper pcsms: listUpdatesItemIdnew) {
            Competitior_Sales_Org_Mapping__c competitorMapping = new 	Competitior_Sales_Org_Mapping__c();
            competitorMapping.Id = pcsms.competitorSalesOrgMappingId;
            competitorMapping.Status__c = pcsms.compstatus;
            competitorMapping.Display_Name__c = pcsms.displayName;
            CompetitorStatusUpdated.add(competitorMapping);
        }
        Integer ErrorCounter= 0;
        String returnvalue = '';
        Database.SaveResult[] SR = Database.update(CompetitorStatusUpdated,true);
        for(Database.SaveResult src : SR){
            if (!src.isSuccess()) {
                ErrorCounter++;
            }
        }
        
        if(ErrorCounter>0){
            returnvalue = 'false';
        }
        else if(ErrorCounter==0){
            returnvalue = 'true';
        }
        System.debug('returnvalue'+ returnvalue);
        return returnvalue;
        
       // update CompetitorStatusUpdated;
    }
    
    
    
    
    
    public class GtmProductCompWrapper {
        
        @AuraEnabled
        public Boolean status {
            get;
            set;
        }
        
        @AuraEnabled
        public String salesOrgId {
            get;
            set;
        }
        
        @AuraEnabled
        public String productCategorySalesOrgMappingId {
            get;
            set;
        }
        
        @AuraEnabled
        public String salesOrgName {
            get;
            set;
        }
        
        @AuraEnabled
        public String productCategory {
            get;
            set;
        }
        
        @AuraEnabled
        public String cropName {
            get;
            set;
        }
        @AuraEnabled
        public String productCategoryName {
            get;
            set;
        }
        
        @AuraEnabled
        public String displayName {
            get;
            set;
        }
        
        @AuraEnabled
        public String createdByName {
            get;
            set;
        }
        
        @AuraEnabled
        public Datetime lastModifiedDateName {
            get;
            set;
        }
        
        @AuraEnabled
        public String gtmstatuscrop {
            get;
            set;
        }
        
        @AuraEnabled
        public String cropId {
            get;
            set;
        }
        
        @AuraEnabled
        public String salesOrgNameCrop {
            get;
            set;
        }
        
        @AuraEnabled
        public String lastModByNameCrop {get;set;}
        
        @AuraEnabled
        public Datetime lastModifiedDateNameCrop {get;set;}
        
        
        
        @AuraEnabled
        public String compstatus {
            get;
            set;
        }
        
        
        
        @AuraEnabled
        public String competitorSalesOrgMappingId {
            get;
            set;
        }
        
        @AuraEnabled
        public String compSalesOrgName {
            get;
            set;
        }
        
        @AuraEnabled
        public String competitorCategory {
            get;
            set;
        }
        
        @AuraEnabled
        public String competitorName {
            get;
            set;
        }
        
        @AuraEnabled
        public String compcreatedByName {
            get;
            set;
        }
        
        
        
        @AuraEnabled
        public Datetime complastModifiedDateName {
            get;
            set;
        }
        
    }
    
}