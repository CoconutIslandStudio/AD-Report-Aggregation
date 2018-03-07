var vungleProvider = function(apiid){
  
  var vungleAPIID = apiid;
  
  this.Process = function(spreadsheet,sheetConfig){
      Logger.log('-------------Vungle--------------')
  
    var auth_str = 'Bearer '+vungleAPIID;
    var req_option = {
    'method': 'get',
    'headers': {
      'Authorization': auth_str,
      'Vungle-Version': 1,
      'Accept': 'application/json'
    }};
    //Haywire Hospital (iOS)
    //https://dashboard.vungle.com/dashboard/applications/567a4807d1a7bc3c70000026/details
    var query_appid = sheetConfig.AppID;
    
    //incentivized ad only
    var query_incentivized = 'false';
    
    var query_dimension = 'date';
    var query_aggregates = 'views,completes,revenue,ecpm,clicks';
    var query_start = sheetConfig.StartTime;
    var query_end = sheetConfig.EndTime;
    
    var query_str = Utilities.formatString('dimensions=%s&aggregates=%s&start=%s&end=%s&applicationId=%s,incentivized=%s',
                                           query_dimension,query_aggregates,query_start,query_end,query_appid,query_incentivized);
    Logger.log('Vungle querystr: %s',query_str);
    var req_url = 'https://report.api.vungle.com/ext/pub/reports/performance?';
    //Make Post
    var resp = UrlFetchApp.fetch(req_url+query_str, req_option);
    
    var receive_data = resp.getContentText();
    var datajson = JSON.parse(receive_data);
    
    Logger.log("process vungle done!");
    
    
    datajson.sort(function(x,y){
    var d1 = x['date'];
    var d2 = y['date'];
    return d1.localeCompare(d2);
  });
    
    
    var sheet = spreadsheet.getSheetByName(sheetConfig.Table);
    sheet.clear();
    
    sheet.appendRow(["Day","Revenue","eCPM",'Clicks','Completes','Views'])
    
    var dataobj = {};
    
    for(var i=1;i < datajson.length; i++){
      var data = datajson[i];
 
      var objs = [data['date'],data['revenue'],data['ecpm'],data['clicks'],data['completes'],data['views']];
      dataobj[data['date']] = objs;
      //sheet.appendRow(objs);
    }
    
    ForeachDate(query_start,query_end,function(x){
        var day = FormatDate(x);
        var daydata = dataobj[day];
        if(daydata){
            sheet.appendRow(daydata);
        }
        else{
            sheet.appendRow([day,0,0,0,0,0]);
        }
    })
    
  }
  
  
}

function DataProvider_Vungle(genericConfig){
  
  var apiid = genericConfig['VungleId'];
  
  return new vungleProvider(apiid);
}
