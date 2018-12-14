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
