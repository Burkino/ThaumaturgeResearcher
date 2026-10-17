import { candleColors, candleMaterials, optimizeInfusionStability, pillarOptions } from '../core/infusionStability.js';

const STORAGE_KEY = 'thaumcraft_researcher_stability_inventory';

export class InfusionStabilityUI {
    constructor() {
        this.measured = '';
        this.counts = this.loadCounts();
        this.total = document.getElementById('stability-total');
        this.plan = document.getElementById('stability-plan');
        this.comparison = document.getElementById('stability-comparison');
        this.measuredInput = document.getElementById('stability-measured');

        this.renderCandleInventory();
        this.renderLooseCandleInventory();
        this.renderOtherInventory();
        this.renderPillarInventory();

        this.measuredInput.addEventListener('input', () => {
            this.measured = this.measuredInput.value;
            this.save();
            this.update();
        });
        this.measuredInput.value = this.measured;
        this.update();
    }

    loadCounts() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
            this.measured = typeof saved.measured === 'string' ? saved.measured : '';
            return saved.counts && typeof saved.counts === 'object' ? saved.counts : {};
        } catch (error) {
            console.error('Could not load infusion stability inventory.', error);
            return {};
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ counts: this.counts, measured: this.measured }));
        } catch (error) {
            console.error('Could not save infusion stability inventory.', error);
            this.comparison.textContent = 'Could not save these values in this browser. The current calculation is still shown.';
        }
    }

    makeCountInput(id, label) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '9999';
        input.step = '1';
        input.inputMode = 'numeric';
        input.value = this.counts[id] ?? 0;
        input.setAttribute('aria-label', `${label} available`);
        input.addEventListener('input', () => {
            const parsed = Number.parseInt(input.value, 10);
            this.counts[id] = Number.isFinite(parsed) ? Math.min(9999, Math.max(0, parsed)) : 0;
            if (input.value !== '' && input.value !== String(this.counts[id])) {
                input.value = this.counts[id];
            }
            this.save();
            this.update();
        });
        return input;
    }

    renderCandleInventory() {
        const container = document.getElementById('stability-candle-inventory');
        for (const [materialIndex, material] of candleMaterials.entries()) {
            const details = document.createElement('details');
            details.className = 'stability-material';
            details.open = materialIndex === 0;

            const summary = document.createElement('summary');
            summary.textContent = `${material.name} Candle Holders (+${material.pairValue.toFixed(2)} per pair before diminishing returns)`;
            details.append(summary);

            const table = document.createElement('table');
            table.className = 'stability-count-table';
            table.innerHTML = '<thead><tr><th scope="col">Candle color</th><th scope="col">Available</th></tr></thead>';
            const body = document.createElement('tbody');
            for (const [colorId, colorName] of candleColors) {
                const row = document.createElement('tr');
                const label = document.createElement('th');
                label.scope = 'row';
                label.textContent = colorName;
                const cell = document.createElement('td');
                cell.append(this.makeCountInput(`candle:${material.id}:${colorId}`, `${material.name} candle holder with ${colorName} candle`));
                row.append(label, cell);
                body.append(row);
            }
            table.append(body);
            details.append(table);
            container.append(details);
        }
    }

    renderLooseCandleInventory() {
        const container = document.getElementById('stability-loose-candle-inventory');
        const details = document.createElement('details');
        details.className = 'stability-material';
        details.open = true;

        const summary = document.createElement('summary');
        summary.textContent = 'Standalone Tallow Candles (+0.10 per matched pair before diminishing returns)';
        details.append(summary);

        const table = document.createElement('table');
        table.className = 'stability-count-table';
        table.innerHTML = '<thead><tr><th scope="col">Candle color</th><th scope="col">Available</th></tr></thead>';
        const body = document.createElement('tbody');
        for (const [colorId, colorName] of candleColors) {
            const row = document.createElement('tr');
            const label = document.createElement('th');
            label.scope = 'row';
            label.textContent = colorName;
            const cell = document.createElement('td');
            cell.append(this.makeCountInput(`candle:loose:${colorId}`, `${colorName} standalone Tallow Candle`));
            row.append(label, cell);
            body.append(row);
        }
        table.append(body);
        details.append(table);
        container.append(details);
    }

    renderOtherInventory() {
        const container = document.getElementById('stability-other-inventory');
        const table = document.createElement('table');
        table.className = 'stability-count-table';
        table.innerHTML = '<thead><tr><th scope="col">Other stabiliser</th><th scope="col">Available</th></tr></thead>';
        const body = document.createElement('tbody');
        const items = [
            ['skulls', 'Vanilla skulls/heads (+0.10 per pair before diminishing returns)'],
            ['inlays', 'Infusion Inlays (+0.025 per pair before diminishing returns)'],
        ];
        for (const [id, labelText] of items) {
            const row = document.createElement('tr');
            const label = document.createElement('th');
            label.scope = 'row';
            label.textContent = labelText;
            const cell = document.createElement('td');
            cell.append(this.makeCountInput(id, labelText));
            row.append(label, cell);
            body.append(row);
        }
        table.append(body);
        container.append(table);
    }

    renderPillarInventory() {
        const container = document.getElementById('stability-pillar-inventory');
        const table = document.createElement('table');
        table.className = 'stability-count-table';
        table.innerHTML = '<thead><tr><th scope="col">Pillar type</th><th scope="col">Available</th><th scope="col">Gain / cycle</th></tr></thead>';
        const body = document.createElement('tbody');
        for (const option of pillarOptions) {
            const row = document.createElement('tr');
            const label = document.createElement('th');
            label.scope = 'row';
            label.textContent = option.name;
            const count = document.createElement('td');
            count.append(this.makeCountInput(`pillar:${option.id}`, option.name));
            const gain = document.createElement('td');
            gain.textContent = `${option.stability > 0 ? '+' : ''}${option.stability.toFixed(2)}`;
            row.append(label, count, gain);
            body.append(row);
        }
        table.append(body);
        container.append(table);
    }

    update() {
        const result = optimizeInfusionStability(this.counts);
        this.total.textContent = `${result.total >= 0 ? '+' : ''}${result.total.toFixed(3)}`;

        const lines = [];
        if (result.pillar) {
            lines.push(`${result.pillar.name}: ${result.pillar.stability >= 0 ? '+' : ''}${result.pillar.stability.toFixed(2)} per cycle.`);
        } else {
            lines.push('No complete matching set of four pillars entered; the altar structure is incomplete.');
        }
        if (result.plan.length === 0) {
            lines.push('Enter the stabilisers you have to see the recommended mirrored pairs.');
        } else {
            for (const item of result.plan) {
                lines.push(`${Math.floor(item.pairs)} mirrored pair${item.pairs === 1 ? '' : 's'} of ${item.name}: +${item.value.toFixed(3)}.`);
            }
        }
        const oddItems = result.unusedOddItems.reduce((sum, item) => sum + item.count, 0);
        if (oddItems > 0) {
            lines.push(`${oddItems} unmatched stabiliser item${oddItems === 1 ? '' : 's'} cannot form a pair and are not counted.`);
        }
        this.plan.replaceChildren(...lines.map(text => {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            return paragraph;
        }));

        const measured = Number.parseFloat(this.measured);
        if (this.measured.trim() && Number.isFinite(measured)) {
            const difference = measured - result.total;
            if (Math.abs(difference) < 0.0005) {
                this.comparison.textContent = 'The in-game readout matches this estimate to three decimal places.';
                return;
            }
            const sign = difference > 0 ? '+' : '';
            this.comparison.textContent = `In-game readout is ${sign}${difference.toFixed(3)} ${difference < 0 ? 'below' : 'above'} this optimized estimate. A positive difference can indicate additional stabilisers or pack changes; a negative difference can mean the entered blocks are not arranged as matching pairs.`;
        } else {
            this.comparison.textContent = 'Enter the matrix readout to compare it with this estimate.';
        }
    }
}
