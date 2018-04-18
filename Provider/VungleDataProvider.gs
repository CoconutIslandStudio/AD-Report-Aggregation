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
    //sheet.clear();
    
    sheet.getRange('A1:H1').setValues([["Day","Revenue","eCPM",'Clicks','Impressions','Views','CompleteRate','Provider']]);
    
    query_start = SheetClear(sheet,query_start,query_end);
    
    Logger.log("sheet clear: "+ query_start);
    
    
    var dataobj = {};
    
    for(var i=1;i < datajson.length; i++){
      var data = datajson[i];
      
      
      var complete = data['completes'];
      var view = data['views'];
      var completeRate = (complete == 0 ? 1: (complete*1.0 / view)).toFixed(2);
 
      var objs = [data['date'],data['revenue'],data['ecpm'],data['clicks'],data['completes'],data['views'],completeRate,'Vungle'];
      
      dataobj[data['date']] = objs;
      //sheet.appendRow(objs);
    }
    
    Logger.log(query_start+"-"+query_end);
    
    ForeachDate(query_start,query_end,function(x){
        var day = FormatDate(x);
        var daydata = dataobj[day];
        if(daydata){
            //SheetSetRow(sheet,'A','H',rowindex,daydata);
            sheet.appendRow(daydata);
        }
        else{
            //SheetSetRow(sheet,'A','H',rowindex,[day,0,0,0,0,0,1,'Vungle']);
            sheet.appendRow([day,0,0,0,0,0,1,'Vungle']);
        }
    })
    
  }
  
  
}

function DataProvider_Vungle(genericConfig){
  
  var apiid = genericConfig['VungleId'];
  
  return new vungleProvider(apiid);
}
