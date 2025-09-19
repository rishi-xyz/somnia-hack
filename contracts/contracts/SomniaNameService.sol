// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SomniaNameService {
    struct NameRecord {
        address owner;
        uint256 registeredAt;
    }

    mapping(string => NameRecord) public names;
    mapping(address => string[]) public ownerNames;
    
    event NameRegistered(string name, address owner);
    event NameTransferred(string name, address from, address to);

    error NameAlreadyExists();
    error NameNotFound();
    error NotOwner();
    error InvalidName();

    modifier onlyOwner(string memory name) {
        if (names[name].owner != msg.sender) {
            revert NotOwner();
        }
        _;
    }

    function registerName(string calldata name) external {
        if (names[name].owner != address(0)) {
            revert NameAlreadyExists();
        }
        
        if (!_isValidName(name)) {
            revert InvalidName();
        }

        names[name] = NameRecord({
            owner: msg.sender,
            registeredAt: block.timestamp
        });

        ownerNames[msg.sender].push(name);

        emit NameRegistered(name, msg.sender);
    }

    function resolveName(string calldata name) external view returns (address) {
        if (names[name].owner == address(0)) {
            revert NameNotFound();
        }
        return names[name].owner;
    }

    function transferName(string calldata name, address newOwner) external onlyOwner(name) {
        if (newOwner == address(0)) {
            revert InvalidName();
        }

        address oldOwner = names[name].owner;
        names[name].owner = newOwner;

        // Remove from old owner's list
        _removeFromOwnerList(oldOwner, name);
        
        // Add to new owner's list
        ownerNames[newOwner].push(name);

        emit NameTransferred(name, oldOwner, newOwner);
    }

    function getOwnerNames(address owner) external view returns (string[] memory) {
        return ownerNames[owner];
    }

    function getNameInfo(string calldata name) external view returns (address owner, uint256 registeredAt, bool exists) {
        NameRecord memory record = names[name];
        return (record.owner, record.registeredAt, record.owner != address(0));
    }

    function _isValidName(string memory name) internal pure returns (bool) {
        bytes memory nameBytes = bytes(name);
        
        // Check length (1-63 characters)
        if (nameBytes.length == 0 || nameBytes.length > 63) {
            return false;
        }
        
        // Check if it ends with .somnia
        if (nameBytes.length < 8) {
            return false;
        }
        
        string memory suffix = ".somnia";
        bytes memory suffixBytes = bytes(suffix);
        
        for (uint256 i = 0; i < suffixBytes.length; i++) {
            if (nameBytes[nameBytes.length - suffixBytes.length + i] != suffixBytes[i]) {
                return false;
            }
        }
        
        // Check if the part before .somnia is valid (alphanumeric and hyphens)
        for (uint256 i = 0; i < nameBytes.length - 7; i++) {
            bytes1 char = nameBytes[i];
            if (!((char >= 0x30 && char <= 0x39) || // 0-9
                  (char >= 0x41 && char <= 0x5A) || // A-Z
                  (char >= 0x61 && char <= 0x7A) || // a-z
                  char == 0x2D)) { // hyphen
                return false;
            }
        }
        
        return true;
    }

    function _removeFromOwnerList(address owner, string memory name) internal {
        string[] storage namesList = ownerNames[owner];
        for (uint256 i = 0; i < namesList.length; i++) {
            if (keccak256(bytes(namesList[i])) == keccak256(bytes(name))) {
                namesList[i] = namesList[namesList.length - 1];
                namesList.pop();
                break;
            }
        }
    }
}
