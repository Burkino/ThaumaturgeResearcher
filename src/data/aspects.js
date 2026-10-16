export const primalAspects = [
    { id: 'aer', name: 'Aer', isPrimal: true, tier: 1, color: '#ffff7e' },
    { id: 'terra', name: 'Terra', isPrimal: true, tier: 1, color: '#56c000' },
    { id: 'ignis', name: 'Ignis', isPrimal: true, tier: 1, color: '#ff5a01' },
    { id: 'aqua', name: 'Aqua', isPrimal: true, tier: 1, color: '#3cd4fc' },
    { id: 'ordo', name: 'Ordo', isPrimal: true, tier: 1, color: '#d5d4ec' },
    { id: 'perditio', name: 'Perditio', isPrimal: true, tier: 1, color: '#404040' },
];

export const standardCompounds = [
    { id: 'vacuos', name: 'Vacuos', components: ['aer', 'perditio'], color: '#888888' },
    { id: 'lux', name: 'Lux', components: ['aer', 'ignis'], color: '#ffff80' },
    { id: 'motus', name: 'Motus', components: ['aer', 'ordo'], color: '#cdcdf4' },
    { id: 'gelum', name: 'Gelum', components: ['ignis', 'perditio'], color: '#e1ffff' },
    { id: 'vitreus', name: 'Vitreus', components: ['terra', 'aer'], color: '#80ffff' },
    { id: 'metallum', name: 'Metallum', components: ['terra', 'ordo'], color: '#b5b5cd' },
    { id: 'victus', name: 'Victus', components: ['terra', 'aqua'], color: '#de0005' },
    { id: 'permutatio', name: 'Permutatio', components: ['perditio', 'ordo'], color: '#578357' },
    { id: 'potentia', name: 'Potentia', components: ['ordo', 'ignis'], color: '#c0ffff' },
    { id: 'volatus', name: 'Volatus', components: ['aer', 'motus'], color: '#e7e7d7' },
    { id: 'vinculum', name: 'Vinculum', components: ['motus', 'perditio'], color: '#9a0000' },
    { id: 'tenebrae', name: 'Tenebrae', components: ['vacuos', 'lux'], color: '#222222' },
    { id: 'mortuus', name: 'Mortuus', components: ['victus', 'perditio'], color: '#6a0005' },
    { id: 'herba', name: 'Herba', components: ['victus', 'terra'], color: '#01ac00' },
    { id: 'praecantatio', name: 'Praecantatio', components: ['potentia', 'aer'], color: '#cf00ff' },
    { id: 'instrumentum', name: 'Instrumentum', components: ['metallum', 'potentia'], color: '#4040ae' },
    { id: 'alienis', name: 'Alienis', components: ['vacuos', 'tenebrae'], color: '#804000' },
    { id: 'spiritus', name: 'Spiritus', components: ['victus', 'mortuus'], color: '#ebebfb' },
    { id: 'auram', name: 'Auram', components: ['praecantatio', 'aer'], color: '#ffc0ff' },
    { id: 'alkimia', name: 'Alkimia', components: ['praecantatio', 'aqua'], color: '#23ae1d' },
    { id: 'vitium', name: 'Vitium', components: ['perditio', 'praecantatio'], color: '#800080' },
    { id: 'fabrico', name: 'Fabrico', components: ['permutatio', 'instrumentum'], color: '#809d80' },
    { id: 'machina', name: 'Machina', components: ['motus', 'instrumentum'], color: '#8080a0' },
    { id: 'exanimis', name: 'Exanimis', components: ['motus', 'mortuus'], color: '#3a4000' },
    { id: 'bestia', name: 'Bestia', components: ['motus', 'victus'], color: '#9f6409' },
    { id: 'cognitio', name: 'Cognitio', components: ['ignis', 'spiritus'], color: '#ffc2bf' },
    { id: 'sensus', name: 'Sensus', components: ['aer', 'spiritus'], color: '#c0ff00' },
    { id: 'aversio', name: 'Aversio', components: ['spiritus', 'perditio'], color: '#c04f50' },
    { id: 'praemunio', name: 'Praemunio', components: ['spiritus', 'terra'], color: '#00c0c0' },
    { id: 'desiderium', name: 'Desiderium', components: ['spiritus', 'vacuos'], color: '#e6c284' },
    { id: 'humanus', name: 'Humanus', components: ['spiritus', 'victus'], color: '#ffd7c0' },
];

