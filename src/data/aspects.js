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

export class AspectDatabase {
    constructor() {
        this.aspects = new Map();
        this.enabledAspects = new Set();
        this.useMoreAspects = new Set();
        this.loadBaseAspects();
    }

    loadBaseAspects() {
        primalAspects.forEach(a => this.addAspect(a.id, a.name, [], true, a.color));
        standardCompounds.forEach(a => this.addAspect(a.id, a.name, a.components, false, a.color));
    }

    addAspect(id, name, components = [], isPrimal = false, color = '#ffffff') {
        if (!this.aspects.has(id)) {
            this.aspects.set(id, { id, name, components, isPrimal, tier: 1, color });
            this.enabledAspects.add(id);
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
