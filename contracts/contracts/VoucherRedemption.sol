// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoucherRedemption {
    struct Voucher {
        uint256 amount;
        address creator;
        bool redeemed;
    }

    mapping(bytes32 => Voucher) public vouchers;
    
    event VoucherCreated(bytes32 voucherId, uint256 amount, address creator);
    event VoucherRedeemed(bytes32 voucherId, uint256 amount, address redeemer);

    error VoucherAlreadyExists();
    error VoucherNotFound();
    error VoucherAlreadyRedeemed();
    error InsufficientFunds();

    function createVoucher(bytes32 voucherId) external payable {
        if (vouchers[voucherId].creator != address(0)) {
            revert VoucherAlreadyExists();
        }
        
        if (msg.value == 0) {
            revert InsufficientFunds();
        }

        vouchers[voucherId] = Voucher({
            amount: msg.value,
            creator: msg.sender,
            redeemed: false
        });

        emit VoucherCreated(voucherId, msg.value, msg.sender);
    }

    function redeemVoucher(bytes32 voucherId) external {
        Voucher storage voucher = vouchers[voucherId];
        
        if (voucher.creator == address(0)) {
            revert VoucherNotFound();
        }
        
        if (voucher.redeemed) {
            revert VoucherAlreadyRedeemed();
        }

        voucher.redeemed = true;
        
        (bool success, ) = payable(msg.sender).call{value: voucher.amount}("");
        require(success, "Transfer failed");

        emit VoucherRedeemed(voucherId, voucher.amount, msg.sender);
    }

    function getVoucherAmount(bytes32 voucherId) external view returns (uint256) {
        Voucher memory voucher = vouchers[voucherId];
        if (voucher.creator == address(0)) {
            revert VoucherNotFound();
        }
        return voucher.amount;
    }

    function getVoucherStatus(bytes32 voucherId) external view returns (bool exists, bool redeemed, address creator, uint256 amount) {
        Voucher memory voucher = vouchers[voucherId];
        return (voucher.creator != address(0), voucher.redeemed, voucher.creator, voucher.amount);
    }
}
