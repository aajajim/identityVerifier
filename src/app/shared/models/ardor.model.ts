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
    constructor(
        public setterRS: string,
        public setter: string,
        public property: string,
        public value: string) {}
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
                this.setProperties('Max Property Group', 'MGP', chainBalance, 'mgp_logo.jpg');
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
        this.chainAmount = parseInt(amount);
        this.chainLogo = logo;
    }
}