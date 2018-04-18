function DataProvider_Unity(generalConfig){
 var apikey = generalConfig['UnityAdsId']; 
  
  Logger.log('unitykey: '+ apikey);
  return new UnityProvider(apikey);
}

var UnityProvider = function(unitykey){
  
  var reportkey = unitykey;
  
  this.Process = function(spreadsheet,sheetconfig){
   
   
   Logger.log('---------UnityAds--------')
     
    var query_field = 'revenue,started,views,eCPM';
    var query_start = sheetconfig.StartTime;
    var query_end = sheetconfig.EndTime;
    var query_sourceIds = sheetconfig.GameId;
    
    Logger.log('querytime %s - %s',query_start,query_end);
    
    var query_str = Utilities.formatString('apikey=%s&fields=%s&start=%s&end=%s&sourceIds=%s&splitBy=none',
                                           reportkey,
                                           query_field,
                                           query_start,
                                           query_end,
                                           query_sourceIds);
    
    var req_url = 'https://gameads-admin.applifier.com/stats/monetization-api?';
    var req_option = {
    'method': 'get',
    'headers': {
      'Accept': 'application/json'
    }};
    var resp = UrlFetchApp.fetch(req_url+query_str, req_option);
    var receive_data = resp.getContentText();
    
    var csvData = Utilities.parseCsv(receive_data);
  
    Logger.log("data length:" +csvData.length);
    
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    
    query_start = SheetClear(sheet,query_start,query_end);
    sheet.getRange('A1:H1').setValues( [['Day','Revenue','Ecpm','Clicks','impression','View','CompleteRate','Provider']]);
    
    
    var dataobj = {};
    
    for(var i = 1;i< csvData.length;i++){
    
        var cd = csvData[i];
        var datestr = cd[0].substr(0,10);
        
        var revenue = cd[1];
        var impression = cd[3];
        var ecpm = (impression > 0 ? (revenue *1000 / impression) : 0 ).toFixed(2);
        var view = cd[2];
        var complteteRate = (impression *1.0 / view).toFixed(2);
        var data = [datestr,revenue,ecpm,0,impression,view,complteteRate,'UnityAds'];
        dataobj[datestr] = data;
    
    }
    
    ForeachDate(query_start,query_end,function(x){
      var day = FormatDate(x);
      var data = dataobj[day];
      if(data){
          sheet.appendRow(data);
      }
      else{
          sheet.appendRow([day,0,0,0,0,0,1,'UnityAds']);
      }
    });
    
  }
  
  
  this.ProcessRealTime = function(spreadsheet,sheetconfig){
   
   
   Logger.log('==========UnityAdsRealTime=========')
     
    var query_field = 'revenue,started,views,eCPM';
    var query_start = sheetconfig.EndTime;
    var query_end = sheetconfig.EndTime;
    var query_sourceIds = sheetconfig.GameId;
    
    Logger.log('querytime %s - %s',query_start,query_end);
    
    var query_str = Utilities.formatString('apikey=%s&fields=%s&start=%s&end=%s&sourceIds=%s&splitBy=none',
                                           reportkey,
                                           query_field,
                                           query_start,
                                           query_end,
                                           query_sourceIds);
    
    var req_url = 'https://gameads-admin.applifier.com/stats/monetization-api?';
    var req_option = {
    'method': 'get',
    'headers': {
      'Accept': 'application/json'
    }};
    var resp = UrlFetchApp.fetch(req_url+query_str, req_option);
    var receive_data = resp.getContentText();
    
    var csvData = Utilities.parseCsv(receive_data);
  
    Logger.log("data length:" +csvData.length);
    
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    
    
    if(csvData == null || csvData.length >=2){
        return;
    }
    
    
    var day = new Date();
    day.setMinutes(0);
    day.setSeconds(0);
    day.setMilliseconds(0);
    
    
    var rt_sheet = sheet;
    var rt_newdate = remotedt;
    var remotedt = new Date(query_end);
    remotedt.setHours(day.getHours());
    var fmtday = FormatDate(remotedt);
    
    var rt_newdata = null;
    var data = csvData[csvData.length -1];
    if(data != null){
    
        var cd = data;
        var datestr = cd[0].substr(0,10);
        
        var revenue = cd[1];
        var impression = cd[3];
        var ecpm = (impression > 0 ? (revenue *1000 / impression) : 0 ).toFixed(2);
        var view = cd[2];
        var complteteRate = (impression *1.0 / view).toFixed(2);
        rt_newdata = [day.toISOString(),revenue,ecpm,0,impression,view,complteteRate,'UnityAds'];
    }
    
    
    InsertRealTimeData(rt_sheet,rt_newdate,rt_newdata);
    
    
  }
  
}



