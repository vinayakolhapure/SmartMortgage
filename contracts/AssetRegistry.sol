pragma solidity ^0.4.2;

contract AssetRegistry {
    uint private counter = 0;
  
  function AssetRegistry(){
      m_owners[1] = uint(msg.sender);
      m_ownerIndex[uint(msg.sender)] = 1;
      m_numOwners =1;
  }
  
  
  struct Asset {
    uint assetId;
    uint block;
    uint borough;
    uint lot;
    address currentOwner;
  }
  
  event OwnerAddedEvent(address newOwner);
  event AssetCreatedEvent(uint indexed indexAssetId, uint assetId, uint block,uint borough,uint lot, address currentOwner);
  event UpdateAssetEvent(uint indexed indexAssetId,uint assetId, address currentOwner);
  
      // list of owners
    uint[256] m_owners;
    // index on the list of owners to allow reverse lookup
     mapping(uint => uint) m_ownerIndex;
     uint public m_numOwners;
    

  mapping (uint => Asset) assetMap;
  
    modifier onlyowner {
        require(isOwner(msg.sender));
        _;
    }
  
     function addOwner(address _owner)  {
        if (isOwner(_owner)) return;

        m_numOwners++;
        m_owners[m_numOwners] = uint(_owner);
        m_ownerIndex[uint(_owner)] = m_numOwners;
        OwnerAddedEvent(_owner);
    }
  
  function isOwner(address _addr) returns (bool) {
        return m_ownerIndex[uint(_addr)] > 0;
    }

  function createAsset(uint block, uint borough, uint lot, address currentOwner) onlyowner {
    counter++;
    assetMap[counter] = Asset(counter,block,borough,lot,currentOwner);
    AssetCreatedEvent(counter, counter,block,borough,lot,currentOwner);
  }
  
  function getAssetIDByBBL(uint _block, uint _borough, uint _lot) constant returns(uint) {
      for (uint index = 1 ; index <= counter ; index++ ){
          var curAsset = assetMap[index];
          if (curAsset.block == _block  && curAsset.borough == _borough && curAsset.lot == _lot)
              return curAsset.assetId;
      }      
  }
  
  function updateAssetInfo(address newOwner, uint assetId) onlyowner {
      var asset = assetMap[assetId];
      asset.currentOwner = newOwner;
      UpdateAssetEvent(assetId, assetId, asset.currentOwner);
  }
  
  function getAssetByAssetID (uint assetID) constant returns (uint,uint,uint,uint,address) {
      return (assetID, assetMap[assetID].block,assetMap[assetID].borough,assetMap[assetID].lot,assetMap[assetID].currentOwner);
  }

  function getAssetOwnerByAssetID(uint assetID) constant returns (address){
      return (assetMap[assetID].currentOwner);
  }
  
}
