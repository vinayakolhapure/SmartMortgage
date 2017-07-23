var AssetRegistry = artifacts.require("./AssetRegistry.sol");
var SmartMortgage = artifacts.require("./SmartMortgage.sol");

contract('AssetRegistry', function(accounts) {
  
  
  it("Create a New Asset and retrieve it", function() {
    var assetmeta;
    return AssetRegistry.deployed().then(function(instance) {
      assetmeta = instance;
      return assetmeta.createAsset(1, 1, 1, accounts[0], {from: accounts[0]});
    }).then(function() {
      return assetmeta.getAssetByAssetID.call(1);    
    }).then(function(returnVal) {
      assert.equal(returnVal[0].valueOf(), 1, "Asset Id was not given id of 1");
    });
  });

  it("Test update of Asset owner for AssetID of 1", function() {
    var assetmeta;
    return AssetRegistry.deployed().then(function(instance) {
      assetmeta = instance;
      //update asset owner to second account 
      return assetmeta.updateAssetInfo(accounts[1],1,{from: accounts[0]});
    }).then(function() {
      return assetmeta.getAssetByAssetID.call(1);    
    }).then(function(returnVal) {
      assert.equal(returnVal[4].valueOf(), accounts[1], "Owner was not changed");
    });
  });


  it("Create a New Mortgage and accept it", function() {
    var mortgagemeta;
    var assetmeta;
    return AssetRegistry.deployed().then(function(instance) {
      assetmeta = instance;
    return SmartMortgage.new(assetmeta.address, {from: accounts[0]})
    }).then(function(instance){
      mortgagemeta = instance;
      return mortgagemeta.createNewMortgage(1, 1, accounts[0], accounts[1], 1, 1 ,3 , 2,5, {from: accounts[0]});
    }).then(function() {
       return mortgagemeta.acceptNewMortgage(1, {from: accounts[1]});    
    }).then(function() {
       return mortgagemeta.getMortgageByMortgageID.call(1);
   }).then(function(returnVal) {
      assert.equal(returnVal[8].toString(), "false", "Mortgage Not signed off");   
   });
 });

});