/*******************************************************************************************
* @Name         GTMCompetition
* @Author       Prashant Kumbhar <prashant.kumbhar@skinternational.com>
* @Date         03/08/2022
* @Group        SKI
* @Description  This class contains all  methods related to GTM Path Finder tabs (Identification,Competitor).
*******************************************************************************************/
/* MODIFICATION LOG
* Version          Developer          Date               Description
*-------------------------------------------------------------------------------------------
*  1.0              Prashant        03/08/2022           Initial Creation                                                      
*******************************************************************************************/


public with sharing class GTMCompetition {
    private static sales_org__c salesorg= GTMPathFinder.getSalesOrg();
    private static String  fiscalyear= GTMPathFinder.getFiscalYear();
    private static boolean isSalesRep = GTMPathFinder.isSalesRep;

     /*
    * @Description  This method used to get Gtm details with Competitor Record type.
    * @return       returns  GTM_Details__c having Sales org and Competitor Record type.
    */
@AuraEnabled
public static List<GTM_Details__c> getGTMCompetition(String year){
    Id userId = userInfo.getUserId();
    Id competitorRecordType = Schema.SObjectType.GTM_Details__c.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
    List<GTM_Details__c> gtmDetails = new List<GTM_Details__c>();
    
    gtmDetails = [select id,GTM_Customer__c, GTM_Customer__r.Name,GTM_Customer__r.Lead_Customer__c,Competitor_Name_1__c,Competitor_Name_1__r.Name,Indicate_share_wallet_of_competitor_1__c,Competitor_Name_2__c,Indicate_share_wallet_of_competitor_2__c,Competitor_Name_3__c,Indicate_share_wallet_of_competitor_3__c,Competitor_Name_4__c,Indicate_share_wallet_of_competitor_4__c,Competitor_Name_5__c,Indicate_share_wallet_of_competitor_5__c,Competitor_Name_6__c,Indicate_share_wallet_of_competitor_6__c,Competitor_Name_7__c,Indicate_share_wallet_of_competitor_7__c,Competitor_Name_8__c,Indicate_share_wallet_of_competitor_8__c,UPL_Position__c,UPLs_share_of_wallet__c,Competitor_Name_2__r.Name,Competitor_Name_3__r.Name,Competitor_Name_4__r.Name,Competitor_Name_5__r.Name,Competitor_Name_6__r.Name,Competitor_Name_7__r.Name,Competitor_Name_8__r.Name,GTM_Customer__r.Path_Finder__c,isSubmitted__c,GTM_Customer__r.recordTypeId from GTM_Details__c where recordTypeId=:competitorRecordType and Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c AND GTM__r.Fiscal_Year__c=:year  order by  GTM_Customer__r.Name ASC];
    if(gtmDetails.size()==0){
        return GTMPathFinderHelper.createGTMDetail(year);
    }
        return gtmDetails;
}
   
   /*
    * @Description  This method used to update Gtm details of two fields.
    * @return       returns  GTM_Details__c 
    */
 @AuraEnabled
 public static GTM_Details__c  updateshare(String recordId)
 {

    GTM_Details__c upshare=[select Id,GTM_Customer__c,GTM_Customer__r.Name,GTM_Customer__r.Lead_Customer__c,UPL_Position__c,UPLs_share_of_wallet__c,GTM_Customer__r.Path_Finder__c from GTM_Details__c where Id=:recordId];
    upshare.UPL_Position__c=null;
    upshare.UPLs_share_of_wallet__c=null;
    
    update upshare;
    return upshare;

 }
    /*
    * @Description  This method used to get  Gtm Information
    * @return       returns  GTM__c 
    */

 @AuraEnabled
 public static List<GTM__c> getGtm(String year)
 {
    List<GTM__c> gtmp = new  List<GTM__c>();
    Id userId = userInfo.getUserId();
        gtmp = [Select Id,Name,Fiscal_Year__c,Email__c,Role__c,Sales_Rep_Name__c,Sales_org__r.name from GTM__c where  Fiscal_Year__c=:year and Sales_Org__r.Sales_Org_Code__c=:salesorg.Sales_Org_Code__c and Sales_Rep__c=:userId];
       
       return gtmp;  
     
 }
    /*
    * @Description  This method used to update   Gtm Information
    * @return       returns  GTM__c 
    */


    @AuraEnabled
  public static GTM__c  updateGTM(String recordId,String name,String value)
  {
   
    GTM__c upgtm1=[select Id,Name,Fiscal_Year__c,Email__c,Role__c,Sales_Rep_Name__c from GTM__c where  Id=:recordId   ];
    if(name=='Role__c')
    {
        upgtm1.Role__c=value;
    }
    else if(name=='Email__c')
    {
        upgtm1.Email__c=value;
    }
    else if(name=='Sales_Rep_Name__c')
    {
        upgtm1.Sales_Rep_Name__c=value;
    }
    update upgtm1;
    return upgtm1;
    
   }


   public class CompetitorWrapper
   {
       @AuraEnabled
       public  String competitiorname;
       @AuraEnabled
       public  String competitiorId ;

       public CompetitorWrapper(String competitiorId,String competitiorname)
       {
          this.competitiorname=competitiorname;
          this.competitiorId=competitiorId;
       }
       public CompetitorWrapper()
       {

       }

   }
    
 }