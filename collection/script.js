function Item(name, majorCategory, middleCategory, minorCategory, releaseDate, price, nation, status, isCollected, remarks, imageUrl){
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
  
  var itemList = arr.map(item => new Item(item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7], item[8], item[9], item[10]));
  
  const selectElement = document.getElementById('for');
  const selectSortElement = document.getElementById('selectSort');
  const isCollectedCheckbox = document.getElementById('isCollectedCheckbox');
  const statusCheckbox = document.getElementById('statusCheckbox');
  const searchBox = document.getElementById('searchBox');
  const resultsContainer = document.getElementById('results');
  
  var selectedOptions;
  var majorCategory;
  var middleCategory;
  var minorCategory;
  var filteredData;
  var keyword;

  function filterAndDisplay(){
    filteredData = itemList;
    keyword = trim(searchBox.value);
    if(keyword.length > 0){
      filteredData = filteredData.filter(item => item.name.includes(keyword));
    }
    selectedOptions = Array.from(selectElement.options).filter(option => option.selected);
    majorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'majorCategory').map(item => item.value); 
    middleCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'middleCategory').map(item => item.value);
    minorCategory = selectedOptions.filter(option => option.getAttribute('data-name') === 'minorCategory').map(item => item.value);
    filteredData = filteredData.filter(item => majorCategory.includes(item.majorCategory) || middleCategory.includes(item.middleCategory) || minorCategory.includes(item.minorCategory));

    if(isCollectedCheckbox.checked){
      filteredData = filteredData.filter(item => item.isCollected === 'Y');
    }

    if(statusCheckbox.checked){
      filteredData = filteredData.filter(item => item.status === '미개봉');
    }

    switch (selectSortElement.value){
      case 'releaseDateAsc' :
        filteredData = filteredData.toSorted((a,b) => a.releaseDate.localeCompare(b.releaseDate));
        break; 
      case 'releaseDateDesc' :
        filteredData = filteredData.toSorted((a,b) => b.releaseDate.localeCompare(a.releaseDate));
        break;
      case 'nameAsc' :
        filteredData = filteredData.toSorted((a,b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc' :
        filteredData = filteredData.toSorted((a,b) => b.name.localeCompare(a.name));
        break;
    }

    displayResults(filteredData);
  }
  
  function displayResults(data) {
    resultsContainer.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        let imgEffect = (item.status==='미보유')?`filter: grayscale(100%);`:``;
        let textEffect = (item.status==='미개봉')?`background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
                                                  -webkit-background-clip: text;
                                                  background-clip: text;
                                                  color: transparent;
                                                  font-weight: bold;`:``;
        div.innerHTML = `<div style="background-color: #f0f0f0;border-radius: 10px;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);padding:10px">
    	                     <img style="width:150px;height:150px;` + imgEffect +
                           `"src="${item.imageUrl}"/><div style="width:200px;` + textEffect + `">${item.name}</div></div>`;
        resultsContainer.appendChild(div);
    });
}
  
  selectElement.addEventListener('change', filterAndDisplay);
  selectSortElement.addEventListener('change', filterAndDisplay);
  isCollectedCheckbox.addEventListener('change', filterAndDisplay);
  statusCheckbox.addEventListener('change', filterAndDisplay);
  filterAndDisplay();
