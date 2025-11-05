function Item(name, majorCategory, middleCategory, minorCategory, releaseDate, price, nation, status, isCollected, remarks, imageUrl) {
  this.name = name;
  this.majorCategory = majorCategory;
  this.middleCategory = middleCategory;
  this.minorCategory = minorCategory;
  this.releaseDate = releaseDate;
  this.price = price;
  this.nation = nation;
  this.status = status;
  this.isCollected = isCollected;
  this.remarks = remarks;
  this.imageUrl = imageUrl;
};

var itemList = arr.map(item => new Item(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9], item[10]));

const selectElement = document.getElementById('for');
const selectSortElement = document.getElementById('selectSort');
const isCollectedCheckbox = document.getElementById('isCollectedCheckbox');
const statusCheckbox = document.getElementById('statusCheckbox');
const searchBox = document.getElementById('searchBox');
const resultsContainer = document.getElementById('results');
const count = document.getElementById('count');

var selectedOptions;
var majorCategory;
var middleCategory;
var minorCategory;
var filteredData;
var keyword;

function filterAndDisplay() {
  filteredData = itemList;
  keyword = searchBox.value.trim();
  if (keyword.length > 0) {
    filteredData = filteredData.filter(item => item.name.includes(keyword));
  }
  selectedOptions = Array.from(selectElement.options).filter(option => option.selected);
  majorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'majorCategory').map(item => item.value);
  middleCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'middleCategory').map(item => item.value);
  minorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'minorCategory').map(item => item.value);
  filteredData = filteredData.filter(item => majorCategory.includes(item.majorCategory) || middleCategory.includes(item.middleCategory) || minorCategory.includes(item.minorCategory));

  if (isCollectedCheckbox.checked) {
    filteredData = filteredData.filter(item => item.isCollected === 'Y');
  }

  if (statusCheckbox.checked) {
    filteredData = filteredData.filter(item => item.status === '미개봉');
  }

  switch (selectSortElement.value) {
    case 'releaseDateAsc':
      filteredData = filteredData.toSorted((a, b) => a.releaseDate.localeCompare(b.releaseDate));
      break;
    case 'releaseDateDesc':
      filteredData = filteredData.toSorted((a, b) => b.releaseDate.localeCompare(a.releaseDate));
      break;
    case 'nameAsc':
      filteredData = filteredData.toSorted((a, b) => a.name.localeCompare(b.name));
      break;
    case 'nameDesc':
      filteredData = filteredData.toSorted((a, b) => b.name.localeCompare(a.name));
      break;
  }

  count.innerText = filteredData.length+'건';
  amount.innerText = filteredData.reduce((accumulator, currentValue) => {
  return accumulator + (currentValue.status != '미보유')?parseInt(currentValue.price.slice(0, -1)):0;}, 0).toLocaleString() + '원';

  displayResults(filteredData);
}

function displayResults(data) {
  resultsContainer.innerHTML = '';
  data.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('card');
    var imgContainer = document.createElement('div');
    imgContainer.classList.add('img-container');
    var img = document.createElement('img');
    img.src = item.imageUrl;
    let realImg = new Image();
    realImg.src = item.imageUrl;
    img.style.visibility = 'hidden';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease';
    img.onload = function () {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        img.classList.add('tail-img');
      } else {
        img.classList.add('long-img');
      }
      if (item.status === '미보유') {
      img.classList.add('monochrome');
      }
      img.style.visibility = 'visible';
      img.style.opacity = '1';
    };
    imgContainer.appendChild(img);
    div.appendChild(imgContainer);

    const textDiv = document.createElement('div');
    textDiv.classList.add('name-container');
    textDiv.innerHTML = item.name;
    if (item.status === '미개봉') {
      textDiv.classList.add('unopened');
    }
    div.appendChild(textDiv);
    resultsContainer.appendChild(div);
  });
}

selectElement.addEventListener('change', filterAndDisplay);
selectSortElement.addEventListener('change', filterAndDisplay);
isCollectedCheckbox.addEventListener('change', filterAndDisplay);
statusCheckbox.addEventListener('change', filterAndDisplay);
searchBox.addEventListener('input', filterAndDisplay);
filterAndDisplay();
