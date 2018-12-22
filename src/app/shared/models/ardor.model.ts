

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
                this.setProperties('Ardor', 'ARDR', js.balanceNQT, 'ardor_logo.jpg');
                break;
            }
            case '2': {
                this.setProperties('Ignis', 'IGNIS', js.balanceNQT, 'ignis_logo.jpg');
                break;
            }
            case '3': {
                this.setProperties('Ardor Gate', 'AEUR', js.balanceNQT, 'aeur_logo.jpg');
                break;
            }
            case '4': {
                this.setProperties('Bitswift', 'BITS', js.balanceNQT, 'bits_logo.jpg');
                break;
            }
            case '5': {
                this.setProperties('Max Property Group', 'MGP', js.balanceNQT, 'mpg_logo.jpg');
                break;
            }
            default: {
                this.setProperties('NULL', 'NULL', '0', 'null.jpg');
                break;
            }
        }
    }


    setProperties(name: string, symbol: string, amount: string, logo: string) {
        this.chainName = name;
        this.chainSymbol = symbol;
        this.chainAmount = parseInt(amount, 10) / 100000000;
        this.chainLogo = '/assets/images/childchains/' + logo;
    }
}