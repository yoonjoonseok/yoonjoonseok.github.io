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

var filteredData;

/*function Item(name, majorCategory, middleCategory, minorCategory, releaseDate, price, nation, status, isCollected, remarks, imageUrl){
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

itemList = arr.map(item => new Item(item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7], item[8], item[9], item[10]));*/

function categoryFilter(){
  const selectedOptions = Array.from(selectElement.options).filter(o => o.selected);
  const majorCategory = selectedOptions.filter(o => o.dataset.name === 'majorCategory').map(o => o.value);
  const middleCategory = selectedOptions.filter(o => o.dataset.name === 'middleCategory').map(o => o.value);
  const minorCategory = selectedOptions.filter(o => o.dataset.name === 'minorCategory').map(o => o.value);
  const hasCategoryFilter = majorCategory.length || middleCategory.length || minorCategory.length;
  filteredDataByCategory = itemList.filter(item => {
    if (hasCategoryFilter && !(
      majorCategory.includes(item.majorCategory) ||
      middleCategory.includes(item.middleCategory) ||
      minorCategory.includes(item.minorCategory)
    )) return false;
    return true;
  });
  changeRemarkOptions();
}

function filterAndDisplay() {
  const keyword = searchBox.value.trim();
  const selectedNation = nationSelectElement.value;
  const selectedRemark = remarkSelectElement.value;

  filteredData = filteredDataByCategory.filter(item => {
    if (keyword && !item.name.includes(keyword)) return false;
    if (isCollectedCheckbox.checked && item.isCollected !== 'Y') return false;
    if (isHadCheckbox.checked && item.status === '미보유') return false;
    if (statusCheckbox.checked && item.status !== '미개봉') return false;
    if (selectedNation !== 'All' && item.nation !== selectedNation) return false;
    if (selectedRemark !== 'All' && item.remarks !== selectedRemark) return false;
    return true;
  });

  filteredData = filteredDataSort(filteredData);
  displayResults(filteredData);
  //autoResizeCards();
}

function changeRemarkOptions() {
  const uniqueRemarks = [...new Set(filteredDataByCategory.map(item => item.remarks))];
  remarkSelectElement.options.length = 1;

  for (const remark of uniqueRemarks) {
    const option = document.createElement('option');
    option.innerText = remark;
    option.value = remark;
    remarkSelectElement.append(option);
  }

  remarkSelectElement.value = 'All';
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
    default:
      return filteredData;
  }
}

function displayResults(data) {
  resultsContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  data.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');

    //if (item.status === '미개봉') {
      const overlay = document.createElement('div');
      overlay.classList.add('overlay');
      card.appendChild(overlay);
    //}

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('img-container');

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.style.visibility = 'hidden';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease';

    img.onload = function () {
      const isWide = img.naturalWidth > img.naturalHeight;
      img.classList.add(isWide ? 'tail-img' : 'long-img');
      if (item.status === '미보유') img.classList.add('monochrome');
      img.style.visibility = 'visible';
      img.style.opacity = '1';
    };

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const nameContainer = document.createElement('div');
    nameContainer.classList.add('name-container');
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    if (item.status === '미개봉') nameDiv.classList.add('unopened');
    nameDiv.innerHTML = item.name;
    nameContainer.appendChild(nameDiv);
    card.appendChild(nameContainer);

    fragment.appendChild(card);
  });

  resultsContainer.appendChild(fragment);
  renderingSum(filteredData);

  setupCardEffects();

  if ('requestIdleCallback' in window) {
    requestIdleCallback(resizeName);
  } else {
    requestAnimationFrame(resizeName);
  }
}

function setupCardEffects() {
  resultsContainer.removeEventListener('click', cardDetail);
  resultsContainer.addEventListener('click', cardDetail);
  resultsContainer.removeEventListener('mousemove', onMouseMove);
  resultsContainer.removeEventListener('mouseout', onMouseOut);
  resultsContainer.addEventListener('mousemove', onMouseMove);
  resultsContainer.addEventListener('mouseout', onMouseOut);
}

function cardDetail(e){
  const card = e.target.closest('.card');
  console.log(card);
}

function onMouseMove(e) {
  const card = e.target.closest('.card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotateY = -40 / card.clientWidth * x + 20;
  const rotateX = 40 / card.clientHeight * y - 20;
  const overlay = card.querySelector('.overlay');

  overlay.style.backgroundPosition = `${x / 5 + y / 5}%`;
  overlay.style.filter = `opacity(${x / 200}) brightness(1.2)`;
  card.style.transform = `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function onMouseOut(e) {
  const card = e.target.closest('.card');
  if (!card) return;
  const overlay = card.querySelector('.overlay');
  overlay.style.filter = 'opacity(0)';
  card.style.transform = 'perspective(350px) rotateY(0deg) rotateX(0deg)';
}

function resizeName() {
  const cards = Array.from(document.querySelectorAll('.card'));
  const baseSize = 10;   //Math.floor(200 / sizeRange.value);
  let index = 0;

  function processNextBatch() {
    const start = performance.now();
    while (index < cards.length && performance.now() - start < 16) {
      const container = cards[index++];
      const nameContainer = container.querySelector('.name-container');
      if (!nameContainer) continue;
      const name = nameContainer.querySelector('.name');
      if (!name) continue;
      name.style.fontSize = '';

      let min = 1, max = baseSize, bestFit = min;
      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        name.style.fontSize = mid + 'cqw';
        const fits =
          nameContainer.scrollWidth <= nameContainer.clientWidth &&
          nameContainer.scrollHeight <= nameContainer.clientHeight;
        if (fits) { bestFit = mid; min = mid + 1; }
        else { max = mid - 1; }
      }
      name.style.fontSize = bestFit + 'cqw';
      name.style.opacity = 1;
      name.style.visibility = 'visible';
    }
    if (index < cards.length) requestAnimationFrame(processNextBatch);
  }
  requestAnimationFrame(processNextBatch);
}

function renderingSum(filteredData) {
  count.innerText = filteredData.length + '건';
  amount.innerText = filteredData.reduce((acc, cur) => {
    return acc + (cur.price.slice(-1) === '￥' ? 10 : 1) * (parseInt(cur.price.slice(0, -1)));
  }, 0).toLocaleString() + '원';
}

function resizeCards() {
  const value = sizeRange.value;
  document.documentElement.style.setProperty('--card-size', value);
  resizeName();
}

function autoResizeCards() {
  sizeRange.value = Math.floor(filteredData.length ** 0.5) + 1;
  if (sizeRange.value > 10)
    sizeRange.value = 10;
  if (sizeRange.value < 10)
    sizeRange.value = 10;
}

// Event binding
selectElement.addEventListener('change', function(){
  categoryFilter();
  filterAndDisplay();
});
selectSortElement.addEventListener('change', filterAndDisplay);
isCollectedCheckbox.addEventListener('change', filterAndDisplay);
isHadCheckbox.addEventListener('change', filterAndDisplay);
statusCheckbox.addEventListener('change', filterAndDisplay);
searchBox.addEventListener('input', filterAndDisplay);
nationSelectElement.addEventListener('change', filterAndDisplay);
remarkSelectElement.addEventListener('change', filterAndDisplay);
sizeRange.addEventListener('change', resizeCards);

categoryFilter();
filterAndDisplay();
resizeCards();
