import { AspectDatabase } from './data/aspects.js';
import { AspectListUI } from './ui/aspectList.js';
import { HexGrid } from './core/grid.js';
import { GridRenderer } from './ui/gridRenderer.js';
import { AspectGraph } from './core/graph.js';
import { Solver } from './core/solver.js';
import { parseResearchNoteString } from './core/researchNoteParser.js';
import { InfusionStabilityUI } from './ui/infusionStability.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Database
    const db = new AspectDatabase();

    // -- State Persistence --
    window.saveAppConfig = () => {
        const config = {
            enabledAspects: Array.from(db.enabledAspects),
            useMoreAspects: Array.from(db.useMoreAspects),
            gridSize: currentRadius,
            compactMode: !!db.compactMode
        };
        localStorage.setItem('thaumcraft_researcher_config', JSON.stringify(config));
    };

    let currentRadius = 3;
    const savedConfigStr = localStorage.getItem('thaumcraft_researcher_config');
    if (savedConfigStr) {
        try {
            const config = JSON.parse(savedConfigStr);
            if (config.gridSize) currentRadius = config.gridSize;
            if (config.enabledAspects) {
                db.enabledAspects.clear();
                config.enabledAspects
                    .filter(id => db.getAspect(id))
                    .forEach(id => db.enabledAspects.add(id));
            }
            if (config.useMoreAspects) {
                db.useMoreAspects.clear();
                config.useMoreAspects
                    .filter(id => db.getAspect(id))
                    .forEach(id => db.useMoreAspects.add(id));
            }
            db.compactMode = !!config.compactMode;
        } catch (e) {
            console.error("Failed to load config", e);
        }
    }

    // 2. Initialize UI for Aspect List
    const aspectListUI = new AspectListUI(db, 'aspect-list', (aspectId) => {
        gridRenderer.selectedAspectId = aspectId;
    });

    // 3. Initialize Grid and Renderer
    let grid = new HexGrid(currentRadius);
    let gridRenderer = new GridRenderer(grid, 'grid-container', db);
    new InfusionStabilityUI();

    const app = document.getElementById('app');
    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const pageId = tab.dataset.page;
            document.querySelectorAll('.tool-page').forEach(page => {
                page.hidden = page.id !== pageId;
            });
            document.querySelectorAll('.tool-tab').forEach(button => {
                const active = button === tab;
                button.classList.toggle('active', active);
                if (active) {
                    button.setAttribute('aria-current', 'page');
                } else {
                    button.removeAttribute('aria-current');
                }
            });
            app.classList.toggle('stability-active', pageId === 'stability-page');
        });
    });

    // Tapping anywhere that isn't an aspect (to select) or a hex (to place)
    // cancels the pending placement, so a stray tap can't drop an aspect later.
    document.addEventListener('click', (e) => {
        if (!gridRenderer.selectedAspectId) return;
        if (e.target.closest('.aspect-item') || e.target.closest('.hex')) return;
        gridRenderer.selectedAspectId = null;
        aspectListUI.clearSelection();
    });

    // 5. Reset Button
    const btnReset = document.getElementById('btn-reset');
    btnReset.addEventListener('click', () => {
        if (!confirm("Reset all changes? This will clear enabled/disabled aspects and grid size back to defaults.")) return;
        localStorage.removeItem('thaumcraft_researcher_config');
        location.reload();
    });

    // 6. Grid Size Selector
    const gridSizeSelect = document.getElementById('grid-size');
    gridSizeSelect.value = currentRadius;
    gridSizeSelect.addEventListener('change', (e) => {
        currentRadius = parseInt(e.target.value, 10);
        if (window.saveAppConfig) window.saveAppConfig();
        grid = new HexGrid(currentRadius);
        gridRenderer.grid = grid; // update ref
        gridRenderer.render();
    });

    const applyResearchNote = (input) => {
        const note = parseResearchNoteString(input);
        const importedCells = note.cells.map(cell => {
            if (cell.type === 0) return { ...cell, aspectId: null };

            const aspectId = cell.aspect.split(':').pop();
            if (!db.getAspect(aspectId)) {
                throw new Error(`Aspect "${cell.aspect}" is not available in this aspect library.`);
            }
            return { ...cell, aspectId };
        });

        currentRadius = note.radius;
        gridSizeSelect.value = currentRadius;
        grid = new HexGrid(currentRadius);
        gridRenderer.grid = grid;

        const importedCoordinates = new Set();
        importedCells.forEach(cell => {
            importedCoordinates.add(`${cell.q},${cell.r}`);
            if (cell.type === 0) {
                grid.setHexState(cell.q, cell.r, 'active_empty');
                return;
            }

            db.toggleAspect(cell.aspectId, true);
            grid.setHexState(cell.q, cell.r, 'has_aspect', cell.aspectId);
            const gridCell = grid.getHex(cell.q, cell.r);
            gridCell.isEndpoint = cell.type === 1;
        });
        grid.getAllHexes().forEach(cell => {
            if (!importedCoordinates.has(`${cell.q},${cell.r}`)) {
                grid.setHexState(cell.q, cell.r, 'inactive');
            }
        });

        gridRenderer.selectedAspectId = null;
        aspectListUI.clearSelection();
        aspectListUI.render();
        gridRenderer.render();
    };

    const researchNoteInput = document.getElementById('research-note-input');
    const researchNoteStatus = document.getElementById('research-note-status');
    document.getElementById('btn-import-note').addEventListener('click', () => {
        try {
            applyResearchNote(researchNoteInput.value);
            researchNoteStatus.textContent = 'Research note imported.';
            researchNoteStatus.classList.remove('error');
            researchNoteStatus.classList.add('success');
        } catch (error) {
            researchNoteStatus.textContent = error.message;
            researchNoteStatus.classList.remove('success');
            researchNoteStatus.classList.add('error');
        }
    });

    // 7. Reset Hexes Button
    const btnResetHexes = document.getElementById('btn-reset-hexes');
    btnResetHexes.addEventListener('click', () => {
        grid = new HexGrid(currentRadius);
        gridRenderer.grid = grid; // update ref
        gridRenderer.selectedAspectId = null;
        aspectListUI.clearSelection();
        gridRenderer.render();
    });

    // 8. Solver Integration
    const runSolver = () => {
        // Clear paths visually and from the model BEFORE solving
        gridRenderer.clearPaths();

        const graph = new AspectGraph(db);
        const solver = new Solver(grid, graph);

        const paths = solver.solve();
        if (paths && paths.length > 0) {
            gridRenderer.drawPaths(paths);
        } else {
            alert("No valid path could be found to connect all endpoints with the currently enabled aspects!");
        }
    };

    document.getElementById('btn-research').addEventListener('click', runSolver);
    document.getElementById('btn-research-2').addEventListener('click', runSolver);

    // 9. How to Use Collapse Toggle
    const rightSidebar = document.getElementById('right-sidebar');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');

    if (localStorage.getItem('thaumcraft_researcher_sidebar_collapsed') === 'true') {
        // Suppress the transition for this initial, load-time state change --
        // only user-triggered toggles afterward should animate.
        rightSidebar.classList.add('no-transition');
        rightSidebar.classList.add('collapsed');
        btnToggleSidebar.textContent = '▶';
        void rightSidebar.offsetWidth; // force layout so the instant state applies before re-enabling transitions
        rightSidebar.classList.remove('no-transition');
    }

    btnToggleSidebar.addEventListener('click', () => {
        const collapsed = rightSidebar.classList.toggle('collapsed');
        btnToggleSidebar.textContent = collapsed ? '▶' : '◀';
        localStorage.setItem('thaumcraft_researcher_sidebar_collapsed', collapsed);
    });
});
