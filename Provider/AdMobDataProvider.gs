function generateReport(adClientId,sheetconfig){
  
  var startDate = sheetconfig.StartTime;
  var endDate = sheetconfig.EndTime;
  var adUnitId = sheetconfig.AdUnit;
  
  
  
  var metricAry = new Array();
  
  var configmetric = sheetconfig.Metric;
  for(map in configmetric){
    if(configmetric[map]){
     
      var c = configmetric[map];
      if(c === "revenue"){
        metricAry.push("EARNINGS");
      }
      else if(c === "clicks"){
        metricAry.push("CLICKS");
      }
      else if(c === "completes"){
        metricAry.push("INDIVIDUAL_AD_IMPRESSIONS"); 
      }
      else if(c === "ecpm"){
        metricAry.push("PAGE_VIEWS_RPM"); 
      }
    }
    
  }
  
  var report = AdSense.Reports.generate(startDate,endDate,{
    filter : ['AD_CLIENT_ID=='+escapeFilterParameter(adClientId),'AD_UNIT_ID=='+adUnitId],
    metric: metricAry,
    dimension: ['DATE'],
    sort: ['+DATE'],
    currency: ['CNY'],
    useTimezoneReporting: true
  });
  
  return report;
}

function escapeFilterParameter(parameter) {
  return parameter.replace('\\', '\\\\').replace(',', '\\,');
}


var AdMobProvider = function(adClientId){
  
  var clientId = adClientId;
  
  this.Process = function(spreadsheet,sheetconfig){    
    var report = generateReport(clientId,sheetconfig);
    
    if(sheetconfig.AdMobClientId){
      clientId = sheetconfig.AdMobClientId;
    }
  
    var headers = report.headers.map(function(header) {
      return header.name;
    });
    
    Logger.log(headers);
    
    var sheet = spreadsheet.getSheetByName(sheetconfig.Table);
    sheet.clear();
    
    var headerary = new Array(headers);
    sheet.getRange(1,1,1,headers.length).setValues(headerary);
    
    
    var retAry = new Array();
    
    var datarows = report.rows;
    
    sheet.getRange(2,1,datarows.length,headers.length).setValues(datarows);
    Logger.log("Process AdMob done!");
  }
  
}

function DataProvider_AdMob(generalConfig){
  
  var adClientId = generalConfig["AdMob_ClientId"].toString();
  return new AdMobProvider(adClientId);
}
