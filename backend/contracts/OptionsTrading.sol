// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OptionsTrading {
    struct Option {
        address trader;
        string optionType;    // "call" or "put"
        string action;        // "buy" or "sell"
        uint256 lots;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiry;
        bool isActive;
    }

    mapping(uint256 => Option) public options;
    uint256 public nextOptionId;

    event OptionCreated(
        uint256 indexed optionId,
        address indexed trader,
        string optionType,
        string action,
        uint256 lots,
        uint256 strikePrice,
        uint256 premium,
        uint256 expiry
    );

    function createOption(
        string memory _optionType,
        string memory _action,
        uint256 _lots,
        uint256 _strikePrice,
        uint256 _premium,
        uint256 _expiry
    ) external payable returns (uint256) {
        require(_lots > 0, "Lots must be greater than 0");
        require(_strikePrice > 0, "Strike price must be greater than 0");
        require(_premium > 0, "Premium must be greater than 0");
        require(_expiry > block.timestamp, "Expiry must be in the future");

        uint256 optionId = nextOptionId++;
        
        options[optionId] = Option({
            trader: msg.sender,
            optionType: _optionType,
            action: _action,
            lots: _lots,
            strikePrice: _strikePrice,
            premium: _premium,
            expiry: _expiry,
            isActive: true
        });

        emit OptionCreated(
            optionId,
            msg.sender,
            _optionType,
            _action,
            _lots,
            _strikePrice,
            _premium,
            _expiry
        );

        return optionId;
    }
} 