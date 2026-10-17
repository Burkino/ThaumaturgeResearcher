export class AspectListUI {
    constructor(db, containerId, onAspectSelected = null) {
        this.db = db;
        this.container = document.getElementById(containerId);
        this.onAspectSelected = onAspectSelected;
        this.searchQuery = '';
        this.currentEditAspectId = null;
        this.selectedAspectId = null;
        this.setupSearch();
        this.setupModal();
        this.setupCompactToggle();
        this.render();
    }

    clearSelection() {
        if (this.selectedAspectId === null) return;
        this.selectedAspectId = null;
        this.render();
    }

    setupModal() {
        const modal = document.getElementById('edit-formula-modal');
        const cancelBtn = document.getElementById('cancel-formula-btn');
        const saveBtn = document.getElementById('save-formula-btn');

        if (!modal) return;

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.currentEditAspectId = null;
        });

        saveBtn.addEventListener('click', () => {
            if (!this.currentEditAspectId) return;
            const p1 = document.getElementById('edit-formula-parent1').value;
            const p2 = document.getElementById('edit-formula-parent2').value;
            
            if (p1 && p2) {
                const aspect = this.db.getAspect(this.currentEditAspectId);
                if (aspect) {
                    aspect.components = [p1, p2];
                    this.render();
                }
            }
            modal.style.display = 'none';
            this.currentEditAspectId = null;
        });
    }

    setupCompactToggle() {
        const compactToggle = document.getElementById('compact-mode');
        if (!compactToggle) return;
        compactToggle.checked = !!this.db.compactMode;
        compactToggle.addEventListener('change', (e) => {
            this.db.compactMode = e.target.checked;
            if (window.saveAppConfig) window.saveAppConfig();
            this.render();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('aspect-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.render();
            });
        }
    }

    openEditModal(aspect) {
        this.currentEditAspectId = aspect.id;
        const modal = document.getElementById('edit-formula-modal');
        const nameSpan = document.getElementById('edit-formula-aspect-name');
        const p1Select = document.getElementById('edit-formula-parent1');
        const p2Select = document.getElementById('edit-formula-parent2');

        nameSpan.textContent = aspect.name;
        
        p1Select.innerHTML = '';
        p2Select.innerHTML = '';
        
        const allAspects = Array.from(this.db.aspects.values())
            .sort((a, b) => a.name.localeCompare(b.name));

        allAspects.forEach(a => {
            if (a.id === aspect.id) return;
            const opt1 = document.createElement('option');
            opt1.value = a.id;
            opt1.textContent = a.name;
            if (aspect.components[0] === a.id) opt1.selected = true;
            p1Select.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = a.id;
            opt2.textContent = a.name;
            if (aspect.components[1] === a.id) opt2.selected = true;
            p2Select.appendChild(opt2);
        });

        modal.style.display = 'flex';
    }

    render() {
        this.container.classList.toggle('compact-mode', !!this.db.compactMode);
        this.container.innerHTML = '';
        const aspects = Array.from(this.db.aspects.values()).filter(a => {
            if (!this.searchQuery) return true;
            return a.name.toLowerCase().includes(this.searchQuery) || a.id.toLowerCase().includes(this.searchQuery);
        });

        // Group aspects into categories
        const categories = { 'Primals': [], 'Compounds': [] };

        aspects.forEach(a => {
            if (a.isPrimal) {
                categories['Primals'].push(a);
            } else {
                categories['Compounds'].push(a);
            }
        });

        // Sort within categories alphabetically
        Object.values(categories).forEach(list => {
            list.sort((a, b) => a.name.localeCompare(b.name));
        });

        const renderGroup = (title, list) => {
            if (list.length === 0) return;
            
            const header = document.createElement('h4');
            header.className = 'aspect-category-header';
            header.innerText = title;
            header.style.marginTop = '15px';
            header.style.marginBottom = '5px';
            header.style.color = 'var(--primary-color)';
            header.style.borderBottom = '1px solid var(--panel-border)';
            this.container.appendChild(header);

            list.forEach(aspect => {
                const item = document.createElement('div');
                item.className = 'aspect-item aspect-draggable';
                if (this.selectedAspectId === aspect.id) {
                    item.classList.add('selected');
                }
                item.setAttribute('draggable', 'true');
                item.dataset.id = aspect.id;

                const isEnabled = this.db.enabledAspects.has(aspect.id);
                const isUseMore = this.db.useMoreAspects.has(aspect.id);

                const imageUrl = `./assets/aspects/${aspect.id}.png?v=9`;
                const iconHtml = `<div class="aspect-icon color-mask" style="-webkit-mask-image: url('${imageUrl}'); mask-image: url('${imageUrl}'); background-color: ${aspect.color};"></div>`;

                item.innerHTML = `
                    <div class="aspect-item-header">
                        <input type="checkbox" class="aspect-enable" data-id="${aspect.id}" ${isEnabled ? 'checked' : ''} title="Enable/Disable">
                        <div class="aspect-title ${aspect.isPrimal ? 'aspect-tier-primal' : 'aspect-tier-compound'}">
                            ${iconHtml}
                            <span>${aspect.name}</span>
                        </div>
                        ${!aspect.isPrimal ? `<button class="edit-formula-btn" data-id="${aspect.id}" title="Edit Formula">⚙️</button>` : ''}
                    </div>
                    <div class="aspect-item-controls">
                        <label title="Prefer using this aspect when solving">
                            <input type="checkbox" class="aspect-use-more" data-id="${aspect.id}" ${isUseMore ? 'checked' : ''}> Use More
                        </label>
                        <span class="aspect-formula" id="formula-${aspect.id}">
                            ${aspect.components.length > 0 ? `(${aspect.components[0]} + ${aspect.components[1]})` : '(Primal)'}
                        </span>
                    </div>
                `;

                this.container.appendChild(item);

                // Select aspect on click (for mobile tap-to-place)
                item.addEventListener('click', (e) => {
                    // Ignore clicks on buttons/checkboxes
                    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
                    
                    this.selectedAspectId = aspect.id;
                    this.render(); // Re-render to show selected state
                    if (this.onAspectSelected) {
                        this.onAspectSelected(aspect.id);
                    }
                });

                // Drag event
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', aspect.id);
                    e.dataTransfer.effectAllowed = 'copy';
                });

                // Checkbox events
                const enableCb = item.querySelector('.aspect-enable');
                enableCb.addEventListener('change', (e) => {
                    this.db.toggleAspect(aspect.id, e.target.checked);
                    if (window.saveAppConfig) window.saveAppConfig();
                });

                const useMoreCb = item.querySelector('.aspect-use-more');
                useMoreCb.addEventListener('change', (e) => {
                    this.db.toggleUseMore(aspect.id, e.target.checked);
                    if (window.saveAppConfig) window.saveAppConfig();
                });

                // Edit formula
                const editBtn = item.querySelector('.edit-formula-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        this.openEditModal(aspect);
                    });
                }

                // Tooltip (only on devices with a real mouse -- touch fires a
                // synthetic mouseenter with no matching mouseleave, so it
                // would otherwise get stuck on screen after a tap)
                if (!window.matchMedia('(hover: hover)').matches) {
                    return;
                }

                item.addEventListener('mouseenter', (e) => {
                    const tooltip = document.getElementById('aspect-tooltip');
                    if (!tooltip) return;
                    
                    let html = '';
                    if (aspect.isPrimal) {
                        html = `<span>${aspect.name} (Primal)</span>`;
                    } else {
                        const p1 = this.db.getAspect(aspect.components[0]);
                        const p2 = this.db.getAspect(aspect.components[1]);
                        
                        const renderIcon = (a) => {
                            if (!a) return `<span>?</span>`;
                            const url = `./assets/aspects/${a.id}.png?v=9`;
                            return `<div class="color-mask" style="-webkit-mask-image: url('${url}'); mask-image: url('${url}'); background-color: ${a.color}; width: 24px; height: 24px; display: inline-block; vertical-align: middle;"></div>`;
                        };
                        
                        html = `
                            ${renderIcon(p1)} <span>+</span> ${renderIcon(p2)} <span>=</span>
                            ${renderIcon(aspect)} <span>${aspect.name}</span>
                        `;
                    }
                    
                    tooltip.innerHTML = html;
                    tooltip.style.display = 'flex';
                });

                item.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('aspect-tooltip');
                    if (tooltip && tooltip.style.display !== 'none') {
                        tooltip.style.left = (e.clientX + 15) + 'px';
                        tooltip.style.top = (e.clientY + 15) + 'px';
                    }
                });

                item.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById('aspect-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
            });
        };

        renderGroup('Primals', categories['Primals']);
        renderGroup('Compounds', categories['Compounds']);

        // Save state on any change that triggers a re-render
        if (window.saveAppConfig) window.saveAppConfig();
    }

}
