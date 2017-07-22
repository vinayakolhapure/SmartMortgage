import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

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
      var result = document.getElementById("updateResult");
      result.innerHTML = 'Event: ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Current Owner: ' + assetLog.currentOwner;
    }).catch(function(e) {
	  var result = document.getElementById("updateResult");
	  result.innerHTML = 'Update Error! User unauthorized, or invalid input';
      console.log(e);
    });
  },

  createAsset: function() {
    console.log("Called");
    var self = this;
    var block = parseInt(document.getElementById("block").value);
	  var borough = parseInt(document.getElementById("borough").value);
	  var lot = parseInt(document.getElementById("lot").value);
	
    var meta;
    AssetRegistry.deployed().then(function(instance) {
      meta = instance;
      return meta.createAsset(block, borough, lot, web3.eth.coinbase, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      var feedback = document.getElementById("createFeedback");
	  var assetLog = returnVal.logs[0].args;
    feedback.innerHTML = 'Event: ' + returnVal.logs[0].event + ', Asset ID: ' + assetLog.assetId + ', Block: ' + assetLog.block + ', Borough: ' + assetLog.borough + ', Lot: ' + assetLog.lot + ', Current Owner: ' + assetLog.currentOwner;
	  console.log(returnVal.logs[0].args.assetId);
      console.log("AFTER RETURNVAL");
	  console.log(returnVal);	  
	    //console.log(returnVal.logs);
    }).catch(function(e) {
      var feedback = document.getElementById("createFeedback");
      feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
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
    var self = this;
    var assetid = parseInt(document.getElementById("assetid").value);
    var time = parseInt(document.getElementById("starttime").value);
	  var mortgagee = document.getElementById("mortgagee").value;
	  var mortgagor = document.getElementById("mortgagor").value;
    var datestart = parseInt(document.getElementById("datestart").value);
    var principal = parseInt(document.getElementById("principal").value);
    var term = parseInt(document.getElementById("term").value);
    var interestwhole = parseInt(document.getElementById("interestwhole").value);
    var fraction = parseInt(document.getElementById("interestfraction").value);
	
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.createNewMortgage(assetid,time, mortgagee, mortgagor,datestart,principal,term,interestwhole,fraction, web3.eth.coinbase, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
    var feedback = document.getElementById("createFeedback");
	  var mortgageLog = returnVal.logs[0].args;
    feedback.innerHTML = 'Mortgage creating pending approval from client \n' + 'Event: ' + returnVal.logs[0].event + ' Mortgage ID: ' + mortgageLog.morgageId +  ', Mortgagee: ' + mortgageLog.indexMortgagee + ', Mortgagor: ' + mortgageLog.indexMortgagor;
    console.log("AFTER RETURNVAL"); 
	  console.log(returnVal);	  
    }).catch(function(e) {
      var feedback = document.getElementById("createFeedback");
      feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR CREATING Mortgage");
    });
  },
  updateMortgage: function() {
    console.log("Called");
    var self = this;
    var mortgageId = parseInt(document.getElementById("mortgageId").value);
    var time = parseInt(document.getElementById("starttime").value);
	  var mortgagee = document.getElementById("mortgagee").value;
	  var mortgagor = document.getElementById("mortgagor").value;
    var datestart = parseInt(document.getElementById("datestart").value);
    var principal = parseInt(document.getElementById("principal").value);
    var term = parseInt(document.getElementById("term").value);
    var interestwhole = parseInt(document.getElementById("interestwhole").value);
    var fraction = parseInt(document.getElementById("interestfraction").value);
	
    var meta;
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.proposedMortgageUpdate(mortgageId,time, mortgagee, mortgagor,datestart,principal,term,interestwhole,fraction, web3.eth.coinbase, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
    var feedback = document.getElementById("createFeedback");
	  var mortgageLog = returnVal.logs[0].args;
    feedback.innerHTML = 'Event: ' + returnVal.logs[0].event + ' Mortgage ID: ' + mortgageLog.indexMortgageId +  ', Mortgagee: ' + mortgageLog.indexMortgagee + ', Mortgagor: ' + mortgageLog.indexMortgagor;
    console.log("AFTER RETURNVAL");
	  console.log(returnVal);	  
    }).catch(function(e) {
      var feedback = document.getElementById("createFeedback");
      feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR CREATING Mortgage");
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

  getMortgageInfo: function() {
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
      console.log(returnVal);
      time.value = returnVal[1];
      mortgagee.value = returnVal[2];
      mortgagor.value = returnVal[3];
      datestart.value = returnVal[4];
      principal.value = returnVal[5];
      term.value = returnVal[6];
      interestwhole.value = returnVal[7];
      fraction.value = returnVal[8];
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
  getMortgageByID: function(id) {
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
      console.log('Search' + ' ' + returnVal);
     // self.getPendingMortgage(mortgageID);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
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
  },
  acceptUpdate: function(id) {
    var mortgageID = document.getElementById("mortgageUpdate").value;
    var meta;
    console.log("accept new");
    console.log(mortgageID);
    //var todoNew = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      console.log(web3.eth.coinbase);
      return meta.proposedMortgageSignoff(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      console.log(returnVal);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Accept New Mortgage");
    });
  },
  rejectUpdate: function(id) {
    var mortgageID = document.getElementById("mortgageUpdate").value;
    var meta;
    //var todoNew = document.getElementById("todoNew");
    console.log("reject new");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.revokeProposedMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      console.log(returnVal);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Reject New Mortgage");
    });
  },
  acceptNew: function(id) {
    var mortgageID = document.getElementById("mortgageIdToDo").value;
    var meta;
    console.log("accept new");
    //var todoNew = document.getElementById("todoNew");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.acceptNewMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      console.log(returnVal);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Accept New Mortgage");
    });
  },
  rejectNew: function(id) {
    var mortgageID = document.getElementById("mortgageIdToDo").value;
    var meta;
    //var todoNew = document.getElementById("todoNew");
    console.log("reject new");
    SmartMortgage.deployed().then(function(instance) {
      meta = instance;
      return meta.revokeNewMortgage(mortgageID, {from: web3.eth.coinbase});
    }).then(function(returnVal) {
      console.log(returnVal);
    }).catch(function(e) {
      //var feedback = document.getElementById("createFeedback");
      //feedback.innerHTML = 'Error creating asset! User unauthorized, or invalid input'
      console.log(e);
	    console.log("ERROR Reject New Mortgage");
    });
  }
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
