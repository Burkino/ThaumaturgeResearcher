class SnbtParser {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    parse() {
        const value = this.parseCompound();
        this.skipWhitespace();
        if (this.position !== this.input.length) {
            this.fail('Unexpected content after research note data');
        }
        return value;
    }

    parseCompound() {
        this.expect('{');
        const compound = {};
        this.skipWhitespace();

        while (!this.consume('}')) {
            const key = this.parseKey();
            this.expect(':');
            if (Object.hasOwn(compound, key)) this.fail(`Duplicate key "${key}"`);
            compound[key] = this.parseValue();
            this.skipWhitespace();
            if (this.consume('}')) break;
            this.expect(',');
            this.skipWhitespace();
        }

        return compound;
    }

    parseList() {
        this.expect('[');
        const list = [];
        this.skipWhitespace();

        while (!this.consume(']')) {
            list.push(this.parseValue());
            this.skipWhitespace();
            if (this.consume(']')) break;
            this.expect(',');
            this.skipWhitespace();
        }

        return list;
    }

    parseValue() {
        this.skipWhitespace();
        const char = this.input[this.position];
        if (char === '{') return this.parseCompound();
        if (char === '[') return this.parseList();
        if (char === '"' || char === "'") return this.parseQuotedString();
        return this.parseBareValue();
    }

    parseKey() {
        this.skipWhitespace();
        const char = this.input[this.position];
        if (char === '"' || char === "'") return this.parseQuotedString();

        const start = this.position;
        while (this.position < this.input.length && !/[\s:]/.test(this.input[this.position])) {
            this.position++;
        }
        if (start === this.position) this.fail('Expected a compound key');
        return this.input.slice(start, this.position);
    }

    parseQuotedString() {
        const quote = this.input[this.position++];
        let result = '';

        while (this.position < this.input.length) {
            const char = this.input[this.position++];
            if (char === quote) return result;
            if (char === '\\') {
                if (this.position >= this.input.length) this.fail('Unterminated escape sequence');
                const escaped = this.input[this.position++];
                result += escaped === 'n' ? '\n' : escaped === 'r' ? '\r' : escaped === 't' ? '\t' : escaped;
            } else {
                result += char;
            }
        }

        this.fail('Unterminated quoted string');
    }

    parseBareValue() {
        const start = this.position;
        while (this.position < this.input.length && !/[\s,\]}]/.test(this.input[this.position])) {
            this.position++;
        }
        if (start === this.position) this.fail('Expected a value');
        const value = this.input.slice(start, this.position);
        if (/^-?\d+$/.test(value)) return Number(value);
        return value;
    }

    expect(char) {
        this.skipWhitespace();
        if (!this.consume(char)) this.fail(`Expected "${char}"`);
    }

    consume(char) {
        if (this.input[this.position] !== char) return false;
        this.position++;
        return true;
    }

    skipWhitespace() {
        while (/\s/.test(this.input[this.position] || '')) this.position++;
    }

    fail(message) {
        throw new Error(`${message} at character ${this.position + 1}`);
    }
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function parseResearchNoteString(input) {
    if (typeof input !== 'string' || !input.trim()) {
        throw new Error('Paste a research-note item string first.');
    }

    let source = input.trim();
    if ((source.startsWith("'") && source.endsWith("'")) || (source.startsWith('"') && source.endsWith('"'))) {
        source = source.slice(1, -1).trim();
    }

    const bracketIndex = source.indexOf('[');
    if (bracketIndex < 1 || !source.endsWith(']')) {
        throw new Error('Expected an item string with a research-note component in square brackets.');
    }

    const itemId = source.slice(0, bracketIndex).trim();
    if (!/(^|:)research_note$/.test(itemId)) {
        throw new Error('The item must be a research_note.');
    }

    const componentStart = bracketIndex + 1;
    const equalsIndex = source.indexOf('=', componentStart);
    if (equalsIndex < 0) throw new Error('Expected research-note component data after "=".');
    const componentId = source.slice(componentStart, equalsIndex).trim();
    if (!/(^|:)research_note$/.test(componentId)) {
        throw new Error('The item is missing its research_note data component.');
    }

    const componentData = new SnbtParser(source.slice(equalsIndex + 1, -1)).parse();
    if (!Array.isArray(componentData.cells) || componentData.cells.length === 0) {
        throw new Error('Research-note data must contain at least one cell.');
    }

    const seenCoordinates = new Set();
    let radius = 0;
    const cells = componentData.cells.map((cell, index) => {
        if (!isRecord(cell) || !isRecord(cell.hex)) {
            throw new Error(`Cell ${index + 1} must contain a hex coordinate.`);
        }

        const { q, r } = cell.hex;
        if (!Number.isSafeInteger(q) || !Number.isSafeInteger(r)) {
            throw new Error(`Cell ${index + 1} has invalid q/r coordinates.`);
        }
        const coordinate = `${q},${r}`;
        if (seenCoordinates.has(coordinate)) {
            throw new Error(`Cell ${index + 1} duplicates coordinate ${coordinate}.`);
        }
        seenCoordinates.add(coordinate);

        if (![0, 1, 2].includes(cell.type)) {
            throw new Error(`Cell ${index + 1} has unsupported type "${cell.type}".`);
        }

        const aspect = cell.aspect;
        if (cell.type > 0 && typeof aspect !== 'string') {
            throw new Error(`Cell ${index + 1} needs an aspect for type ${cell.type}.`);
        }
        if (aspect !== undefined && typeof aspect !== 'string') {
            throw new Error(`Cell ${index + 1} has an invalid aspect identifier.`);
        }

        radius = Math.max(radius, Math.abs(q), Math.abs(r), Math.abs(q + r));
        return { q, r, type: cell.type, aspect };
    });

    if (radius < 2 || radius > 5) {
        throw new Error(`The note grid radius (${radius}) is outside the supported range of 2 to 5.`);
    }

    return { radius, cells };
}
