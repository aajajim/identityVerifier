package aajajim.contracts.identityverifier;

import nxt.addons.*;
import nxt.blockchain.TransactionTypeEnum;
import nxt.http.callers.*;
import nxt.util.Convert;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Random;

@ContractInfo(version = "1.0.0", description = "Decentralized Identity Verifier")
public class IdentityVerifier extends AbstractContract {

    //region Contract parameters

    @ContractParametersProvider
    public interface Params{

        @ContractSetupParameter
        default long expiryLimit() {return 180;} //Number of blocks after which the challenge is considered as expired, 30min for testNet

        @ContractInvocationParameter
        String verificationType(); //Public Account or PhoneNumber

        @ContractInvocationParameter
        String requestType(); //CreateChallenge, VerifyToken or VerifyAccount

        @ContractInvocationParameter
        String signedToken(); //Signed token by the user, necessary for VerifyToken or VerifyAccount

        @ContractInvocationParameter
        String challenge(); //Challenge sent by the contract

        @ContractInvocationParameter
        JO externalSource(); //External source where the signedtoken is published (publicUrl in PublicAccount verification)
    }

    //endregion

    //region Implementation of AbstractContract interface

    @ValidateChain(accept = {2})
    @ValidateTransactionType(accept = {TransactionTypeEnum.CHILD_PAYMENT, TransactionTypeEnum.SEND_MESSAGE})
    @ValidateContractRunnerIsRecipient()
    @Override
    public JO processTransaction(TransactionContext context){
        JO response;
        try{
            VerificationSystem vS = new VerificationSystem(context.getParams(Params.class).verificationType());
            if( vS.system == null){
                return context.generateErrorResponse(10102,"Unknown verificationType, please refer to documentation for supported types!");
            }
            switch (context.getParams(Params.class).requestType()){
                case IVConstants.REQ_CHALLENGE:
                    response = vS.CreateChallenge(context);
                    break;
                case IVConstants.REQ_VERIFY_ACCOUNT:
                    response = vS.VerifyAccount(context, context.getParams(Params.class).challenge(),context.getParams(Params.class).signedToken(), context.getParams(Params.class).externalSource());
                    break;
                default:
                    return context.generateErrorResponse(10102,"Unknown requestType, please refer to documentation for supported requests!");
            }
        }catch (Exception e){
            // If any unsupported behavior happens than return the sent funds
            return context.generateErrorResponse(10101, String.format("UnExpected behavior during contract execution. please refer to message: %s", e.getMessage()));
        }

        //Always Reply with the response to notify user about the result
        SendMessageCall sendMessage = SendMessageCall.create(context.getTransaction().getChainId())
                .recipient(context.getTransaction().getSenderRs())
                .message(response.toJSONString())
                .messageIsPrunable(true);
        return context.createTransaction(sendMessage);
    }

    /** This type of triggering is only used to get a challenge and to validate a token.
     * @param context the call context
     * @return Json object with the response
     */
    @ValidateChain(accept = {2})
    @Override
    public JO processRequest(RequestContext context) {
        // Requires admin password of the contract runner
        JO response;
        try{
            JO setupParams = JO.parse(context.getParameter("setupParams"));
            VerificationSystem vS = new VerificationSystem(setupParams.getString(IVConstants.VERIF_TYPE));
            if( vS.system == null){
                return context.generateErrorResponse(10104,"Unknown verificationType, please refer to documentation for supported types!");
            }
            switch (setupParams.getString(IVConstants.REQ_TYPE)){
                case IVConstants.REQ_CHALLENGE:
                    response = vS.CreateChallenge(context);
                    break;
                case IVConstants.REQ_VERIFY_ACCOUNT:
                    return context.generateErrorResponse(10104,"To Verify your account and set a property, please use Send a payment transaction.");
                default:
                    return context.generateErrorResponse(10104,"Unknown requestType, please refer to documentation for supported requests!");
            }
        }catch (Exception e){
            return context.generateErrorResponse(10104, String.format("UnExpected behavior during contract execution. please refer to message: %s", e.getMessage()));
        }
        return response;
    }

    //endregion

    //region Identity Verification system following a Strategy design pattern
    /**
     * Initial purpose was to use an interface and different implementation depending
     * on th type of account to be verified.
     * For this version we don't use inner interface and inner implementations because of
     * deployment bug. This contract can be enhanced later when the bug will be fixed
     */

    /**
     * PublicAccount verification strategy
     */
    public class PublicAccountVerification {

        public boolean ChallengeExpired(AbstractContractContext callContext, String challenge) {
            String[] parts = challenge.split("#");
            if(parts.length != 2){
                callContext.logInfoMessage("Challenge does not contain the correct number of parameters!");
                return true;
            }
            JO block = GetBlockCall.create().block(parts[1]).call();
            if(block.containsKey("errorCode")){
                callContext.logInfoMessage("BlockId in the challenge is unknown");
                return true;
            }

            int currentHeight = callContext.getBlockchainHeight();
            int blockHeight = Integer.valueOf(block.getString("height"));
            return (currentHeight > (blockHeight + Integer.valueOf(parts[0]) + callContext.getParams(Params.class).expiryLimit()));
        }

