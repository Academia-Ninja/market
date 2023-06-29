const productsForm = document.querySelector('#products-form');
const discountForm = document.querySelector('#discount-form');
const productsOl = document.querySelector('#products-list');
const coinInput = document.querySelectorAll('.coin');

const _data = {
  productsList: [],
  discountPercent: null,
};

function setProduct(event) {
  event.preventDefault();

  const productItem = {
    name: '',
    count: 1,
    price: 0.0,
  };

  const formControls = this.querySelectorAll('.form-control');

  formControls.forEach(({ name, value }) => {
    if (name == 'price') value = parseFloat(value.replaceAll('.', '').replace(',', '.'));
    if (name == 'count') value = parseInt(value);

    productItem[name] = value;
    productItem.id = Date.now();
  });
  _data.productsList.push(productItem);

  showProducts(_data.productsList);
  showSubtotal();
  showTotal();

  this.reset();

  disableSubmitButton(this);
}

function setDiscount(event) {
  event.preventDefault();

  const formControl = this.querySelector('.form-control');
  _data.discountPercent = parseInt(formControl.value);

  showTotal(_data.discountPercent);
  showDiscount(_data.discountPercent);

  this.reset();

  disableSubmitButton(this);
}

function showProducts(productsList) {
  let productsLi = '';

  productsList.forEach(({ name, price, count, id }) => {
    productsLi += `
        <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
                ${convertCoin(price)}                
            </div>
            <span class="badge bg-primary rounded-pill">${count}</span>  
            <span class="badge bg-danger rounded-pill mx-1" onclick="deleteProductItem(${id})">Remover item</span> 
        </li>
        `;
  });

  productsOl.innerHTML = productsLi;
}

function showSubtotal() {
  const subtotalSpan = document.querySelector('#subtotal');
  const subtotalValue = calcSubtotal();

  subtotalSpan.innerText = convertCoin(subtotalValue);
}

function showTotal(discountPercent = null) {
  const totalSpan = document.querySelector('#total');
  const totalValue = calcTotal(discountPercent);

  totalSpan.innerText = convertCoin(totalValue);
}

function showDiscount(discountPercent) {
  const discountSpan = document.querySelector('#discount');
  const discountValue = calcSubtotal() - calcTotal(discountPercent);

  discountSpan.innerText = convertCoin(discountValue);
}

function deleteProductItem(id) {
  const findItem = (item) => item.id === id;

  const productItem = _data.productsList.find(findItem);
  const productItemIndex = _data.productsList.findIndex(findItem);

  if (productItem.count == 1) _data.productsList.splice(productItemIndex);
  if (productItem.count > 1) productItem.count = --productItem.count;

  showProducts(_data.productsList);
  showSubtotal();
  showDiscount(_data.discountPercent);
  showTotal(_data.discountPercent);
}

function calcSubtotal() {
  return _data.productsList.reduce(
    (acc, product) => acc + product.price * product.count,
    0.0
  );
}

function calcTotal(discountPercent = null) {
  if (discountPercent)
    return (calcSubtotal() * (100 - discountPercent)) / 100;

  return calcSubtotal();
}

function toggleSubmitButton() {
  const formControls = this.querySelectorAll('.form-control');
  const requiredFields = [];

  formControls.forEach(({ value, required }) => {
    if (required) requiredFields.push({ value, required });
  });

  const emptyFields = requiredFields.filter(
    ({ value }) => value.trim() === ''
  );

  if (emptyFields.length == 0) enableSubmitButton(this)
  else disableSubmitButton(this)
}

function disableSubmitButton(form) {
  const submitButton = form.querySelector('button[type=submit]');
  submitButton.setAttribute('disabled', true);
}

function enableSubmitButton(form) {
  const submitButton = form.querySelector('button[type=submit]');
  submitButton.removeAttribute('disabled');
}

function toggleCoinMask(event) {
  let value = event.target.value.replace(/\D/g, '');
  value = (value / 100).toFixed(2) + '';
  value = value.replace('.', ',');
  value = value.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
  value = value.replace(/(\d)(\d{3}),/g, '$1.$2,');

  event.target.value = value;
}

function convertCoin(value) {
  return value.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
}

function registerEvents() {
  productsForm.addEventListener('submit', setProduct);
  discountForm.addEventListener('submit', setDiscount);

  productsForm.addEventListener('keyup', toggleSubmitButton);
  discountForm.addEventListener('keyup', toggleSubmitButton);

  coinInput.forEach((el) => el.addEventListener('keyup', toggleCoinMask));
}

window.addEventListener('load', registerEvents);
