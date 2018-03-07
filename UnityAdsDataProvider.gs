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
    sheet.clear();
    //Write data
    
    var dataheader = ['Day','Revenue','Ecpm','Clicks','Completes','View'];
    sheet.appendRow(dataheader);
    
    
    var dataobj = {};
    
    for(var i = 1;i< csvData.length;i++){
    
        var cd = csvData[i];
        var datestr = cd[0].substr(0,10);
        var data = [datestr,cd[1], (cd[1] * 1000 / cd[3]).toFixed(2) ,'',cd[3],cd[2]];
        
        Logger.log(datestr);
        dataobj[datestr] = data;
    
    }
    
    ForeachDate(query_start,query_end,function(x){
      var day = FormatDate(x);
      var data = dataobj[day];
      if(data){
          sheet.appendRow(data);
      }
      else{
          sheet.appendRow([day,0,0,0,0,0]);
      }
    });
    
  }
  
}



