export class ArdorAccount {
    constructor(
        public accountRS: string,
        public account: string,
        public publicKey: string,
        public name: string,
        public description: string,
        public forgedBalanceFQT: string
    ) {}
}

export class ArdorProperty {
    public faviconUrl: string;
    public verifiedAcc: string;
    public verifiedAccUrl: string;

    constructor(
        public setterRS: string,
        public setter: string,
        public property: string,
        public value: string,
        public status: boolean) {
            try {
                const val = JSON.parse(value);
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

    constructor(
        chainId: string,
        chainBalance: string
    ) {
        switch (chainId) {
            case '1': {
                this.setProperties('Ardor', 'ARDR', chainBalance, 'ardor_logo.jpg');
                break;
            }
            case '2': {
                this.setProperties('Ignis', 'IGNIS', chainBalance, 'ignis_logo.jpg');
                break;
            }
            case '3': {
                this.setProperties('Ardor Gate', 'AEUR', chainBalance, 'aeur_logo.jpg');
                break;
            }
            case '4': {
                this.setProperties('Bitswift', 'BITS', chainBalance, 'bits_logo.jpg');
                break;
            }
            case '5': {
                this.setProperties('Max Property Group', 'MGP', chainBalance, 'mpg_logo.jpg');
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