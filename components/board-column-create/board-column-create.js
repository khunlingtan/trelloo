const template = document.createElement('template');
template.innerHTML = `
  <link rel="stylesheet" href="../../styles/normalize.css">
  <link rel="stylesheet" href="../../styles/input-text.css">
  <link rel="stylesheet" href="../../styles/primary-button.css">
  <style>
    :host {
      display: block;
      width: 340px;
      background-color: #edeff0;
      box-shadow: 0 0 6px 0 rgba(0,0,0,0.40);
      padding: 8px;
      border-radius: 4px;
      height: fit-content;
      cursor: pointer;
    }

    .container {
      padding: 8px;
    }

    .column-title-edit {
      width: 100%;
      box-sizing: border-box;
    }

    .column-title-edit-error {
      color: #ff0000;
      font-size: 12px;
    }

    #button-container {
      margin-top: 8px;
    }
  </style>

  <div class="container">
    <div class="column-add">+ Add Column</div>
    <div class="column-edit">
      <input class="column-title-edit" type="text" name="title" name="title" placeholder="Title"></input>
      <div class="column-title-edit-error"></div>
      <div id="button-container">
        <button id="cancel-button" class="primary-button">Cancel</button>
        <button id="save-button" class="primary-button">Save</button>
      </div>
    </div>
  </div>
`;

class BoardColumnCreate extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$columnAdd = this._root.querySelector('.column-add');
    this.$columnEdit = this._root.querySelector('.column-edit');
    this.$columnTitleEdit = this._root.querySelector('.column-title-edit');
    this.$columnTitleEditError = this._root.querySelector('.column-title-edit-error');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEditMode();
    });
    this.$columnTitleEdit.addEventListener('input', (e) => {
      e.preventDefault();
      this.toggleEditError();
    });
    this.$cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onCancel();
    });
    this.$saveButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onSave();
    });
    document.addEventListener('click', (e) => {
      if (!this._root.contains(e.path[0])) {
        this._render();
      }
    })
  }

  static get observedAttributes() {
    return ['all-columns'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'all-columns':
        this._allColumns = JSON.parse(newValue);
        break;
      default:
        break;
    }
  }

  _render() {
    this._editMode = false;
    this.$columnAdd.hidden = false;
    this.$columnEdit.hidden = true;
    this.$columnTitleEdit.value = '';
    this.$columnTitleEditError.hidden = true;
  }

  get repeatTitle() {
    return this._allColumns
      .map(item => item.title)
      .includes(this.$columnTitleEdit.value);
  }

  toggleEditMode() {
    if (this._editMode) return;
    this.$columnAdd.hidden = true;
    this.$columnEdit.hidden = false;
  }

  toggleEditError() {
    if (this.repeatTitle) {
      this.$columnTitleEditError.hidden = false;
      this.$columnTitleEditError.textContent = 'Title should not repeat';
    } else if (!this.$columnTitleEdit.value) {
      this.$columnTitleEditError.hidden = false;
      this.$columnTitleEditError.textContent = 'Title is required';
    } else {
      this.$columnTitleEditError.hidden = true;
    }
  }

  onCancel() {
    this._render();
  }

  onSave() {
    this.toggleEditError();
    if (this.repeatTitle || !this.$columnTitleEdit.value) return;
    this.dispatchEvent(new CustomEvent('onCreateColumn', {
      detail: {
        title: this.$columnTitleEdit.value
      }
    }));
  }

}

window.customElements.define('board-column-create', BoardColumnCreate);