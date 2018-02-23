function ADReportAggregation(sheetId,sheetName){
  var config = new ConfigSheet(sheetId,sheetName);
  config.Verify();
  config.Run();
}