        public JO CreateChallenge(AbstractContractContext callContext) {
            //Build a challenge using a random number and the block id located at currentHeight-randomNumber
            //For testing purposes the heightToSearch my be negative, so we restrict it to currentHeight
            Random randGenerator = new Random();
            int randNumber  = randGenerator.nextInt(1000);
            int currentHeight = callContext.getBlockchainHeight();
            randNumber = ((currentHeight - randNumber) <0) ? currentHeight: randNumber ;
            String blockId = GetBlockIdCall.create().height(currentHeight - randNumber).call().getString("block");

            //Build the challenge. I don't think it's necessary to encrypt it.
            String challenge = Integer.toString(randNumber) + "#" + blockId;

            //Sign the challenge by the contract runner
            byte[] token= callContext.sign(Convert.toBytes(challenge), callContext.getConfig().getSecretPhrase());

            //In response, only the challenge and signed challenge are necessary
            JO response = new JO();
            response.put(IVConstants.CHALLENGE, challenge);
            response.put(IVConstants.TOKEN, Convert.toHexString(token));
            return callContext.generateResponse(response);
        }

        public JO VerifyAccount(AbstractContractContext callContext, String challenge, String signedToken, JO externalSource) {
            try{
                // Account Verification is done only throw payment transaction with message
                TransactionContext context = (TransactionContext)callContext;
                if (context.notPaymentTransaction()) {
                    return context.generateErrorResponse(10104,"To Verify your account and set a property, please use Send a payment transaction.");
                }

                // Verify that challenge hasn't expired
                if(ChallengeExpired(callContext, challenge)){
                    return callContext.generateErrorResponse(10104, "The challenge token has expired or wrong, please try again!");
                }

                if(context == null){
                    return callContext.generateErrorResponse(10104, "Verification should be asked using a transaction");
                }

                // Verify that signed token correspond to sender signing of signed challenge by the contract
                boolean signatureVerification  = VerifySignedToken(context, challenge, signedToken);
                if(!signatureVerification){
                    return callContext.generateErrorResponse(10104, "Token verification failed! Challenge has not been signed by transaction sender!");
                }

                // Verify that attached amount is sufficient to perform the account property assignment
                long paymentAmount = context.getTransaction().getAmount();
                if(paymentAmount < IVConstants.MINIMUM_AMOUNT){
                    return callContext.generateErrorResponse(10104, "The payment amount is lower that the minimum required %s IGNIS", IVConstants.MINIMUM_AMOUNT/100000000);
                }

                // Verify that the public url contains the signedToken
                String publicURL = externalSource.getString(IVConstants.PUBLIC_URL, "");
                if(!VerifyUrl(signedToken, publicURL)){
                    return callContext.generateErrorResponse(10104, "The PUBLIC_URL provided does not contain the signedToken!");
                }

                // Assign to property to the account
                JO value = new JO();
                value.put(IVConstants.CHALLENGE, challenge);
                value.put(IVConstants.PUBLIC_URL, publicURL);
                SetAccountPropertyCall setProp = SetAccountPropertyCall.create(context.getChainOfTransaction().getId())
                        .recipient(context.getSenderId())
                        .property(IVConstants.VERIFIED_ACCOUNT)
                        .value(value.toJSONString());
                return callContext.createTransaction(setProp);
            }catch (Exception e){
                return callContext.generateErrorResponse(10101, e.getMessage());
            }
        }

        private boolean VerifyUrl(String signedToken, String publicURL) throws Exception{
            if(!publicURL.isEmpty()){
                try{
                    URL url = new URL(publicURL);
                    URLConnection conn = url.openConnection();

                    BufferedReader buffer = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    String inputLine;
                    while((inputLine = buffer.readLine()) != null){
                        if((inputLine).contains(signedToken)){
                            return true;
                        }
                    }
                }catch (MalformedURLException e){
                    throw e;
                }catch (IOException e){
                    throw e;
                }
            }
            return false;
        }

        private boolean VerifySignedToken(TransactionContext callContext, String challenge, String signedToken){
            byte[] token =  callContext.sign(Convert.toBytes(challenge), callContext.getConfig().getSecretPhrase());
            return callContext.verify(Convert.parseHexString(signedToken), token, callContext.getTransaction().getSenderPublicKey());
        }
    }

    /**
     * PhoneNumber verification strategy
     * In order to verify a phone number we proceed as follow:
     * 1- User submit his phone number into a form in the client application or using an encrypted message with codified inputs
     * 2- Contract decrypts the message and sends an SMS with a challenge text (6 or 8 digits number) using a third party service
     * (external to blockchain)
     * 3- User submits the digits challenge (in client app or using a message) with his signature of the challenge
     * 4- Contract verifies the challenge and the signature, then it sets a property on the account.
     *
     * Need more analysis to correctly build the setup
     */
    public class PhoneNumberVerification {

