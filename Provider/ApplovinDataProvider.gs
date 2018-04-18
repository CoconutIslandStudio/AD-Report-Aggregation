function DataProvider_Applovin(generalConfig){
  
  var apikey = generalConfig["Applovin_apikey"];
  
  Logger.log("apikey:" + apikey);
  return new ApplovinProvider(apikey);
}




var ApplovinProvider = function(reportapikey){
 
  var reportAPIKey = reportapikey;
  var self = this;
  
  this.FetchData = function(psdata,pedata,ppkgname){
      var query_columns = 'day,impressions,clicks,ecpm,revenue';
      var query_format = 'csv';
      var query_report_type = 'publisher';
      var query_filter_pkg_name = ppkgname;
      var query_start = psdata;
      var query_end = pedata;
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
      
      return csvData;
  }
  
  
  this.Process = function(spreadsheet,sheetconfig){
  
    Logger.log('--------------Applovin----------------')
    var query_filter_pkg_name = sheetconfig.PackageName;
    var query_start = sheetconfig.StartTime;
    var query_end = sheetconfig.EndTime;
    
    
    //applovin can only fetch last 90 days data
    var valid_query_start = query_start;
    var dateStart = new Date(query_end);
    dateStart.setDate(dateStart.getDate()-88);
    if(new Date(query_start) < dateStart){
      valid_query_start = FormatDate(dateStart);
    }
    Logger.log(">>>>"+valid_query_start);
    
    
    var csvData = self.FetchData(valid_query_start,query_end,query_filter_pkg_name);
    
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    sheet.getRange('A1:H1').setValues([["Day","Revenue","eCPM",'Clicks','Impressions','Views','CompleteRate','Provider']]);
    query_start = SheetClear(sheet,query_start,query_end);
    
    var dataobj = {};
    
    for(var i =0;i< csvData.length;i++){
      var data = csvData[i];
      var obj = [data[0],data[4],data[3],data[2],data[1],0,1,'Applovin'];
      
      dataobj[data[0]] = obj;
    }
    
    


    
    ForeachDate(query_start,query_end,function(x){
        var day = FormatDate(x);
        var daydata = dataobj[day];
        if(daydata){
            sheet.appendRow(daydata);
        }
        else{
            sheet.appendRow([day,0,0,0,0,0,1,'Applovin']);
        }
    });
    
    
    Logger.log("Process applovin done!");
    
  }
  
}
