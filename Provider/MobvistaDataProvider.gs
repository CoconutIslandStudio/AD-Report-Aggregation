function DataProvider_Mobvista(generalConfig){
  
  var sdkkey = generalConfig['MobvistaSDKKey'];
  var sdksecret = generalConfig['MobvistaSDKSecret']
  
  return new MobvistaProvider(sdkkey,sdksecret);
}

var MobvistaProvider = function(sdkkey,sdksecret){
 
 
 Logger.log('=========== Mobvista ===========')
  var mv_sdkkey = sdkkey;
  var mv_sdksecret = sdksecret;
  
  //startdate : Date
  this.QueryData = function(spreadsheet,sheetconfig,startdate,dataary){
  
     var time = Math.floor(Date.now()/ 1000);
     var start = Utilities.formatDate(startdate,"UTC","yyyyMMdd");
     
     var end = new Date(startdate);
     end.setDate(end.getDate() + 7);
     
     end = Utilities.formatDate(end,"UTC","yyyyMMdd");
     
     var query_columns = 'date%2Capp_id%2Cclick%2Cimpression%2Cfilled%2Cfill_rate%2Cest_revenue';
     var query_str = Utilities.formatString('end=%s&group_by=%s&limit=200&page=1&skey=%s&start=%s&time=%s&v=1.0',
                end,
                query_columns,
                mv_sdkkey,
                start,
                time);
    var sig = signMd5(signMd5(query_str) + mv_sdksecret);
    query_str = query_str + "&sign="+ sig;       
    var query_url = 'http://oauth2.mobvista.com/m/report/offline_api_report?';
    var final_url = query_url + query_str;
    
    //Logger.log(final_url);
    
    var resp = UrlFetchApp.fetch(final_url);
    var receive_data = resp.getContentText();
    var datajson = JSON.parse(receive_data);
    var jdata = datajson['data'];
    var jdatalist = jdata['lists'];
    
    for(var i=0;i< jdatalist.length;i++){
       var dataitem = jdatalist[i];
       if(!strComp(dataitem.app_id,sheetconfig.APPID)) continue;
       var dt = dataitem.date.toString();
       dataary[dt] = dataitem;
    }
  }
  
  this.Process = function(spreadsheet,sheetconfig){
  
    var query_start = sheetconfig.StartTime;
    var query_end = sheetconfig.EndTime;
    var dataary = {};
   
   
   var datestep = new Date(query_start);
   var dateend = new Date(query_end);
   while(datestep < dateend){
       this.QueryData(spreadsheet,sheetconfig,datestep,dataary);
       
       datestep.setDate(datestep.getDate() + 7);
   }
   
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    sheet.getRange('A1:H1').setValues([["Day","Revenue","eCPM",'Clicks','Impressions','Views','CompleteRate','Provider']]);
    query_start = SheetClear(sheet,query_start,query_end);

    ForeachDate(query_start,query_end,function(x){
        var day = Utilities.formatDate(x,"UTC","yyyyMMdd");
        
        var daystr = Utilities.formatDate(x,"UTC","yyyy-MM-dd");
        
        var daydata = dataary[day];
        
        
        if(daydata){
            var ecpm = daydata.impression == 0 ? 0: daydata.est_revenue *1000.0 / daydata.impression;
            var revenue = daydata.est_revenue;
            var click = daydata.click;
            var obj = [daystr,revenue.toFixed(2),ecpm.toFixed(2),click,daydata.impression,0,1,'Mobvista'];
            sheet.appendRow(obj);
        }
        else{
            sheet.appendRow([daystr,0,0,0,0,0,1,'Mobvista']);
        }
    })
    
    Logger.log("Process Mobvista done!");
    
    return "";
  }
  
}
