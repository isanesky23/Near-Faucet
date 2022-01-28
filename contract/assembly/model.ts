import { env, PersistentVector, PersistentMap, u128 } from "near-sdk-as";
@nearBindgen
export class Claimer {
  id: i32;
  account: string;
  ipAddress: string;
  latestClaim: i64;
  amount: u128;
  isBanned: bool;

  constructor(_id: i32, _account: string, _ipAddress: string, _latestClaim: i64, _amount: u128, _isBanned: bool) {
    this.id = _id;
    this.account = _account;
    this.ipAddress = _ipAddress;
    this.latestClaim = _latestClaim;
    this.amount = _amount;
    this.isBanned = _isBanned;
  }

}// An array that stores products on the blockchain
export const claimers = new PersistentVector<Claimer>("clms");


