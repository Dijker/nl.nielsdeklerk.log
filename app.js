"use strict";
const Homey = require("homey");
const DBLIMIT = 2000;
let loggingDB = [];

function isArray(a) {
  return !!a && a.constructor === Array;
}

// The heart of this app.
function addLogToDB(data, group) {
  const logLine = { data, group, date: new Date() };
  console.log("count: " + loggingDB.length);
  if (loggingDB.length > DBLIMIT) {
    let tomuch = loggingDB.length - DBLIMIT;
    console.log("tomuch: " + tomuch);
    loggingDB.splice(0, tomuch);
  }
  loggingDB.push(logLine);
  Homey.ManagerSettings.set("loggingDB", loggingDB);
}

//App Class...
class simpleLog extends Homey.App {
  onInit() {
    loggingDB = Homey.ManagerSettings.get("loggingDB");
    if (!isArray(loggingDB)) {
      loggingDB = [];
    }
    addLogToDB('App "Simple LOG" started.', "Simple LOG");
  }
  apiPutAddlog(data) {
    if (data && data.body && data.body.log) {
      addLogToDB(data.body.log, data.body.group);
    }
  }
  apiClearLog() {
    loggingDB = [];
    addLogToDB("Cleared all logging data", "Simple LOG");
  }
  getLog() {
    return loggingDB;
  }
}
module.exports = simpleLog;

// FLOW Action Card, actionInputLog
let actionInputLog = new Homey.FlowCardAction("Input_log");
actionInputLog.register().registerRunListener((args, state) => {
  console.log(args);
  console.log(state);
  addLogToDB(args.log);
  return true;
});

// FLOW Action Card, actionInputLog
let actionInputGroupLog = new Homey.FlowCardAction("Input_group_log");
actionInputGroupLog.register().registerRunListener((args, state) => {
  addLogToDB(args.log, args.group);
  return true;
});

// FLOW Action Card, actionClearlogOlder
let actionClearlogOlder = new Homey.FlowCardAction("Clear_log_Older");
actionClearlogOlder.register().registerRunListener((args, state) => {
  console.log("Removing log data older then " + args.days + " Day(s).");
  let newloggingDB = [];
  for (let i in loggingDB) {
    if ((new Date() - new Date(loggingDB[i].date)) / 86400000 <= args.days) {
      newloggingDB.push(loggingDB[i]);
    }
  }
  loggingDB = newloggingDB;
  Homey.ManagerSettings.set("loggingDB", loggingDB);
  return true;
});

// FLOW Action Card, actionClearlog
let actionClearlog = new Homey.FlowCardAction("Clear_log");
actionClearlog.register().registerRunListener((args, state) => {
  loggingDB = [];
  addLogToDB("Cleared all logging data", "Simple LOG");
  return true;
});
