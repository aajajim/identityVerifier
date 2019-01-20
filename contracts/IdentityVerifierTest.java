package com.jelurida.ardor.contracts;
import aajajim.contracts.identityverifier.IdentityVerifier;
import nxt.addons.JA;
import nxt.addons.JO;
import nxt.blockchain.Block;
import nxt.blockchain.ChainTransactionId;
import nxt.blockchain.ChildTransaction;
import nxt.blockchain.FxtTransaction;
import nxt.crypto.Crypto;
import nxt.http.callers.GetAccountPropertiesCall;
import nxt.http.callers.TriggerContractByRequestCall;
import nxt.util.Convert;
import org.junit.Assert;
import org.junit.Test;

import static nxt.blockchain.ChildChain.IGNIS;

public class IdentityVerifierTest extends AbstractContractTest {

    //Test OK
    @Test
    public void ChallengeTextTestByRequest(){
        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_CHALLENGE);

        //region GetChallenge using TriggetContractByRequest => processRequest requires admin password
        JO response = TriggerContractByRequestCall.create().contractName(contractName).setupParams(params.toJSONString()).call();
        Assert.assertNotNull(response);
        Assert.assertFalse(response.containsKey("errorCode"));
        String challenge = response.getString(IdentityVerifier.IVConstants.CHALLENGE);
        String token = response.getString(IdentityVerifier.IVConstants.TOKEN);
        Assert.assertTrue(Crypto.verify(Convert.parseHexString(token), Convert.toBytes(challenge), ALICE.getPublicKey()));
    }

    //Test OK
    @Test
    public void ChallengeTextTestByMessage(){
        Block lastBlock;
        ChainTransactionId contractResultTransactionId = null;
        String triggerFullHash;
        JO response;

        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);

        //region GetChallenge using SendMessage => processTransaction
        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_CHALLENGE);
        JO msg = new JO();
        msg.put("contract", contractName);
        msg.put("params", params);
        triggerFullHash = ContractTestHelper.messageTriggerContract(msg.toJSONString());
        generateBlock();

        // Verify that the contract send back a message
        lastBlock = getLastBlock();
        for (FxtTransaction transaction : lastBlock.getFxtTransactions()) {
            for (ChildTransaction childTransaction : transaction.getSortedChildTransactions()) {
                Assert.assertEquals(2, childTransaction.getChain().getId());
                Assert.assertEquals(1, childTransaction.getType().getType());
                Assert.assertEquals(0, childTransaction.getType().getSubtype());
                Assert.assertEquals(ALICE.getAccount().getId(), childTransaction.getSenderId());
                Assert.assertEquals(BOB.getAccount().getId(), childTransaction.getRecipientId());
                ChainTransactionId triggerTransactionId = new ChainTransactionId(IGNIS.getId(), Convert.parseHexString(triggerFullHash));
                Assert.assertEquals(triggerTransactionId, childTransaction.getReferencedTransactionId());
                contractResultTransactionId = new ChainTransactionId(childTransaction.getChain().getId(), childTransaction.getFullHash());
            }
        }
        Assert.assertNotNull(contractResultTransactionId);
        response = JO.parse(Convert.toString(contractResultTransactionId.getTransaction().getPrunablePlainMessage().getMessage()));
        Assert.assertNotNull(response);
        Assert.assertTrue(response.containsKey(IdentityVerifier.IVConstants.CHALLENGE));
        Assert.assertTrue(response.containsKey(IdentityVerifier.IVConstants.TOKEN));
        String challenge = response.getString(IdentityVerifier.IVConstants.CHALLENGE);
        String token = response.getString(IdentityVerifier.IVConstants.TOKEN);
        Assert.assertTrue(Crypto.verify(Convert.parseHexString(token), Convert.toBytes(challenge), contractResultTransactionId.getTransaction().getSenderPublicKey()));
        //endregion
    }

    //Test OK
    @Test
    public void ChallengeTextTestByPayment(){
        Block lastBlock;
        ChainTransactionId contractResultTransactionId = null;
        String triggerFullHash;
        JO response;

        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_CHALLENGE);
        JO msg = new JO();
        msg.put("contract", contractName);
        msg.put("params", params);

        //region GetChallenge using SendMoney => processTransaction
        triggerFullHash = ContractTestHelper.bobPaysContract(msg.toJSONString(), IGNIS);
        generateBlock();
        lastBlock = getLastBlock();
        for (FxtTransaction transaction : lastBlock.getFxtTransactions()) {
            for (ChildTransaction childTransaction : transaction.getSortedChildTransactions()) {
                Assert.assertEquals(2, childTransaction.getChain().getId());
                Assert.assertEquals(1, childTransaction.getType().getType());
                Assert.assertEquals(0, childTransaction.getType().getSubtype());
                Assert.assertEquals(ALICE.getAccount().getId(), childTransaction.getSenderId());
                Assert.assertEquals(BOB.getAccount().getId(), childTransaction.getRecipientId());
                ChainTransactionId triggerTransactionId = new ChainTransactionId(IGNIS.getId(), Convert.parseHexString(triggerFullHash));
                Assert.assertEquals(triggerTransactionId, childTransaction.getReferencedTransactionId());
                contractResultTransactionId = new ChainTransactionId(childTransaction.getChain().getId(), childTransaction.getFullHash());
            }
        }
        Assert.assertNotNull(contractResultTransactionId);
        response = JO.parse(Convert.toString(contractResultTransactionId.getTransaction().getPrunablePlainMessage().getMessage()));
        Assert.assertNotNull(response);
        Assert.assertTrue(response.containsKey(IdentityVerifier.IVConstants.CHALLENGE));
        Assert.assertTrue(response.containsKey(IdentityVerifier.IVConstants.TOKEN));
        String challenge = response.getString(IdentityVerifier.IVConstants.CHALLENGE);
        String token = response.getString(IdentityVerifier.IVConstants.TOKEN);
        Assert.assertTrue(Crypto.verify(Convert.parseHexString(token), Convert.toBytes(challenge), contractResultTransactionId.getTransaction().getSenderPublicKey()));
        //endregion
    }

    //Test OK
    @Test
    public void PublicAccountVerificationTestByPayment(){
        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);
        String challenge = "1#15661561748981954091";
        String token = "dc6ce3666d088625eac4bd59d1b6b2c1499600fc3e7ebf250f080af5b6a54309a1e7da9a4ad2aee5caf7588f73d00c611b1e8575a0e95a93c8ef7703b8957d46";
        byte[] signedChallenge = Crypto.sign(Convert.parseHexString(token), BOB.getSecretPhrase());
        String url = "https://twitter.com/aajaji_m/status/1086563315625717760";

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_VERIFY_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.CHALLENGE, challenge);
        params.put(IdentityVerifier.IVConstants.SIGNED_TOKEN, Convert.toHexString(signedChallenge));
        JO externalSource = new JO();
        externalSource.put(IdentityVerifier.IVConstants.PUBLIC_URL, url);
        params.put("externalSource", externalSource);

        JO msg = new JO();
        msg.put("contract", contractName);
        msg.put("params", params);

        String triggerFullHash = ContractTestHelper.bobPaysContract(msg.toJSONString(), IGNIS);
        generateBlock();
        // Check that the contract has registered the citizen on the blockchain
        JO call = GetAccountPropertiesCall.create().setter(ALICE.getRsAccount()).property(IdentityVerifier.IVConstants.VERIFIED_ACCOUNT).recipient(BOB.getRsAccount()).call();
        JA properties = call.getArray("properties");
        Assert.assertEquals(1, properties.size());
        JO property = properties.get(0);
        String name = property.getString("property");
        Assert.assertTrue(name.equals(IdentityVerifier.IVConstants.VERIFIED_ACCOUNT));
        JO value = JO.parse(property.getString("value"));
        String challengeSet = value.getString(IdentityVerifier.IVConstants.CHALLENGE);
        String urlSet = value.getString(IdentityVerifier.IVConstants.PUBLIC_URL);
        Assert.assertTrue(challengeSet.equals(challenge));
        Assert.assertTrue(urlSet.equals(url));
    }

    //Test KO: We expect the contract to generate an error message
    @Test
    public void PublicAccountVerificationTestByRequest(){
        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);
        String challenge = "1#1470317583254217001";
        String token = "9d0bf2903f889329d0da4653b346ddcf4d8ab0d06bb4849e2ac08aed9f135a07d0290bb8b29aba81cce19b3af06129aaedef6178b1ecc3871bb501e0b2e76d06";
        byte[] signedChallenge = Crypto.sign(Convert.parseHexString(token), BOB.getSecretPhrase());
        String url = "https://twitter.com/aajaji_m/status/1083320344084168704";

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_VERIFY_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.CHALLENGE, challenge);
        params.put(IdentityVerifier.IVConstants.SIGNED_TOKEN, Convert.toHexString(signedChallenge));
        JO externalSource = new JO();
        externalSource.put(IdentityVerifier.IVConstants.PUBLIC_URL, url);
        params.put("externalSource", externalSource);

        //Send Request
        JO response = TriggerContractByRequestCall.create().contractName(contractName).setupParams(params.toJSONString()).call();
        Assert.assertTrue(response.containsKey("errorCode"));
        String err = response.getString("errorDescription");
        Assert.assertTrue(err.equals("To Verify your account and set a property, please use Send a payment transaction."));
    }

    //Test KO: We expect the contract to generate an error message
    @Test
    public void PublicAccountVerificationTestByMessage(){
        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);
        String challenge = "1#1470317583254217001";
        String token = "9d0bf2903f889329d0da4653b346ddcf4d8ab0d06bb4849e2ac08aed9f135a07d0290bb8b29aba81cce19b3af06129aaedef6178b1ecc3871bb501e0b2e76d06";
        byte[] signedChallenge = Crypto.sign(Convert.parseHexString(token), BOB.getSecretPhrase());
        String url = "https://twitter.com/aajaji_m/status/1083320344084168704";

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PUBLIC_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_VERIFY_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.CHALLENGE, challenge);
        params.put(IdentityVerifier.IVConstants.SIGNED_TOKEN, Convert.toHexString(signedChallenge));
        JO externalSource = new JO();
        externalSource.put(IdentityVerifier.IVConstants.PUBLIC_URL, url);
        params.put("externalSource", externalSource);

        JO msg = new JO();
        msg.put("contract", contractName);
        msg.put("params", params);

        msg.put("contract", contractName);
        msg.put("params", params);
        String triggerFullHash = ContractTestHelper.messageTriggerContract(msg.toJSONString());

        //Send Request
        JO response = TriggerContractByRequestCall.create().contractName(contractName).setupParams(params.toJSONString()).call();
        Assert.assertTrue(response.containsKey("errorCode"));
        String err = response.getString("errorDescription");
        Assert.assertTrue(err.equals("To Verify your account and set a property, please use Send a payment transaction."));
    }

    //Test KO: We expect the contract to generate an error message
    @Test
    public void PhoneNumberGetChallengeTestByRequest(){
        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);
        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PHONE_NUMBER);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_CHALLENGE);

        //region GetChallenge using TriggetContractByRequest => processRequest requires admin password
        JO response = TriggerContractByRequestCall.create().contractName(contractName).setupParams(params.toJSONString()).call();
        Assert.assertNotNull(response);
        Assert.assertTrue(response.containsKey("errorCode"));
        String err = response.getString("errorDescription");
        Assert.assertTrue(err.equals("Phone Number verification system has not been implemented yet!"));
        //endregion
    }

    //Test KO: We expect the contract to generate an error message
    @Test
    public void PhoneNumberVerificationTestByPayment(){
        Block lastBlock;
        ChainTransactionId contractResultTransactionId = null;
        String triggerFullHash;
        JO response;

        String contractName = ContractTestHelper.deployContract(IdentityVerifier.class);
        String challenge = "1#1470317583254217001";
        String token = "9d0bf2903f889329d0da4653b346ddcf4d8ab0d06bb4849e2ac08aed9f135a07d0290bb8b29aba81cce19b3af06129aaedef6178b1ecc3871bb501e0b2e76d06";
        byte[] signedChallenge = Crypto.sign(Convert.parseHexString(token), BOB.getSecretPhrase());
        String url = "https://twitter.com/aajaji_m/status/1083320344084168704";

        JO params = new JO();
        params.put(IdentityVerifier.IVConstants.VERIF_TYPE, IdentityVerifier.IVConstants.VERIF_PHONE_NUMBER);
        params.put(IdentityVerifier.IVConstants.REQ_TYPE, IdentityVerifier.IVConstants.REQ_VERIFY_ACCOUNT);
        params.put(IdentityVerifier.IVConstants.CHALLENGE, challenge);
        params.put(IdentityVerifier.IVConstants.SIGNED_TOKEN, Convert.toHexString(signedChallenge));
        JO externalSource = new JO();
        externalSource.put(IdentityVerifier.IVConstants.PUBLIC_URL, url);
        params.put("externalSource", externalSource);

        JO msg = new JO();
        msg.put("contract", contractName);
        msg.put("params", params);
        triggerFullHash = ContractTestHelper.bobPaysContract(msg.toJSONString(), IGNIS);
        generateBlock();

        JO call = GetAccountPropertiesCall.create().setter(ALICE.getRsAccount()).property(IdentityVerifier.IVConstants.VERIFIED_ACCOUNT).recipient(BOB.getRsAccount()).call();
        JA properties = call.getArray("properties");
        Assert.assertEquals(0, properties.size());

        // Verify that the contract send back a message
        lastBlock = getLastBlock();
        for (FxtTransaction transaction : lastBlock.getFxtTransactions()) {
            for (ChildTransaction childTransaction : transaction.getSortedChildTransactions()) {
                Assert.assertEquals(2, childTransaction.getChain().getId());
                Assert.assertEquals(1, childTransaction.getType().getType());
                Assert.assertEquals(0, childTransaction.getType().getSubtype());
                Assert.assertEquals(ALICE.getAccount().getId(), childTransaction.getSenderId());
                Assert.assertEquals(BOB.getAccount().getId(), childTransaction.getRecipientId());
                ChainTransactionId triggerTransactionId = new ChainTransactionId(IGNIS.getId(), Convert.parseHexString(triggerFullHash));
                Assert.assertEquals(triggerTransactionId, childTransaction.getReferencedTransactionId());
                contractResultTransactionId = new ChainTransactionId(childTransaction.getChain().getId(), childTransaction.getFullHash());
            }
        }
        Assert.assertNotNull(contractResultTransactionId);
        response = JO.parse(Convert.toString(contractResultTransactionId.getTransaction().getPrunablePlainMessage().getMessage()));
        Assert.assertNotNull(response);
        Assert.assertTrue(response.containsKey("errorCode"));
        String err = response.getString("errorDescription");
        Assert.assertTrue(err.equals("Phone Number verification system has not been implemented yet!"));
    }
}
