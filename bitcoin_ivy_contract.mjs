import {
  compile,
  fulfill,
  instantiate,
  spend,
  toSighash,
  createSignature,
  crypto
} from "ivy-bitcoin"

const source = `contract LockWithPublicKey(publicKey: PublicKey, val: Value) {
  clause spend(sig: Signature) {
    verify checkSig(publicKey, sig)
    unlock val
  }
}`

const privateKey = "Kyw8s2qf2TxNnJMwfrKYhAsZ6eAmMMhAv4Ej4VVE8KpVsDvXurJK"
const publicKey = crypto.fromSecret(privateKey).getPublicKey("hex")
const destinationAddress = ""
const amount = 0
const locktime = 0
const sequenceNumber = { sequence: 0, seconds: false }

// compile the template
const template = compile(source)

// instantiate it
const instantiated = instantiate(template, [publicKey, amount])

// get the testnet and mainnet addresses corresponding to the contract
// note: any BTC sent to these addresses may not be recoverable!
console.log(instantiated.testnetAddress)
console.log(instantiated.mainnetAddress)

// create the spending transaction
const spendTransaction = spend(
  instantiated.fundingTransaction,
  destinationAddress,
  amount,
  locktime,
  sequenceNumber
)

// sign it
const sighash = toSighash(instantiated, spendTransaction)
const sig = createSignature(sighash, privateKey)

// add the signature so the script succeeds
const fulfilledTransaction = fulfill(instantiated, spendTransaction, [sig], "spend")

// throw an error if transaction is invalid
fulfilledTransaction.check()
