import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FleatoNFT,
  ApprovalForAll,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TransferBatch,
  TransferSingle,
  URI,
  Unpaused
} from "../generated/FleatoNFT/FleatoNFT"
import { NFTOwnership, NFTApproval, User, NFTToken } from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let owner = new User(event.params.account.toHexString())
  owner.save();

  let operator = new User(event.params.operator.toHexString())
  operator.save();

  let approval = NFTApproval.load(event.params.account.toHexString());
  if(!approval) {
    approval = new NFTApproval(event.params.account.toHexString())
  }
  if(event.params.approved) {
    if(!approval.operators && event.params.operator)
      approval.operators = [event.params.operator.toHexString()];
    else if(approval.operators && event.params.operator)
      //TODO: Append to array doesnt work
      approval.operators = [event.params.operator.toHexString()];
  } else  {
    // if(approval.operators)
    //   approval.operators = approval.operators.filter(a => a !== event.params.operator.toHexString())
  }
  approval.save();

  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.MINTER_ROLE(...)
  // - contract.PAUSER_ROLE(...)
  // - contract.ROYALTY_ADMIN_ROLE(...)
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.exists(...)
  // - contract.getRoleAdmin(...)
  // - contract.getRoleMember(...)
  // - contract.getRoleMemberCount(...)
  // - contract.hasRole(...)
  // - contract.isApprovedForAll(...)
  // - contract.nextId(...)
  // - contract.paused(...)
  // - contract.royaltyInfo(...)
  // - contract.supportsInterface(...)
  // - contract.totalSupply(...)
  // - contract.uri(...)
}

export function handlePaused(event: Paused): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

function handleTransfer(from: Address, to: Address, id: BigInt, value: BigInt, timestamp: BigInt): void {
  let user = new User(to.toHexString())
  user.save();

  let receiverOwnership = NFTOwnership.load(id.toHexString() + "-" + to.toHexString())
  
  if(!receiverOwnership) {
    receiverOwnership = new NFTOwnership(id.toHexString() + "-" + to.toHexString())
    receiverOwnership.token = id.toHexString()
    receiverOwnership.owner = to.toHexString()
  }

  
  if(from.toHexString() == Address.zero().toHexString()) {
    let token = new NFTToken(id.toHexString())
    token.supply = value
    token.minted = timestamp
    token.creator = to.toHexString()
    token.save()
    receiverOwnership.creator = to.toHexString()
    receiverOwnership.units = value
  } else {
    let senderOwnership = NFTOwnership.load(id.toHexString() + "-" + from.toHexString())
    senderOwnership!.units = senderOwnership!.units.minus(value)
    receiverOwnership.units = receiverOwnership.units.plus(value)
    senderOwnership!.save();
  }

  receiverOwnership.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  for(let i=0;i<event.params.ids.length;i++) {
    handleTransfer(event.params.from, event.params.to, event.params.ids[i], event.params.values[i], event.block.timestamp);
  }
}



export function handleTransferSingle(event: TransferSingle): void {
  handleTransfer(event.params.from, event.params.to, event.params.id, event.params.value, event.block.timestamp);
}

export function handleURI(event: URI): void {}

export function handleUnpaused(event: Unpaused): void {}
