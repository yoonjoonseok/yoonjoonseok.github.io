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
const sizeRange = document.getElementById('sizeRange');

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

  remarkSelectElement.options.length = 1;

  /*var option = document.createElement('option');
  option.innerText = 'All';
  option.value = 'All';
  remarkSelectElement.append(option);*/

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

    var overlay = document.createElement('div');
    overlay.classList.add('overlay');
    div.appendChild(overlay);

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

    const textContainer = document.createElement('div');
    const textDiv = document.createElement('div');
    textContainer.classList.add('name-container');
    textDiv.classList.add('name');
    textDiv.innerHTML = item.name;
    if (item.status === '미개봉') {
      textDiv.classList.add('unopened');
    }
    textContainer.appendChild(textDiv);
    div.appendChild(textContainer);

    resultsContainer.appendChild(div);
  });

  renderingSum(filteredData);

  var cards = document.querySelectorAll('.card')

  cards.forEach(container => {
    var overlay = container.querySelector('.overlay')
    container.addEventListener('mousemove', function (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var rotateY = -2 / 9 * x + 20
      var rotateX = 1 / 5 * y - 20

      overlay.style = `background-position : ${x / 5 + y / 5}%; filter : opacity(${x / 200}) brightness(1.2)`

      container.style = `transform : perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

    })

    container.addEventListener('mouseout', function () {
      overlay.style = 'filter : opacity(0)'
      container.style = 'transform : perspective(350px) rotateY(0deg) rotateX(0deg)'
    })
  });
  resizeName();
}

/*function resizeName() {
  var cards = document.querySelectorAll('.card')
  cards.forEach(container => {
    const nameContainer = container.querySelector('.name-container');
    const name = nameContainer.querySelector('.name');
    name.removeAttribute('style');

    var i = Math.floor(200/sizeRange.value);

    while (nameContainer.scrollWidth > nameContainer.clientWidth || nameContainer.scrollHeight > nameContainer.clientHeight) {
      name.style.cssText = 'font-size:' + i-- + 'cqw';
      if (i == 1)
        break;
    }
  });
}*/

function resizeName() {
  const cards = Array.from(document.querySelectorAll('.card'));
  const baseSize = Math.floor(200 / sizeRange.value);
  
  let index = 0;

  function processNextBatch() {
    const start = performance.now();
    
    // 한 프레임(약 16ms) 안에 처리 가능한 만큼만 수행
    while (index < cards.length && performance.now() - start < 16) {
      const container = cards[index++];
      const nameContainer = container.querySelector('.name-container');
      if (!nameContainer) continue;

      const name = nameContainer.querySelector('.name');
      if (!name) continue;

      name.style.fontSize = ''; // 초기화
      
      let min = 1;
      let max = baseSize;
      let bestFit = min;

      // --- 이진 탐색으로 최적 폰트 크기 찾기 ---
      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        name.style.fontSize = mid + 'cqw';

        const fits =
          nameContainer.scrollWidth <= nameContainer.clientWidth &&
          nameContainer.scrollHeight <= nameContainer.clientHeight;

        if (fits) {
          bestFit = mid;
          min = mid + 1;
        } else {
          max = mid - 1;
        }
      }

      name.style.fontSize = bestFit + 'cqw';
    }

    // 아직 처리할 카드가 남았으면 다음 프레임에 이어서 실행
    if (index < cards.length) {
      requestAnimationFrame(processNextBatch);
    }
  }

  requestAnimationFrame(processNextBatch);
}

function renderingSum(filteredData) {
  count.innerText = filteredData.length + '건';
  amount.innerText = filteredData.reduce((accumulator, currentValue) => {
    return accumulator + parseInt(currentValue.price.slice(0, -1));
  }, 0).toLocaleString() + '원';
}

function resizeCards() {
  const value = sizeRange.value;
  document.documentElement.style.setProperty('--card-size', 100 / (value*2)+ '%');
  resizeName();
}

selectElement.addEventListener('change', filterAndDisplay);
selectSortElement.addEventListener('change', filterAndDisplay);
isCollectedCheckbox.addEventListener('change', filterAndDisplay);
isHadCheckbox.addEventListener('change', filterAndDisplay);
statusCheckbox.addEventListener('change', filterAndDisplay);
searchBox.addEventListener('input', filterAndDisplay);
nationSelectElement.addEventListener('change', filterAndDisplay);
remarkSelectElement.addEventListener('change', filterAndDisplay);
sizeRange.addEventListener('change', resizeCards);
filterAndDisplay();
resizeCards();