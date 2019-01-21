# Ardor LightWeight Contract

The smart contract is developped in Java and uses a simple setup based on the implementation of AbstractContract class that provides an interface on how to interact with Ardor blockchain.

The contract is deployed on Ignis, which is a Childchain on the Ardor blockchain (Ardor is the first project to provide working Multi-Chain architecture). Thus, childchain can be configured to run smart contracts or not depending the Dapp developers needs.

# How the contract works?
In order to verify that you control an ardor account, you need to:
- Send a message to the contract account to ask for a challenge
- Contract will respond with a challengeText and a Token that represents the signature of the challengeText by the contract account. **Please note a chalenge is only valid for 30min (180 blocks in Ardor TestNet)**
- Send an Ignis payment transaction with an attached message where you sumbit 3 things: 
    - The challengeText
    - A signedToken which correspond to your signature of the Token (sent by contract in step 2) using your passPhrase/privateKey, this will prove that you control your account
    - A public url where you publised the signedToken (a twitt, a facebook post, an e-commerce description, ...). This public url will prove that you control the account where the signedToken was published (twitter account, facebook account, e-commerce account, ...)

# Contract design
The contract can be triggered from the external world in two way:

1. Triggered by a transaction directly sent the account that deployed the contract (internally the contract implements the  `processTransaction()` method)
This kind of triggers can only accept a Message transaction or a Payment transaction with an attached message.
    - Message transaction is used only to ask the contract for a challenge
    - Payment transaction is used to ask the contract to verify that the user controls the account and to link the external public account with his ardor account

2. [For experiment only] Triggered by a simple request to the ardor network  (internally the contract implements the `processRequest()` method)
This kind of triggers is only used to ask contract for a challenge (but requires admin password from the node runner, so don't use i for now)

The contract has been designed following a [Strategy Design Pattern](https://en.wikipedia.org/wiki/Strategy_pattern) in order to be able to adapt to different verification method (verification of a public account, verification of a phone number, verification of an email adress, ...)

Please refer to the [Ardor LightWeight contract documentation](https://ardordocs.jelurida.com/Lightweight_Contracts) for more details on how to build contracts in the ardor blockchain 

# Contract Usage
1. GetChallenge: Send a message on Ignis childchain with following text (not encrypted)
```json
{
    "contract":"IdentityVerifier", 
    "params":{
        "verificationType":"publicAccount", 
        "requestType":"getChallenge"
        }
}
```

2. VerifyAccount: Send a payment on Ignis childchain with following attached message (not encrypted):
```json
{
    "contract":"IdentityVerifier", 
    "params":{
        "verificationType":"publicAccount", 
        "requestType":"verifyAccount", 
        "challengeText":"<THE CHALLENGE TEXT>", 
        "signedToken":"<YOUR SIGNED TOKEN>", 
        "externalSource":{
            "publicUrl":"<YOUR Public URL WHERE SIGNED TOKEN HAS BEEN PUBLISHED>"
        }
    }
}```
