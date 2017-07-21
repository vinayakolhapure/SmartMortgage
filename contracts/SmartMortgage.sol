pragma solidity ^0.4.2;


contract AssetRetriever {
    function getAssetOwnerByAssetID(uint assetID) constant returns (address){
     }
}

contract SmartMortgage is AssetRetriever {
  
  AssetRetriever assetRegistry;

  
  function SmartMortgage(AssetRetriever _assetRegistry){
    assetRegistry = _assetRegistry;
    //assetRegistry = "0x36fe2725557cfdddaf8b977c0e97ebf670a9c063";
  }

//State Fields
  struct Mortgage {
     uint last_block_number;
     uint assetId;
     uint mortgageId;
     bool isActive;
     bool needSignOff;
     MortgageInfo currentInfo;
     MortgageInfo[] previousInfo;
  }
  
  struct MortgageInfo {
     uint insertInfoTime; //unix time of insert - we will always append to preserve history
     address mortgagee;  //bank - lender
     address mortgagor;  // borrower
     uint loanStartDate; //unix time - solidity doesnt have dates
     uint loanAmount;
     uint loanTermMonths;
     uint interestWholePart;
     uint interestFractionPart;
  }

struct PendingMortgageChange {
    MortgageInfo pendingInfo;
    bool current_mortgagee_signoff; //signoffs will vary based on type
    bool new_mortgagee_signoff;
    bool mortgagor_signoff; // this may not always be required - e.g. banks may sell to one another
}

  uint mortgageCounter = 0;
  mapping (uint => uint[]) assetToMortgageIdMap;  //1 asset may have multiple mortgaages over time  
  mapping (uint => Mortgage) mortgageIdToMortgageMap; 
  mapping (uint => PendingMortgageChange) mortgageIdToPendingMortgageChangeMap; 

//Events
event MortgageCreatedEvent(address indexed indexMortgagee, address indexed indexMortgagor,  uint indexed indexMortgageId, address mortgagee , address mortgagor, uint morgageId);
event ProposedUpdateEvent(address indexed indexMortgagee, address indexed indexMortgagor,  uint indexMortgageId, address mortgagee , address mortgagor);
event ProposedSignoffEvent(address signer, string signerType);
event ProposalFinalEvent(uint mortgageId);
event NewMortgageActivatedEvent(uint mortgageId);
event RevokeProposedMortgageEvent(uint mortgageId);
event RevokeNewMortgageEvent(uint mortgageId, bool isActive);
event AcceptNewMortgageEvent(uint mortgageId, bool isActive);

//Functions  
  function getRemoteAssetOwner(uint assetID) constant returns (address){
      return assetRegistry.getAssetOwnerByAssetID(assetID);
  }

  function getMortgageByMortgageID (uint mortgageID) constant returns (uint,uint,address,address,uint,uint,uint,uint,bool) {
      var mortgage = mortgageIdToMortgageMap[mortgageID].currentInfo;
      //removed fraction part to avoid stacktoodeep exception.
      bool needSignoff = mortgageIdToMortgageMap[mortgageID].needSignOff;
      return (mortgageID, mortgage.insertInfoTime, mortgage.mortgagee,mortgage.mortgagor,mortgage.loanStartDate,mortgage.loanAmount,mortgage.loanTermMonths,mortgage.interestWholePart,needSignoff);
  }
  
  function revokeProposedMortgage(uint _mortgageId)
 {
    var pendingMap = mortgageIdToPendingMortgageChangeMap[_mortgageId];
    var currentMap = mortgageIdToMortgageMap[_mortgageId];
    
     if (msg.sender !=   pendingMap.pendingInfo.mortgagee &&
         msg.sender !=  currentMap.currentInfo.mortgagee)
        throw; 
        
       pendingMap.pendingInfo.mortgagee = 0x0;
       pendingMap.pendingInfo.mortgagor = 0x0;
       pendingMap.pendingInfo.insertInfoTime = 0;
       pendingMap.current_mortgagee_signoff = false;
       pendingMap.new_mortgagee_signoff = false;
       pendingMap.mortgagor_signoff = false; 
       
       RevokeProposedMortgageEvent(_mortgageId);
 } 

  function revokeNewMortgage(uint _mortgageId)
 {
    var currentMap = mortgageIdToMortgageMap[_mortgageId];
    
     if (msg.sender !=  currentMap.currentInfo.mortgagor)
        throw; 

       currentMap.mortgageId = 0;
       currentMap.currentInfo.mortgagee = 0x0;
       currentMap.currentInfo.mortgagor = 0x0;
       currentMap.needSignOff=false;
       currentMap.isActive=false;
       
       RevokeNewMortgageEvent(_mortgageId,currentMap.isActive);
 } 

 function acceptNewMortgage(uint _mortgageId)
 {
    var currentMap = mortgageIdToMortgageMap[_mortgageId];
    
     if (msg.sender !=  currentMap.currentInfo.mortgagor)
        throw; 
     
     currentMap.needSignOff=false;
     currentMap.isActive=true;
       
     AcceptNewMortgageEvent(_mortgageId,currentMap.isActive);
 } 
  
  
  function proposedMortgageSignoff(uint _mortgageId) {
    address currentSender ;
    currentSender = msg.sender;
    var pendingMap = mortgageIdToPendingMortgageChangeMap[_mortgageId];
    var currentMap = mortgageIdToMortgageMap[_mortgageId];
    
    if (currentSender !=   pendingMap.pendingInfo.mortgagee &&
         currentSender !=  currentMap.currentInfo.mortgagee)
        throw;
  
      //both mortgagees old and new have to signoff
    if (currentSender == pendingMap.pendingInfo.mortgagee ){
          pendingMap.new_mortgagee_signoff = true;
          ProposedSignoffEvent(currentSender, "New Mortgagee");
    }
    if (currentSender == currentMap.currentInfo.mortgagee ){
          pendingMap.current_mortgagee_signoff = true;
          ProposedSignoffEvent(currentSender, "Current Mortgagee");
    }
          
    // if both signed off insert the mortgage      
    if (pendingMap.new_mortgagee_signoff == true &&
         pendingMap.current_mortgagee_signoff == true){
     currentMap.previousInfo.push(currentMap.currentInfo) ;
     currentMap.currentInfo = pendingMap.pendingInfo;
       // delete has a bug in testrpc so we will just reset main fields
       pendingMap.pendingInfo.mortgagee = 0x0;
       pendingMap.pendingInfo.mortgagor = 0x0;
       pendingMap.pendingInfo.insertInfoTime = 0;
       pendingMap.current_mortgagee_signoff = false;
       pendingMap.new_mortgagee_signoff = false;
       pendingMap.mortgagor_signoff = false;


       ProposalFinalEvent(_mortgageId);
   }                              
 }

  function proposedMortgageUpdate(uint _mortgageId,
                      uint _insertInfoTime,
                      address _mortgagee,
                      address _mortgagor,
                      uint _loanStartDate,
                      uint _loanAmount,
                      uint _loanTermMonths,
                      uint _interestWholePart,
                      uint _interestFractionPart
                          ){
      //Only 1 pending mortgage can exist for each mortgage
      var mortgageObject = mortgageIdToMortgageMap[_mortgageId];
      if(mortgageObject.currentInfo.mortgagee != msg.sender) //Only the current mortgagee can initiate this process.
        throw;
      
      var m = MortgageInfo(_insertInfoTime,_mortgagee,_mortgagor,_loanStartDate,_loanAmount,_loanTermMonths,_interestWholePart,_interestFractionPart);
      var pending = PendingMortgageChange(m, false, false, false);
      mortgageIdToPendingMortgageChangeMap[_mortgageId] = pending;
      ProposedUpdateEvent(_mortgagee,_mortgagor, _mortgageId, _mortgagee,_mortgagor);
    }
  
  
  
  function isMortgagee(uint _mortgageId , address _address) constant returns(bool)
  {
    if (_address == mortgageIdToMortgageMap[_mortgageId].currentInfo.mortgagee) 
       return true;
    else
       return false;   
  }     

function isMortgagor(uint _mortgageId , address _address) constant returns(bool)
  {
    if (_address == mortgageIdToMortgageMap[_mortgageId].currentInfo.mortgagor) 
       return true;
    else
       return false;   
  }     

function getMortgageIds(address _address) constant returns(uint[])
{
   uint[] memory localMortgageIds = new uint[](100);
   var counter = 0;
   for (uint i = 0 ; i < mortgageCounter; i++) {
     var m =  mortgageIdToMortgageMap[i+1];  
     if (m.currentInfo.mortgagor  == _address  ||  m.currentInfo.mortgagee == _address){
         localMortgageIds[i]=m.mortgageId;
         counter++;
     }
   }
   uint[] memory returnedMortgageIds = new uint[](counter);
   for (uint j = 0 ; j < counter; j++) {
       returnedMortgageIds[j] = localMortgageIds[j];
   }
   return returnedMortgageIds;
}
 
  function mortgagorApproveNewMortgage(uint _mortgageId){
     if (msg.sender != mortgageIdToMortgageMap[_mortgageId].currentInfo.mortgagor)
         throw;
    else {
       mortgageIdToMortgageMap[_mortgageId].isActive = true;
       NewMortgageActivatedEvent(_mortgageId);
    }
  }
 
 
  function createNewMortgage(uint _assetId,
                      uint _insertInfoTime,
                      address _mortgagee,
                      address _mortgagor,
                      uint _loanStartDate,
                      uint _loanAmount,
                      uint _loanTermMonths,
                      uint _interestWholePart,
                      uint _interestFractionPart
                      )
{
  //todo  need to call asset contract remotely to ensure only asset owner and others (tbd) can do this
  //todo also validate that assetId is valid
    var currentOwner = getRemoteAssetOwner(_assetId);
    
    if((msg.sender != _mortgagee || currentOwner != _mortgagor) || (_mortgagor == _mortgagee))
        throw;

    
    mortgageCounter++;
    Mortgage storage m = mortgageIdToMortgageMap[mortgageCounter];
    m.assetId = _assetId;
    m.mortgageId = mortgageCounter;
    m.isActive = false;
    m.needSignOff = true;
    m.last_block_number = block.number;
    
    m.currentInfo.insertInfoTime = _insertInfoTime;
    m.currentInfo.mortgagee = _mortgagee;
    m.currentInfo.mortgagor = _mortgagor;
    m.currentInfo.loanStartDate = _loanStartDate;
    m.currentInfo.loanAmount = _loanAmount;
    m.currentInfo.loanTermMonths = _loanTermMonths;
    m.currentInfo.interestWholePart = _interestWholePart;
    m.currentInfo.interestFractionPart = _interestFractionPart;
    
    mortgageIdToMortgageMap[mortgageCounter] = m;
    MortgageCreatedEvent(_mortgagee, _mortgagor, mortgageCounter,_mortgagee, _mortgagor,mortgageCounter);  //raise event
  }  
}