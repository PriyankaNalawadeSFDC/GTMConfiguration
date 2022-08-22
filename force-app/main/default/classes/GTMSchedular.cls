/*******************************************************************************************
* @Name         GTMSchedular
* @Author       Vishal Pawar <vishal.pawar@skinternational.com>
* @Date         05/04/2022
* @Group        SKI
* @Description  This class execute when gtm details not submitted
Test Class Name :- GTMSchedularTest
*******************************************************************************************/
                                                     


global class GTMSchedular implements Schedulable {   
    
    global void execute(SchedulableContext sc){ 
    GTMBatchSchedular obj = new GTMBatchSchedular();
        Database.executeBatch(obj,1000);
    
    }
    
}