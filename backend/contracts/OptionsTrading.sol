// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OptionsTrading {
    struct Option {
        address trader;
        string optionType;
        string action;
        uint256 lots;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiry;
        bool isActive;
    }

    mapping(uint256 => Option) public options;
    uint256 public nextOptionId;
    mapping(address => uint256) public balances;

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

    event PremiumPaid(
        uint256 indexed optionId,
        address indexed buyer,
        uint256 amount
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

        // If buying, require premium payment
        if (keccak256(bytes(_action)) == keccak256(bytes("buy"))) {
            uint256 totalPremium = _premium * _lots;
            require(msg.value == totalPremium, "Incorrect premium amount");
            balances[address(this)] += totalPremium;
        }

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

        if (msg.value > 0) {
            emit PremiumPaid(optionId, msg.sender, msg.value);
        }

        return optionId;
    }

    function getOrdersByTrader(address trader) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextOptionId; i++) {
            if (options[i].trader == trader) {
                count++;
            }
        }

        uint256[] memory traderOrders = new uint256[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < nextOptionId; i++) {
            if (options[i].trader == trader) {
                traderOrders[currentIndex] = i;
                currentIndex++;
            }
        }

        return traderOrders;
    }

    function getOrdersDetails(uint256[] calldata orderIds) external view returns (Option[] memory) {
        Option[] memory ordersList = new Option[](orderIds.length);
        for (uint256 i = 0; i < orderIds.length; i++) {
            ordersList[i] = options[orderIds[i]];
        }
        return ordersList;
    }

    function getContractBalance() external view returns (uint256) {
        return balances[address(this)];
    }
} 