        public boolean ChallengeExpired(AbstractContractContext callContext, String challenge) {
            return false;
        }

        public JO CreateChallenge(AbstractContractContext callContext) {
            return callContext.generateErrorResponse(10502, "Phone Number verification system has not been implemented yet!");
        }

        public JO VerifyAccount(AbstractContractContext callContext, String challenge, String signedToken, JO externalSource) {
            return callContext.generateErrorResponse(10502, "Phone Number verification system has not been implemented yet!");
        }
    }

    /**
     * The Verification System context
     */
    public class VerificationSystem {
        private String system;

        public VerificationSystem(String system){
            this.system = system;
        }

        public boolean ChallengeExpired(AbstractContractContext callContext, String challenge){
            switch (this.system){
                case IVConstants.VERIF_PHONE_NUMBER:
                    PhoneNumberVerification phone = new PhoneNumberVerification();
                    return phone.ChallengeExpired(callContext, challenge);
                case IVConstants.VERIF_PUBLIC_ACCOUNT:
                    PublicAccountVerification pubAccount = new PublicAccountVerification();
                    return pubAccount.ChallengeExpired(callContext, challenge);
                default:
                    return false;
            }
        }

        public JO CreateChallenge(AbstractContractContext callContext){
            switch (this.system){
                case IVConstants.VERIF_PHONE_NUMBER:
                    PhoneNumberVerification phone = new PhoneNumberVerification();
                    return phone.CreateChallenge(callContext);
                case IVConstants.VERIF_PUBLIC_ACCOUNT:
                    PublicAccountVerification pubAccount = new PublicAccountVerification();
                    return pubAccount.CreateChallenge(callContext);
                default:
                    return null;
            }
        }

        public JO VerifyAccount(AbstractContractContext callContext, String challenge, String signedToken, JO externalSource){
            switch (this.system){
                case IVConstants.VERIF_PHONE_NUMBER:
                    PhoneNumberVerification phone = new PhoneNumberVerification();
                    return phone.VerifyAccount(callContext, challenge, signedToken, externalSource);
                case IVConstants.VERIF_PUBLIC_ACCOUNT:
                    PublicAccountVerification pubAccount = new PublicAccountVerification();
                    return pubAccount.VerifyAccount(callContext, challenge, signedToken, externalSource);
                default:
                    return null;
            }
        }
    }

    //endregion

    //region Constants

    public final class IVConstants {
        // Minimal amount to be send in order to set a property in Ignis
        public static final long MINIMUM_AMOUNT = 10000000;

        // Contract supported verification types
        public static final String VERIF_TYPE = "verificationType";
        public static final String VERIF_PUBLIC_ACCOUNT = "publicAccount";
        public static final String VERIF_PHONE_NUMBER = "phoneNumber";

        // API functions names
        public static final String REQ_TYPE = "requestType";
        public static final String REQ_CHALLENGE = "getChallenge";
        public static final String REQ_VERIFY_ACCOUNT = "verifyAccount";

        // API parameters names
        public static final String CHALLENGE = "challenge";
        public static final String TOKEN = "token";
        public static final String SIGNED_TOKEN = "signedToken";
        public static final String VERIFIED_ACCOUNT = "verifiedAccount";
        public static final String PUBLIC_URL = "publicUrl";
    }

    //endregion

    //region Identity Verification interface intended to be used for Strategy Design pattern
    /**
     * The Strategy Interface

     public interface IVerificationSystem {

     /**
     * A method defining whether the challenge has expired or not.
     * It will be based of a defined number of blocks and the fact that the challenge has already been used
     * @param callContext The call context
     * @param challenge The challenge previously submitted by the contract
     * @return True if the challenge has expired, false otherwise

    boolean ChallengeExpired(AbstractContractContext callContext, String challenge);

    /**
     * A method dedicated to create a challenge to be signed later by the User
     * @param callContext The call context
     * @return Json object containing the challenge message and it's signature by the contract

    JO CreateChallenge(AbstractContractContext callContext);

    /**
     * A method designed to verify if a token has been
     * @param callContext The call context
     * @param signedToken The token to verify
     * @return Json object containing:
     *  the initial token, the ardor account and the external account associated with that token, if token is valid
     *  an error message if the token is not valid

    JO VerifyToken(AbstractContractContext callContext, String signedToken);

    /**
     * A method designed to verify an account based on a response for a challenge
     * @param callContext Context containing necessary information for the verification process
     * @param challenge The initial challenge submited by the contract
     * @param signedToken The signed token by the user
     * @param externalSource The external source when the signedToken is published, could be a URL or other
     * @return Json object with the result of the verification and a transaction hash of the setProperty call

    JO VerifyAccount(AbstractContractContext callContext, String challenge, String signedToken, JO externalSource);
    }
     */

    //endregion

}
