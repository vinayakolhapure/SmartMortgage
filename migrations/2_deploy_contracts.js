var AssetRegistry = artifacts.require("./AssetRegistry.sol");
var SmartMortgage = artifacts.require("./SmartMortgage.sol");
module.exports = function(deployer) {
  //deployer.deploy(AssetRegistry);
  //deployer.deploy(SmartMortgage);

   
  deployer.deploy(AssetRegistry).then(function() {
  return deployer.deploy(SmartMortgage, AssetRegistry.address);
  });
   
  
};
