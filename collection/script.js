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
const isHadCheckbox = document.getElementById('isHadCheckbox');
const statusCheckbox = document.getElementById('statusCheckbox');
const searchBox = document.getElementById('searchBox');
const nationSelectElement = document.getElementById('nation');
const remarkSelectElement = document.getElementById('remarks');
const resultsContainer = document.getElementById('results');
const count = document.getElementById('count');

var selectedOptions;
var majorCategory;
var middleCategory;
var minorCategory;
var filteredData;
var keyword;
var selectedRemark;

function filterAndDisplay() {
  filteredData = itemList;
  filteredData = filteringKeyword(filteredData, keyword);
  filteredData = filteringCategory(filteredData);
  filteredData = filteringCheckbox(filteredData);
  filteredData = filteringNation(filteredData);
  filteredData = filteringRemarks(filteredData);
  filteredData = filteredDataSort(filteredData);
  displayResults(filteredData);
}

function filteringKeyword(filteredData, keyword) {
  keyword = searchBox.value.trim();
  if (keyword.length > 0) {
    return filteredData.filter(item => item.name.includes(keyword));
  }
  return filteredData;
}

function filteringCategory(filteredData) {
  selectedOptions = Array.from(selectElement.options).filter(option => option.selected);
  majorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'majorCategory').map(item => item.value);
  middleCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'middleCategory').map(item => item.value);
  minorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'minorCategory').map(item => item.value);
  return filteredData.filter(item => majorCategory.includes(item.majorCategory) || middleCategory.includes(item.middleCategory) || minorCategory.includes(item.minorCategory));
}

function filteringCheckbox(filteredData) {
  if (isCollectedCheckbox.checked) {
    filteredData = filteredData.filter(item => item.isCollected === 'Y');
  }

  if (isHadCheckbox.checked) {
    filteredData = filteredData.filter(item => item.status !== '미보유');
  }

  if (statusCheckbox.checked) {
    filteredData = filteredData.filter(item => item.status === '미개봉');
  }
  return filteredData;
}

function filteringNation(filteredData) {
  const selectedNation = nationSelectElement.value;
  if (selectedNation != 'All') {
    return filteredData.filter(item => item.nation === selectedNation);
  } return filteredData;
}

function filteringRemarks(filteredData) {
  const selectedRemark = remarkSelectElement.value;
  changeRemarkOptions(selectedRemark);
  if (selectedRemark != 'All') {
    return filteredData.filter(item => item.remarks === selectedRemark);
  }
  return filteredData;
}

function changeRemarkOptions(selectedRemark) {
  const uniqueRemarks = [...new Set(filteredData.map(item => item.remarks))];

  remarkSelectElement.options.length = 0;

  var option = document.createElement('option');
  option.innerText = 'All';
  option.value = 'All';
  remarkSelectElement.append(option);

  for (var i = 0; i < uniqueRemarks.length; i++) {
    var option = document.createElement('option');
    option.innerText = uniqueRemarks[i];
    option.value = uniqueRemarks[i];
    remarkSelectElement.append(option);
  }

  remarkSelectElement.value = selectedRemark;
}

function filteredDataSort(filteredData) {
  switch (selectSortElement.value) {
    case 'releaseDateAsc':
      return filteredData.toSorted((a, b) => a.releaseDate.localeCompare(b.releaseDate));
    case 'releaseDateDesc':
      return filteredData.toSorted((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    case 'nameAsc':
      return filteredData.toSorted((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return filteredData.toSorted((a, b) => b.name.localeCompare(a.name));
  }
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
  renderingSum(filteredData);

  
  var cards = document.querySelectorAll('.card')

  cards.forEach(container => {
  //var overlay = document.querySelector('.overlay')
  container.addEventListener('mousemove', function(e){
    var x = e.offsetX
    var y = e.offsetY
    var rotateY = -1/5 * x + 20
    var rotateX = 4/30 * y - 20

    //overlay.style = `background-position : ${x/5 + y/5}%; filter : opacity(${x/200}) brightness(1.2)`

    container.style = `transform : perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })

  container.addEventListener('mouseout', function(){
    //overlay.style = 'filter : opacity(0)'
    container.style = 'transform : perspective(350px) rotateY(0deg) rotateX(0deg)'
  })

  });
}

function renderingSum(filteredData) {
  count.innerText = filteredData.length + '건';
  amount.innerText = filteredData.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue.price.slice(0, -1));
  }, 0).toLocaleString() + '원';
}

selectElement.addEventListener('change', filterAndDisplay);
selectSortElement.addEventListener('change', filterAndDisplay);
isCollectedCheckbox.addEventListener('change', filterAndDisplay);
isHadCheckbox.addEventListener('change', filterAndDisplay);
statusCheckbox.addEventListener('change', filterAndDisplay);
searchBox.addEventListener('input', filterAndDisplay);
nationSelectElement.addEventListener('change', filterAndDisplay);
remarkSelectElement.addEventListener('change', filterAndDisplay);
filterAndDisplay();