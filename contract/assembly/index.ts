/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/develop/contracts/as/intro
 *
 */

import { Context, logging, storage, ContractPromiseBatch, u128, datetime} from 'near-sdk-as'

import { Claimer, claimers} from './model';

export function getClaimers(): Claimer[] {
  let results = new Array<Claimer>();

  for(let i = 0; i < claimers.length; i ++) {
      results.push(claimers[i]);
  }
  return results;
}

export function getClaimerByIP(_ip: string) : Claimer {
  let claimmerId: i32 = 0;
  for(let i = 0; i < claimers.length; i ++) {
    let ip = claimers[i].ipAddress;

    if(ip == _ip) {
      claimmerId = i;
    }
  }

  return claimers[claimmerId];
}

export function isUserExisted(_ip: string): bool {
  for(let i = 0; i < claimers.length; i ++) {
    let ip = claimers[i].ipAddress;

    if(ip == _ip) {
      return true;
    }
  }
  return false;
}

export function isClaimable(ipAddress: string):bool {
  for(let i = 0; i < claimers.length; i ++) {
    let ip = claimers[i].ipAddress;
    let latestClaim = claimers[i].latestClaim;
    let isBanned = claimers[i].isBanned;
    let currentTimestamp = Context.blockTimestamp;

    if(ip == ipAddress && !isBanned) {
        if((currentTimestamp - latestClaim) < 86400000000) {
          return false;
        }
    }
  }
  return true;
}

export function getBlockDateTime(): string {
  let time = datetime.block_datetime();

  return time.toString();
}

export function addNewClaimer(ipAddress: string, amount: u128, isBanned: bool): bool {
  let account = Context.sender;
  let latestClaim = Context.blockTimestamp;
  let id = claimers.length + 1;

  let claimer = new Claimer(id, account, ipAddress, latestClaim, amount, isBanned);
  let index = claimers.push(claimer);
  if(index) {
    return true;
  }
  return false;
}

export function _doClaim(_account: string, _amount: u128) : void {
    ContractPromiseBatch.create(_account).transfer(_amount);
}

export function claimToken(_ip: string, _account: string, _amount: u128): bool {
  let _isUserExisted = isUserExisted(_ip);
  if(_isUserExisted) {
    if(isClaimable(_ip)) {
      _doClaim(_account, _amount);
      updateClaimer(_ip, _amount);
    }
  }
  else {
    //let claimer: Claimer = getClaimerByIP(_ip);
    addNewClaimer(_ip, _amount, false);
    if(isClaimable(_ip)) {
      _doClaim(_account, _amount);
  
      updateClaimer(_ip, _amount);
      return true;
    }
    else {
      return false;
    }
  }
  return false;
}

export function updateClaimer(_ip: string, _amount: u128): bool {
  for(let i = 0; i < claimers.length; i ++) {
    let ip = claimers[i].ipAddress;

    if(ip == _ip) {
      let id = claimers[i].id;
      let account = claimers[i].account;
      //let ipAddress = claimers[i].ipAddress;
      let latestClaim = Context.blockTimestamp;
      let isBanned = claimers[i].isBanned;

      let updatedClaimer = new Claimer(id, account, ip, latestClaim, _amount, isBanned);
      claimers.replace(i, updatedClaimer);
      return true;
    }
  }
  return false;
}