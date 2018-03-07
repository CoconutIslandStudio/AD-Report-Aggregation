function DataProvider_Mobvista(generalConfig){
  
  var apikey = generalConfig["Applovin_apikey"];
  
  Logger.log("apikey:" + apikey);
  return new ApplovinProvider(apikey);
}

var MobvistaProvider = function(reportapikey){
 
  var reportAPIKey = reportapikey;
  this.Process = function(spreadsheet,sheetconfig){
    
    var query_columns = 'day,impressions,clicks,ecpm,revenue';
    var query_format = 'csv';
    var query_report_type = 'publisher';
    var query_filter_pkg_name = sheetconfig.PackageName;
    var query_start = sheetconfig.StartTime;
    var query_end = sheetconfig.EndTime;
    var query_str = Utilities.formatString('api_key=%s&start=%s&end=%s&columns=%s&report_type=%s&filter_package_name=%s&format=%s',
                                        reportAPIKey,
                                        query_start,
                                        query_end,
                                        query_columns,
                                        query_report_type,
                                        query_filter_pkg_name,
                                        query_format
                                        );
    var query_url = 'https://r.applovin.com/report?';
    var resp = UrlFetchApp.fetch(query_url + query_str);
    
    var receive_data = resp.getContentText();
    var csvData = Utilities.parseCsv(receive_data);
    
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    sheet.clear();
    
    for(var i =0;i< csvData.length;i++){
      
      
      var data = csvData[i];
      var obj = [data[0],data[4],data[3],data[2],data[1]];
      
      Logger.log(obj);
      
      sheet.appendRow(obj);
    }
    
    Logger.log("Process applovin done!");
    
    return query_url + query_str;
  }
  
}
