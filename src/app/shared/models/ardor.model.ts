

export class ArdorAccount {
    public accountRS: string;
    public account: string;
    public publicKey: string;
    public name: string;
    public description: string;
    public forgedBalanceFQT: string;

    constructor(acc: Object){
        let js = JSON.parse(acc.toString());
        this.accountRS = js.accountRS;
        this.account = js.account;
        this.publicKey = js.publicKey;
        this.name = js.name;
        this.description = js.description;
        this.forgedBalanceFQT = js.forgedBalanceFQT;
    }
}

export class ArdorProperty {
    public faviconUrl: string;
    public verifiedAcc: string;
    public verifiedAccUrl: string;
    public setterRS: string;
    public setter: string;
    public property: string;
    public value: string;
    public status: boolean;

    constructor(prop: Object) {
        let js = JSON.parse(JSON.stringify(prop));
        this.setterRS = js.setterRS;
        this.setter = js.setter;
        this.property = js.property;
        this.value = js.value;
        this.status = true;
        try {
            const val = JSON.parse(js.value);
            if (Object.keys(val).includes('verifiedAccount')) {
                this.verifiedAcc = val.get('verifiedAccount');
                this.faviconUrl = 'https://www.google.com/s2/favicons?domain=' + this.verifiedAcc;
                this.verifiedAccUrl = val.get('verificationUrl');
            }
        } catch (e) {}
        }
}

export class ArdorBalance {
    public chainName: string;
    public chainSymbol: string;
    public chainAmount: number;
    public chainLogo: string;

    constructor(chainId: string, balance: Object) {
        let js = JSON.parse(JSON.stringify(balance));
        switch (chainId) {
            case '1': {
                this.setProperties('Ardor', 'ARDR', js.balanceNQT, 'ardor_logo.jpg', 8);
                break;
            }
            case '2': {
                this.setProperties('Ignis', 'IGNIS', js.balanceNQT, 'ignis_logo.jpg', 8);
                break;
            }
            case '3': {
                this.setProperties('Ardor Gate', 'AEUR', js.balanceNQT, 'aeur_logo.jpg', 4);
                break;
            }
            case '4': {
                this.setProperties('Bitswift', 'BITS', js.balanceNQT, 'bits_logo.jpg', 8);
                break;
            }
            case '5': {
                this.setProperties('Max Property Group', 'MGP', js.balanceNQT, 'mpg_logo.jpg', 8);
                break;
            }
            default: {
                this.setProperties('NULL', 'NULL', '0', 'null.jpg', 8);
                break;
            }
        }
    }


    setProperties(name: string, symbol: string, amount: string, logo: string, decimals: number) {
        this.chainName = name;
        this.chainSymbol = symbol;
        this.chainAmount = parseInt(amount, 10) / 10 ** decimals;
        this.chainLogo = '/assets/images/childchains/' + logo;
    }
}

export class ArdorTransaction {
    public chain: number;
    public senderRS: string;
    public recipientRS: string;
    public type: number;
    public subtype: number;
    public feeNQT: number;
    public amountNQT: number;
    public timestamp: number;
    public fullHash: string;
    public confirmations: number;
    public attachment: JSON;
    public attachedMessage: string;

    constructor(tx: Object) {
        const js = JSON.parse(JSON.stringify(tx));
        this.chain = js.chain;
        this.senderRS = js.senderRS ;
        this.recipientRS = js.recipientRS ;
        this.type = js.type ;
        this.subtype = js.subtype ;
        this.feeNQT = Number.parseInt(js.feeNQT) / 10 ** 8 ;
        this.amountNQT = Number.parseInt(js.amountNQT) / 10 ** 8 ;
        this.timestamp = Number.parseInt(js.timestamp) + 1514300399;
        this.fullHash = js.fullHash ;
        this.confirmations = js.confirmations;
        this.attachment = JSON.parse(JSON.stringify(js.attachment));
        if (this.attachment !== undefined  && this.attachment['message'] !== undefined) {
            this.attachedMessage = this.attachment['message'];
        }
    }
}