export const modAspects = {
    gtnh: [
        { id: 'electrum', name: 'Electrum', components: ['potentia', 'machina'], color: '#c0eeee' },
        { id: 'magneto', name: 'Magneto', components: ['metallum', 'iter'], color: '#c0c0c0' },
        { id: 'aequalitas', name: 'Aequalitas', components: ['cognitio', 'ordo'], color: '#eef0ea' },
        { id: 'vesania', name: 'Vesania', components: ['cognitio', 'vitium'], color: '#1b122c' },
        { id: 'primordium', name: 'Primordium', components: ['vacuos', 'motus'], color: '#f7f7db' },
        { id: 'astrum', name: 'Astrum', components: ['lux', 'primordium'], color: '#2d2c2b' },
        { id: 'gloria', name: 'Gloria', components: ['humanus', 'iter'], color: '#ffe980' },
        { id: 'nebrisum', name: 'Nebrisum', components: ['lucrum', 'perfodio'], color: '#eeee7e' },
        { id: 'radio', name: 'Radio', components: ['potentia', 'lux'], color: '#c0ffc0' },
        { id: 'strontio', name: 'Strontio', components: ['perditio', 'cognitio'], color: '#eec2b3' },
        { id: 'tempus', name: 'Tempus', components: ['vacuos', 'ordo'], color: '#b68cff' },
        { id: 'infernus', name: 'Infernus', components: ['ignis', 'praecantatio'], color: '#ff0000' },
        { id: 'luxuria', name: 'Luxuria', components: ['corpus', 'fames'], color: '#ffc1ce' },
        { id: 'desidia', name: 'Desidia', components: ['vinculum', 'spiritus'], color: '#6e6e6e' },
        { id: 'superbia', name: 'Superbia', components: ['volatus', 'vacuos'], color: '#9639ff' },
        { id: 'invidia', name: 'Invidia', components: ['sensus', 'fames'], color: '#00ba00' },
        { id: 'ira', name: 'Ira', components: ['telum', 'ignis'], color: '#870404' },
        { id: 'gula', name: 'Gula', components: ['fames', 'vacuos'], color: '#d59c46' },
        { id: 'caelum', name: 'Caelum', components: ['vitreus', 'metallum'], color: '#5e74cf' },
        { id: 'tabernus', name: 'Tabernus', components: ['tutamen', 'iter'], color: '#4c8569' },
        { id: 'terminus', name: 'Terminus', components: ['lucrum', 'alienis'], color: '#b90000' }
    ]
};

export class AspectDatabase {
    constructor() {
        this.aspects = new Map();
        this.enabledAspects = new Set();
        this.useMoreAspects = new Set();
        this.loadBaseAspects();
    }

    loadBaseAspects() {
        primalAspects.forEach(a => this.addAspect(a.id, a.name, [], true, false, true, a.color));
        standardCompounds.forEach(a => this.addAspect(a.id, a.name, a.components, false, false, true, a.color));
        
        for (const [modName, aspects] of Object.entries(modAspects)) {
            aspects.forEach(a => {
                this.addAspect(a.id, a.name, a.components, false, true, false, a.color);
                this.aspects.get(a.id).modName = modName; 
            });
        }
    }

    addAspect(id, name, components = [], isPrimal = false, isMod = false, defaultEnabled = true, color = '#ffffff') {
        if (!this.aspects.has(id)) {
            this.aspects.set(id, { id, name, components, isPrimal, isMod, tier: 1, color });
            if (defaultEnabled) {
                this.enabledAspects.add(id);
            }
        }
    }

    toggleAspect(id, enabled) {
        if (enabled) {
            this.enabledAspects.add(id);
        } else {
            this.enabledAspects.delete(id);
        }
    }

    toggleUseMore(id, useMore) {
        if (useMore) {
            this.useMoreAspects.add(id);
        } else {
            this.useMoreAspects.delete(id);
        }
    }

    getEnabledAspects() {
        return Array.from(this.aspects.values()).filter(a => this.enabledAspects.has(a.id));
    }

    getAspect(id) {
        return this.aspects.get(id);
    }
}
