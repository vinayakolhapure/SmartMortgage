import "../stylesheets/app.css";
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import { default as BigNumber} from 'bignumber.js';
// Import our contract artifacts and turn them into usable abstractions.
import asset_artifacts from '../../build/contracts/AssetRegistry.json';
import mortgage_artifacts from '../../build/contracts/SmartMortgage.json';

var AssetRegistry = contract(asset_artifacts);
var SmartMortgage = contract(mortgage_artifacts);
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    AssetRegistry.setProvider(web3.currentProvider);
    SmartMortgage.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      console.log("Coinbase: " + web3.eth.coinbase);
      //self.refreshBalance();
    });
  },

  searchAssetByID: function() {
    var self = this;
    var searchID = parseInt(document.getElementById("searchID").value);
    var meta;
    AssetRegistry.deployed().then(function(instance) {
    meta = instance;
    return meta.getAssetByAssetID.call(searchID);
    }).then(function(returnVal) {
	    console.log(returnVal);
      var searchResult = document.getElementById("searchResult");
      if(returnVal[4]!='0x0000000000000000000000000000000000000000'){
        var li = document.createElement('LI');
        li.className += "list-group-item";
        li.innerHTML = 'Asset ID: ' + returnVal[0] + ', Block: ' + returnVal[1] + ', Borough: ' + returnVal[2] + ', Lot: ' + returnVal[3] + ', Current Owner: ' + returnVal[4];
        searchResult.appendChild(li);
      } else{
        var errorInput = document.createElement('P');
        errorInput.innerHTML = 'No asset with ID: ' + returnVal[0] + ' exists on the network.';
        searchResult.appendChild(errorInput);
      }
    }).catch(function(e) {
      console.log(e);
    });
  },

  getAssetID: function() {
    var self = this;
    var block = parseInt(document.getElementById("getBlock").value);
    var borough = parseInt(document.getElementById("getBorough").value);
    var lot = parseInt(document.getElementById("getLot").value);
    var meta;
    console.log(block + ', ' + borough + ', ' + lot);
    AssetRegistry.deployed().then(function(instance) {
    meta = instance;
    return meta.getAssetIDByBBL.call(block,borough,lot);
    }).then(function(returnVal) {
	    console.log(returnVal);
      var returnAssetID = document.getElementById("returnAssetID");
      returnAssetID.innerHTML = 'Asset ID: ' + returnVal;
    }).catch(function(e) {
      console.log(e);
    });
  },

  updateAsset: function() {
    var self = this;
    var newOwner = document.getElementById("newOwner").value;
    var assetToUpdate = parseInt(document.getElementById("assetToUpdate").value);
    var meta;
    console.log(newOwner + ', ' + assetToUpdate);
    AssetRegistry.deployed().then(function(instance) {
    meta = instance;
    //return meta.createAsset(1,2,3, web3.eth.coinbase, {from: web3.eth.coinbase});
    return meta.updateAssetInfo(newOwner,assetToUpdate, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
	  console.log(returnVal);
	  var assetLog = returnVal.logs[0].args;
    document.getElementById("updateAssetLoader").style.visibility = "hidden";
    var log = 'Success! ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Current Owner: ' + assetLog.currentOwner;
	  self.createAlert("updateResult",log, 0);
    //result.innerHTML = 'Event: ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Current Owner: ' + assetLog.currentOwner;
  }).catch(function(e) {
    var log = 'Update Error! User unauthorized, or invalid input';
    document.getElementById("updateAssetLoader").style.visibility = "hidden";
    self.createAlert("updateResult",log, 1);
      console.log(e);
    });
  },

  createAlert: function (elementId, log, status){
   var myAlert = document.getElementById(elementId);
   console.log("Status: " + status);
   if(status==0)
    myAlert.className += " " + "alert-success";
   if(status==1) 
    myAlert.className += " " + "alert-danger";
	 var child = myAlert.getElementsByTagName("P")[0];
   console.log("create Alert " + child);
	 if(child==null){
				child = document.createElement("P");
				myAlert.appendChild(child);
        console.log("create Alert " + child);
	 }
	 child.innerHTML = log;
	 myAlert.style.display = "block";
	 var span = document.getElementsByClassName("close")[0];
	 span.onclick = function() {
   child.innerHTML = "";
			myAlert.style.display = "none";
		} 
  },

  createAsset: function() {
    console.log("Called");
    var self = this;
    var owner = document.getElementById("owner").value;
    var block = parseInt(document.getElementById("block").value);
	  var borough = parseInt(document.getElementById("borough").value);
	  var lot = parseInt(document.getElementById("lot").value);
	
    var meta;
    AssetRegistry.deployed().then(function(instance) {
      meta = instance;
      document.getElementById("createAssetLoader").style.visibility = "visible";
      return meta.createAsset(block, borough, lot, owner, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
    //var feedback = document.getElementById("createFeedback");
	  var assetLog = returnVal.logs[0].args;
    //'Event: ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Block: ' + assetLog.block + ', Borough: ' + assetLog.borough + ', Lot: ' + assetLog.lot + ', Current Owner: ' + assetLog.currentOwner;
    var log = 'Success! ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Current Owner: ' + assetLog.currentOwner;
	  self.createAlert("createAssetAlert",log, 0);
    document.getElementById("createAssetLoader").style.visibility = "hidden";
	  console.log(returnVal);	  
	    //console.log(returnVal.logs);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      var log = "Error! Creating Asset, invalid input or invalid user";
      document.getElementById("createAssetLoader").style.visibility = "hidden";
      self.createAlert("createAssetAlert",log, 1)
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR CREATING ASSET");
      //self.setStatus("UNAUTHORIZED USER ACCOUNT");
    });
  },
 /*
  var li = document.createElement('LI');
        li.className += "list-group-item";
        li.innerHTML = 'Asset ID: ' + returnVal[0] + ', Block: ' + returnVal[1] + ', Borough: ' + returnVal[2] + ', Lot: ' + returnVal[3] + ', Current Owner: ' + returnVal[4];
        searchResult.appendChild(li);
  */ 
  getLogs: function() {
	var meta;
  var heading = document.getElementById("panel_creation_logs");
  var h3=document.createElement("h3");
  h3.innerHTML="";
  h3.innerHTML="All Created Assets";
  heading.appendChild(h3);
	AssetRegistry.deployed().then(function(instance) {
		meta = instance;
		var events = meta.allEvents({fromBlock: 0, toBlock: 'latest'}, function(error,log){
			if(!error){
				console.log(log.event);
        if(log.event=='AssetCreatedEvent'){
          var logs = document.getElementById("logs");
          var logList = document.createElement('LI');
          logList.className += "list-group-item";
          logList.innerHTML = 'Asset ID: ' + log.args.assetId + ', Block: ' + log.args.block + ', Borough: ' + log.args.borough + ', Lot: ' + log.args.lot;
          logs.appendChild(logList);
        }
      }
		});
		events.stopWatching();//Don't know if this works.
	});
  },
  createMortgage: function() {
    console.log("Called");
    var curr = new Date();
    
    var dt = (curr.getTime());
    var self = this;
    var assetid = parseInt(document.getElementById("assetid").value);
    var time = Math.round(dt);
	  var mortgagee = document.getElementById("mortgagee").value;
	  var mortgagor = document.getElementById("mortgagor").value;
    //var datestart = mm+"-"+date+"-"+year;
    var userDate = document.getElementById("loanStart").valueAsDate;
    var datestart = Date.parse(userDate);
    console.log("date start: " + datestart);
    var principal = parseInt(document.getElementById("principal").value);
    var term = parseInt(document.getElementById("term").value);
    var interestwhole = parseInt(document.getElementById("interestwhole").value);
    var fraction = parseInt(document.getElementById("interestfraction").value);
    console.log("Date time" + dt);
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.createNewMortgage(assetid,time, mortgagee, mortgagor,datestart,principal,term,interestwhole,fraction, web3.eth.coinbase, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
	  var mortgageLog = returnVal.logs[0].args;
    document.getElementById("crMortgageLoader").style.visibility = "hidden";
    var log = 'Success! ' + 'Pending approval' + ' Event: ' + returnVal.logs[0].event + ' Mortgage ID: ' + mortgageLog.morgageId +  ', Mortgagee: ' + mortgageLog.indexMortgagee + ', Mortgagor: ' + mortgageLog.indexMortgagor;
    self.createAlert("createMortgageAlert",log, 0);
    console.log("AFTER RETURNVAL"); 
	  console.log(returnVal);	  
    }).catch(function(e) {
      var logE = 'Error creating mortgage! User unauthorized, or invalid input';
      document.getElementById("crMortgageLoader").style.visibility = "hidden";
      self.createAlert("createMortgageAlert",logE, 1);
      console.log(e);
	    console.log("ERROR CREATING Mortgage");
    });
  },
  updateMortgage: function() {
    console.log("Called");
    var self = this;
    var mortgageId = parseInt(document.getElementById("mortgageId").value);
    //var time = hh+":"+mm;
    var inputTime = new Date();
    var mstime = new Date(inputTime);
    var time = mstime.getTime();

	  var mortgagee = document.getElementById("mortgagee").value;
	  var mortgagor = document.getElementById("mortgagor").value;    
    var inputDate = document.getElementById("datestart").value;
    var msdate = new Date(inputDate);
    var datestart = msdate.getTime();
    var principal = parseInt(document.getElementById("principal").value);
    var term = parseInt(document.getElementById("term").value);
    var interestwhole = parseInt(document.getElementById("interestwhole").value);
    var fraction = parseInt(document.getElementById("interestfraction").value);
	
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.proposedMortgageUpdate(mortgageId,time, mortgagee, mortgagor,datestart,principal,term,interestwhole,fraction, web3.eth.coinbase, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
	  var mortgageLog = returnVal.logs[0].args;
    document.getElementById("upMortgageLoader").style.visibility = "hidden";
    var log = 'Success!' + 'Event: ' + returnVal.logs[0].event + ' Mortgage ID: ' + mortgageLog.indexMortgageId +  ', Mortgagee: ' + mortgageLog.indexMortgagee + ', Mortgagor: ' + mortgageLog.indexMortgagor;
    self.createAlert("updateMortgageAlert",log, 0);
    console.log("AFTER RETURNVAL");
	  console.log(returnVal);	  
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      var logE = 'Error creating asset! User unauthorized, or invalid input';
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      self.createAlert("updateMortgageAlert",logE, 1);
      console.log(e);
	    console.log("ERROR CREATING Mortgage");
    });
  },

  pendingRequests: function(){
    //console.log("test");
    var self = this;
    document.getElementById("pendingPanel").style.visibility = "visible";
    self.newMortgageRequest();  
  },

  newMortgageRequest:function(){
    var self = this;
    var mortgageIds = [];
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      console.log(web3.eth.coinbase);
      return meta.getMortgageIds.call(web3.eth.coinbase);
    }).then(function(returnVal) {
      console.log(returnVal);
      var todonew = document.getElementById("todoNew");
      console.log("array length: " + returnVal.length)
      for(var i=0; i< returnVal.length; i++){
        //console.log('I: ' +i);
        self.getNewMortgageRequest(returnVal[i]);
    }
    }).catch(function(e) {
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },

  getNewMortgageRequest:function(id){
    var mortgageId = id;
    console.log("pending update" + ' ' + id);
    var meta;
    var todoUpdate = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getMortgageByMortgageID.call(mortgageId);
    }).then(function(returnVal) {
      //call get mortgagePendingInfo.
      console.log(returnVal);
      if(returnVal[1]!='0x0000000000000000000000000000000000000000'){//mortgagee don't have new mortgage requests. Only Update.
        if(returnVal[8]){
          //'MortgageId: ' + mortgageId + ', Mortgagee: ' + returnVal[1] + ', Mortgagor: ' + returnVal[2];
          var tableRef = document.getElementById('newReqTable').getElementsByTagName('tbody')[0];
          tableRef.innerHTML = "";
          var newRow   = tableRef.insertRow(tableRef.rows.length);
          //mortgageID
          var newCell  = newRow.insertCell(0);
          var mortID  = document.createTextNode(returnVal[0]);
          newCell.appendChild(mortID);
          //mortgagee
          var mortgageeCell  = newRow.insertCell(1);
          var mortgageeVal = document.createTextNode(returnVal[2]);
          mortgageeCell.appendChild(mortgageeVal);
          //mortgagor
          var mortgagorCell  = newRow.insertCell(2);
          var mortgagorVal = document.createTextNode(returnVal[3]);
          mortgagorCell.appendChild(mortgagorVal);
          //buttons
          var buttonsCell = newRow.insertCell(3);
          var btn = document.createElement('button');
          
          btn.className += " " +"btn";	
          btn.className += " " +"btn-success";	
          btn.innerText = "Accept";
          
          var space  = document.createTextNode(' ');
          buttonsCell.appendChild(space);
          
          btn.setAttribute("onclick","App.acceptNew(this)");
          var btn2 = document.createElement('button');
          
          btn2.className += " " +"btn";	
          btn2.className += " " +"btn-danger";
          btn2.innerText  = "Reject";
          btn2.setAttribute("onclick","App.rejectNew(this)");

          buttonsCell.appendChild(btn);
          buttonsCell.appendChild(space);
          buttonsCell.appendChild(btn2);
        }
      }
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },

  acceptNew: function(el) {
    var self = this;
    var mortgageID = el.parentNode.parentNode.cells[0].innerHTML;
    var buttons = el.parentNode.parentNode.cells[3];
    
    var meta;
    console.log("accept new");
    //var todoNew = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.acceptNewMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      var log = "Success! Mortgage Created";
      self.createAlert("signoffMortgage",log, 0);
      console.log(returnVal);
      buttons.innerHTML="";
      var msg = document.createElement('P');
      msg.className += " " + "alert-success";
      msg.innerHTML="Submitted!"
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      buttons.appendChild(msg);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      var log = "Error! Unauthorized user or technical problem!";
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      self.createAlert("signoffMortgage",log, 1);
      console.log(e);
	    console.log("ERROR Accept New Mortgage");
    });
  },
  rejectNew: function(el) {
    var self = this;
    var mortgageID = el.parentNode.parentNode.cells[0].innerHTML;
    var meta;
    var buttons = el.parentNode.parentNode.cells[3];
    //var todoNew = document.getElementById("todoNew");
    console.log("reject new");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.revokeNewMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      var log = "Rejected notification!";
      self.createAlert("signoffMortgage",log, 0);
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      console.log(returnVal);
      var msg = document.createElement('P');
      msg.className += " " + "alert-danger";
      msg.innerHTML="Rejected!"
      buttons.appendChild(msg);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      var log = "Error! Unauthorized user or technical problem!";
      self.createAlert("signoffMortgage",log, 1);
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      console.log(e);
	    console.log("ERROR Reject New Mortgage");
    });
  },

  pendingMortgageChangeRequest:function(){
    var self = this;
    var mortgageIds = [];
    var meta;
    console.log("todo");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      console.log(web3.eth.coinbase);
      return meta.getMortgageIds.call(web3.eth.coinbase);
    }).then(function(returnVal) {
      console.log(returnVal);
      var todonew = document.getElementById("todoNew");
      for(var i=0; i< returnVal.length; i++){
        //console.log('I: ' +i);
        self.getPendingMortgage(returnVal[i]);
    }
    }).catch(function(e) {
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },

  getPendingMortgage: function(id) {
    var mortgageId = id;
    console.log("pending update" + ' ' + id);
    var meta;
    var todoUpdate = document.getElementById("todoUpdate");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getPendingMortgageChangeMap.call(mortgageId);
    }).then(function(returnVal) {
      //call get mortgagePendingInfo.
      console.log(returnVal);
      if(returnVal[1]!='0x0000000000000000000000000000000000000000'){//mortgagee don't have new mortgage requests. Only Update.
        //'MortgageId: ' + mortgageId + ', Mortgagee: ' + returnVal[1] + ', Mortgagor: ' + returnVal[2];
        var tableRef = document.getElementById('updReqTable').getElementsByTagName('tbody')[0];
        tableRef.innerHTML = "";
			  var newRow   = tableRef.insertRow(tableRef.rows.length);
        //mortgageID
        var newCell  = newRow.insertCell(0);
			  var mortID  = document.createTextNode(returnVal[0]);
			  newCell.appendChild(mortID);
        //mortgagee
        var mortgageeCell  = newRow.insertCell(1);
			  var mortgageeVal = document.createTextNode(returnVal[1]);
			  mortgageeCell.appendChild(mortgageeVal);
        //mortgagor
        var mortgagorCell  = newRow.insertCell(2);
			  var mortgagorVal = document.createTextNode(returnVal[2]);
			  mortgagorCell.appendChild(mortgagorVal);
        //buttons
        var buttonsCell = newRow.insertCell(3);
        var btn = document.createElement('button');
        
        btn.className += " " +"btn";	
        btn.className += " " +"btn-success";	
        btn.innerText = "Accept";
        
        var space  = document.createTextNode(' ');
        buttonsCell.appendChild(space);
        
        btn.setAttribute("onclick","App.acceptUpdate(this)");
        var btn2 = document.createElement('button');
        
        btn2.className += " " +"btn";	
        btn2.className += " " +"btn-danger";
        btn2.innerText  = "Reject";
        btn2.setAttribute("onclick","App.rejectUpdate(this)");

        buttonsCell.appendChild(btn);
        buttonsCell.appendChild(space);
        buttonsCell.appendChild(btn2);

      }
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },
  acceptUpdate: function(el) {
    var self = this;
    var mortgageID = el.parentNode.parentNode.cells[0].innerHTML;
    //var mortgageID = document.getElementById("mortgageUpdate").value;
    var meta;
    var buttons = el.parentNode.parentNode.cells[3];
    console.log("accept update");
    console.log(mortgageID);
    //var todoNew = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      console.log(web3.eth.coinbase);
      return meta.proposedMortgageSignoff(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      console.log(returnVal);
      var log = "Success! Mortgage Created";
      self.createAlert("signoffMortgage",log, 0);
      var msg = document.createElement('P');
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      buttons.innerHTML="";
      msg.className += " " + "alert-success";
      msg.innerHTML="Submitted!"
      buttons.appendChild(msg);
    }).catch(function(e) {
      console.log(e);
      var log = "Error! Unauthorized User or invalid input";
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      self.createAlert("signoffMortgage",log, 1);
	    console.log("ERROR Accept New Mortgage");
    });
  },
  rejectUpdate: function(el) {
    var mortgageID = el.parentNode.parentNode.cells[0].innerHTML;
    var meta;
    var self = this;
    var buttons = el.parentNode.parentNode.cells[3];
    //var todoNew = document.getElementById("todoNew");
    console.log("reject new");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.revokeProposedMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      var log = "Rejected notification!";
      self.createAlert("signoffMortgage",log, 0);
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      console.log(returnVal);
      var msg = document.createElement('P');
      buttons.innerHTML="";
      msg.className += " " + "alert-success";
      msg.innerHTML="Submitted!"
      buttons.appendChild(msg);
      //add notification alert.
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      var log = "Error! Unauthorized user or technical problem!";
      document.getElementById("upMortgageLoader").style.visibility = "hidden";
      self.createAlert("signoffMortgage",log, 1);
      console.log(e);
	    console.log("ERROR Reject New Mortgage");
    });
  },
  todoMortgage:function(){
    var self = this;
    var mortgageIds = [];
    var meta;
    console.log("todo");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      console.log(web3.eth.coinbase);
      return meta.getMortgageIds.call(web3.eth.coinbase);
    }).then(function(returnVal) {
      console.log(returnVal);
      var todonew = document.getElementById("todoNew");
      for(var i=0; i< returnVal.length; i++){
        //console.log('I: ' +i);
        self.getMortgageToDo(returnVal[i]);
    }
    document.getElementById("todo").style.visibility = "visible";
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },

  getMortgageInfo: function() {//auto populate info in updateMortgage screen
    console.log("Called");
    var self = this;    
    var time =document.getElementById("starttime");
	  var mortgagee = document.getElementById("mortgagee");
	  var mortgagor = document.getElementById("mortgagor");
    var datestart = document.getElementById("datestart");
    var principal = document.getElementById("principal");
    var term = document.getElementById("term");
    var interestwhole = document.getElementById("interestwhole");
    var fraction = document.getElementById("interestfraction");
	  var mortgageId = parseInt(document.getElementById("mortgageId").value);
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getMortgageByMortgageID.call(mortgageId);
    }).then(function(returnVal) {
      
      var seconds = new BigNumber(returnVal[1]);
      console.log(seconds.toNumber());
      console.log(seconds.toString());
      var bigNSeconds = seconds;
      var dt = new Date(bigNSeconds.toNumber());
      
      console.log("returned seconds " + bigNSeconds.toNumber());
      console.log("returned seconds string " + bigNSeconds.toString());
      
      time.value = (dt.getMonth()+1) +"-"+dt.getDate()+ "-" + dt.getFullYear();
      mortgagee.value = returnVal[2];
      mortgagor.value = returnVal[3];
      var loanSeconds = new BigNumber(returnVal[4]);
      var loanDt = new Date(loanSeconds.toNumber());
      datestart.value = (loanDt.getMonth()+1) +"-"+loanDt.getDate()+"-"+loanDt.getFullYear();
      principal.value = returnVal[5];
      term.value = returnVal[6];
      interestwhole.value = returnVal[7];
      //fraction.value = returnVal[8];//sign off boolean
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },

  getMortgageToDo: function(id) {
    var self = this;
    console.log("Called");
    var mortgageID = id;
    //console.log(id);
    var meta;
    var todoNew = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getMortgageByMortgageID.call(mortgageID);
    }).then(function(returnVal) {
      console.log('MortgageToDo' + ' ' + returnVal);
      if(returnVal[8] && returnVal[2]!='0x0000000000000000000000000000000000000000'){//mortgagee don't have new mortgage requests. Only Update.
        var p = document.createElement('P');
        p.innerHTML = 'MortgageId: ' + mortgageID + ', Mortgagee: ' + returnVal[2] + ', Mortgagor: ' + returnVal[3];
        todoNew.appendChild(p);
        document.getElementById("mortgageIdToDo").value = mortgageID;
      }
      self.getPendingMortgage(mortgageID);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },
  getMortgageByID: function() {
    var self = this;
    console.log("Called");
    
    var meta;
    var searchId = parseInt(document.getElementById("searchID").value);
    console.log(searchId);
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getPreviousMortgageCoreInfo.call(searchId);
    }).then(function(returnVal) {
      console.log("Get Previous Info");
     // console.log(returnVal);
      var mortgageIDs = [];
      var mortgaees = [];
      var mortgagors = [];
      var dateArr = [];
      for(var i=0; i<returnVal.length; i++){
        for(var j=0; j<returnVal[i].length; j++){
          if(i==0){
            mortgageIDs[j] = returnVal[i][j];
            console.log(mortgageIDs[j]);
          }
          if(i==1){
            mortgaees[j] = returnVal[i][j];
            console.log(mortgaees[j]);
          }
          if(i==2){
            mortgagors[j] = returnVal[i][j];
            console.log(mortgagors[j]);
          }
          if(i==3){
            dateArr[j] = returnVal[i][j];
            console.log(dateArr[j]);
          }
        }
      }
      self.getMortgagePreviousFinInfo(searchId,mortgageIDs,mortgaees,mortgagors,dateArr);
    }).catch(function(e) {
      
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },
  getMortgagePreviousFinInfo: function(searchId,mortgageIDs,mortgaees,mortgagors,dateArr) {
    var self = this;
    console.log("Called");
    var ids = mortgageIDs;
    var mortgaeesArr = mortgaees;
    var mortgagorsArr = mortgagors;
    var dateArr = dateArr;
    var amountArr = [];
    var termArr = [];
    var interestArr = [];
    console.log(mortgaeesArr);
    var meta;
    var searchId = parseInt(document.getElementById("searchID").value);
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getPreviousMortgageFinInfo.call(searchId);
    }).then(function(returnVal) {
      console.log("Get Previous Info");
      console.log(returnVal);
      //mortgageId,amountArr,termArr,interestArr
      for(var i=0; i<returnVal.length; i++){
        for(var j=0; j<returnVal[i].length; j++){
          if(i==1){
            amountArr[j] = returnVal[i][j];
            console.log(amountArr[j]);
          }
          if(i==2){
            termArr[j] = returnVal[i][j];
            console.log(termArr[j]);
          }
          if(i==3){
            interestArr[j] = returnVal[i][j];
            console.log(interestArr[j]);
          }
        }
      }
      self.assembleHistoryTable(searchId,ids,mortgaeesArr,mortgagorsArr,dateArr,amountArr,termArr,interestArr);
    }).catch(function(e) {
      
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },
  assembleHistoryTable: function(searchId,ids,mortgaeesArr,mortgagorsArr,dateArr,amountArr,termArr,interestArr) {
    var self = this;
    console.log("Called");
    var meta;
    var searchId = parseInt(document.getElementById("searchID").value);
    console.log("Assembly");
    console.log(mortgaeesArr);
    var tableRef = document.getElementById('prevHistoryTable').getElementsByTagName('tbody')[0];
    tableRef.innerHTML = "";
    for (var i=0; i< ids.length; i++){
      var newRow = tableRef.insertRow(tableRef.rows.length);

      var idcell  = newRow.insertCell(0);
      var id = document.createTextNode(ids[i]);
      idcell.appendChild(id);
      var geeCell  = newRow.insertCell(1);
      var gee = document.createTextNode(mortgaeesArr[i]);
      geeCell.appendChild(gee);
      var gorCell  = newRow.insertCell(2);
      var gor = document.createTextNode(mortgagorsArr[i]);
      gorCell.appendChild(gor);
      var dateCell  = newRow.insertCell(3);
          
      

      var loanSeconds = new BigNumber(dateArr[i]);
      var loanDt = new Date(loanSeconds.toNumber());
      var formatted = (loanDt.getMonth()+1) +"-"+loanDt.getDate()+"-"+loanDt.getFullYear();
      var date = document.createTextNode(formatted);
      dateCell.appendChild(date);

      var amtCell  = newRow.insertCell(4);
      var amt = document.createTextNode(amountArr[i]);
      amtCell.appendChild(amt);
      var termCell  = newRow.insertCell(5);
      var term = document.createTextNode(termArr[i]);
      termCell.appendChild(term);
      var intCell  = newRow.insertCell(6);
      var int = document.createTextNode(interestArr[i]);
      intCell.appendChild(int);
    }
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getMortgageByMortgageID.call(searchId);
    }).then(function(returnVal) {
      
      var loanSeconds = new BigNumber(returnVal[4]);
      var loanDt = new Date(loanSeconds.toNumber());
      //(loanDt.getMonth()+1) +"-"+loanDt.getDate()+"-"+loanDt.getFullYear();
      var p = document.getElementById('currentText');
      p.innerHTML = "";
      p.innerHTML = '<strong>Current --</strong> ' + "<strong>Mortgagee:</strong> " + returnVal[2] + ", <strong>Mortgagor:</strong> " + returnVal[3];
      //fraction.value = returnVal[8];//sign off boolean
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  }
 /* getMortgageByID: function(id) {
    var self = this;
    console.log("Called");
    var mortgageID = id;
    //console.log(id);
    var meta;
    var searchId = parseInt(document.getElementById("searchID").value);
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getMortgageByMortgageID.call(searchId);
    }).then(function(returnVal) {
      //self.getPendingMortgage(mortgageID);
      var div = document.getElementById("searchMortgage");
      var milliseconds = returnVal[4];
      console.log(milliseconds);
      //var dt = new Date(milliseconds.getTime());
      //var dateValue = dt.getMonth()+"-"+dt.getDate()+"-"+dt.getFullYear();
      div.innerHTML = "Search Result! " + "ID: " + returnVal[0] + " Mortgagee: " + returnVal[2] + " Mortgagor: " + returnVal[3] + " Date: " + returnVal[4];
      console.log('Search' + ' ' + returnVal);
     // self.getPendingMortgage(mortgageID);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  }*/
  /*getPendingMortgage: function(id) {
    var mortgageId = id;
    console.log("pending update" + ' ' + id);
    var meta;
    var todoUpdate = document.getElementById("todoUpdate");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.getPendingMortgageChangeMap.call(mortgageId);
    }).then(function(returnVal) {
      //call get mortgagePendingInfo.
      console.log(returnVal);
      if(returnVal[1]!='0x0000000000000000000000000000000000000000'){//mortgagee don't have new mortgage requests. Only Update.
        var p = document.createElement('P');
        p.innerHTML = 'MortgageId: ' + mortgageId + ', Mortgagee: ' + returnVal[1] + ', Mortgagor: ' + returnVal[2];
        todoUpdate.appendChild(p);
        console.log("In pending: " + mortgageId);
        document.getElementById("mortgageUpdate").value = mortgageId;
      }
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Get Mortgage BY ID");
    });
  },*/
  
  
}; 
  

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
