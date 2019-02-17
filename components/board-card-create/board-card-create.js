const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background-color: #F8F9F9;
      color: #333333;
      box-shadow: 0 0 6px 0 rgba(0,0,0,0.40);
      border-radius: 4px;
    }

    .container {
      padding: 8px;
    }

    .card-title-edit {
      margin-bottom: 8px;
      width: 100%;
      box-sizing: border-box;
    }

    .card-title-edit-error {
      margin-bottom: 8px;
    }

    .card-description-edit {
      margin-bottom: 8px;
      width: 100%;
      box-sizing: border-box;
    }
  </style>

  <div class="container">
    <div class="card-add">+ Add card</div>
    <div class="card-edit">
      <input class="card-title-edit" type="text" name="title"></input>
      <div class="card-title-edit-error">Title should not repeat</div>
      <textarea class="card-description-edit"></textarea>
      <div id="button-container">
        <button id="cancel-button">Cancel</button>
        <button id="save-button">Save</button>
      </div>
    </div>
  </div>
`;

class BoardCardCreate extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ 'mode': 'open' });
  }

  connectedCallback() {
    this._root.appendChild(template.content.cloneNode(true));
    this.$cardAdd = this._root.querySelector('.card-add');
    this.$cardEdit = this._root.querySelector('.card-edit');
    this.$cardTitleEdit = this._root.querySelector('.card-title-edit');
    this.$cardTitleEditError = this._root.querySelector('.card-title-edit-error');
    this.$cardDescriptionEdit = this._root.querySelector('.card-description-edit');
    this.$cancelButton = this._root.querySelector('#cancel-button');
    this.$saveButton = this._root.querySelector('#save-button');

    this._render();

    this.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleEditMode();
    });
    this.$cardTitleEdit.addEventListener('input', (e) => {
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
    return ['all-cards'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'all-cards':
        this._allCards = JSON.parse(newValue);
        break;
      default:
        break;
    }
  }

  _render() {
    this._editMode = false;
    this.$cardAdd.hidden = false;
    this.$cardEdit.hidden = true;
    this.$cardTitleEdit.value = '';
    this.$cardDescriptionEdit.value = '';
    this.$cardTitleEditError.hidden = true;
  }

  get repeatTitle() {
    return this._allCards
      .map(item => item.title)
      .includes(this.$cardTitleEdit.value);
  }

  toggleEditMode() {
    if (this._editMode) return;
    this.$cardAdd.hidden = true;
    this.$cardEdit.hidden = false;
  }

  toggleEditError() {
    this.$cardTitleEditError.hidden = !this.repeatTitle;
  }

  onCancel() {
    this._render();
  }

  onSave() {
    if (this.repeatTitle) return;
    this.dispatchEvent(new CustomEvent('onCardCreate', {
      detail: {
        title: this.$cardTitleEdit.value,
        description: this.$cardDescriptionEdit.value,
      }
    }));
  }

}

window.customElements.define('board-card-create', BoardCardCreate);