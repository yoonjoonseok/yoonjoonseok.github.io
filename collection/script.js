import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG5dM9sdYj1Gzk9otxoBwlE2c2YZjcGkY",
  authDomain: "collection-6de28.firebaseapp.com",
  databaseURL: "https://collection-6de28-default-rtdb.firebaseio.com",
  projectId: "collection-6de28",
  storageBucket: "collection-6de28.firebasestorage.app",
  messagingSenderId: "532985173114",
  appId: "1:532985173114:web:9c97c5f7cb796ad62bd7c3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

const selectElement = document.getElementById("for");
const selectSortElement = document.getElementById("selectSort");
const isCollectedCheckbox = document.getElementById("isCollectedCheckbox");
const isHadCheckbox = document.getElementById("isHadCheckbox");
const statusCheckbox = document.getElementById("statusCheckbox");
const searchBox = document.getElementById("searchBox");
const nationSelectElement = document.getElementById("nation");
const remarkSelectElement = document.getElementById("remarks");
const resultsContainer = document.getElementById("results");
const count = document.getElementById("count");
const sizeRange = document.getElementById("sizeRange");
const modal = document.getElementById("modal");
const popCreateModalBtn = document.getElementById("pop-create-modal-button");
const createModalBtn = document.getElementById("create-modal-button");
const updateModalBtn = document.getElementById("update-modal-button");
const saveModalBtn = document.getElementById("save-modal-button");
const deleteModalBtn = document.getElementById("delete-modal-button");
const closeModalBtn = document.getElementById("close-modal-button");
const modalForm = document.getElementById("modalForm");

const majorCategorySelect = document.getElementById("majorCategorySelect");
const middleCategorySelect = document.getElementById("middleCategorySelect");
const categoryLabel = document.getElementById("categoryLabel");
const fontColorSelect = document.getElementById("fontColorSelect");
const backgroundColorSelect = document.getElementById("backgroundColorSelect");
const categoryAddBtn = document.getElementById("categoryAddBtn");
const modalMajorSelect = document.getElementById("modalMajorSelect");
const modalMiddleSelect = document.getElementById("modalMiddleSelect");
const modalMinorSelect = document.getElementById("modalMinorSelect");

var categoryMap = new Map();
var itemList = [];
var filteredDataByCategory = [];
var filteredData = [];
var currentCategory = {
  "major" : "",
  "middle" : "",
  "minor" : "",
}
var currentIndex;

function CurrentCategory(major, middle, minor){
  this.major = major;
  this.middle = middle;
  this.minor = minor;
}

// DOM 로드 후 버튼 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  // 로그인 상태 변화 감지
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 로그인 상태이면 사용자 데이터 로드
      console.log("자동 로그인:", user);
      saveUserProfile(user);
      loadUserCategories(user);
      loadUserItems(user);
      loginBtn.textContent = "로그아웃";
    } else {
      // 로그아웃 상태
      loginBtn.textContent = "로그인";
    }
  });

  // 로그인 버튼 클릭 이벤트
  loginBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
      // 이미 로그인 되어있으면 로그아웃
      auth.signOut().then(() => {
        console.log("로그아웃 완료");
        loginBtn.textContent = "로그인";
        document.getElementById("results").innerHTML = "";
      });
    } else {
      // 로그인
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          saveUserProfile(user);
          loadUserCategories(user);
          loadUserItems(user);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
});

// 사용자 프로필 저장 함수
async function saveUserProfile(user) {
  const userRef = ref(db, "users/" + user.uid + "/profile");
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, {
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      createdAt: Date.now(),
    });
    console.log("프로필 저장 완료");
  } else {
    console.log("기존 프로필 존재");
  }
}

/*Category 관리 functions*/

function loadUserCategories(user) {
  const newCategoryDataRef = ref(db, "users/" + user.uid + "/newItemCategory");

  get(newCategoryDataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        categoryMap = convertToHierarchicalMap(snapshot.val());
        renderAllCategory();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function convertToHierarchicalMap(obj) {
  const sortedEntries = Object.entries(obj).sort((a, b) => {
    const orderA = a[1].order ?? 0;
    const orderB = b[1].order ?? 0;
    return orderA - orderB;
  });
  const map = new Map();

  for (const [key, value] of sortedEntries) {
    const newObj = { ...value };

    if (value.son && typeof value.son === "object") {
      newObj.son = convertToHierarchicalMap(value.son);
    }

    map.set(key, newObj);
  }

  return map;
}

function renderAllCategory() {
  selectElement.options.length = 0;
  categoryMap.forEach((majorValue, majorKey) => {
    renderCategory(majorKey, majorValue, null, null);
    if (majorValue.son instanceof Map) {
      majorValue.son.forEach((middleValue, middleKey) => {
        renderCategory(middleKey, middleValue, majorKey, null);
        if (middleValue.son instanceof Map) {
          middleValue.son.forEach((minorValue, minorKey) => {
            renderCategory(minorKey, minorValue, majorKey, middleKey);
          })
        }
      })
    }
  });

  selectElement.value = selectElement[selectElement.length -1].value;
  renderMajorCategory();
  console.log(categoryMap);
}

function renderCategory(key, value, major, middle) {
  var level = (middle) ? "minor" : ((major) ? "middle" : "major");
  var gap = "";
  var option = new Option();

  option.value = key;
  option.style.color = value.fontColor;
  option.style.backgroundColor = value.backGroundColor;
  option.classList.add(level + "Category");

  if (major) {
    option.dataset.major = major;
    gap += "&nbsp;&nbsp;&nbsp;&nbsp;";
  }
  if (middle) {
    option.dataset.middle = middle;
    gap += "&nbsp;&nbsp;&nbsp;&nbsp;";
  }

  option.innerHTML = gap + key;
  selectElement.add(option);
}

function renderMajorCategory() {
  majorCategorySelect.options.length = 1;
  modalMinorSelect.options.length = 1;
  for (const key of categoryMap.keys()) {
    var option = new Option(key, key);
    majorCategorySelect.add(option);
    modalMinorSelect.add(option);
  }
}

function renderMiddleCategory(select) {
  select.options.length = 1;
  for (const key of categoryMap.get(select.dataset.major).son.keys()) {
    var option = new Option(key, key);
    select.add(option);
  }
}

function renderMinorCategory(select) {
  select.options.length = 1;
  for (const key of categoryMap.get(select.dataset.major).son.get(select.value).son.keys()) {
    var option = new Option(key, key);
    select.add(option);
  }
}

function addCategory() {
  const label = categoryLabel.value;
  const category = new Category(
    backgroundColorSelect.value,
    fontColorSelect.value,
    0,
    ""
  );
  var url = "users/" + auth.currentUser.uid + "/newItemCategory";

  const majcv = majorCategorySelect.value;
  const midcv = middleCategorySelect.value;

  if (majcv != "" && midcv == "") {
    url += "/" + majcv + "/son";
    const parent = categoryMap.get(majcv);
    if (parent.son == "") {
      parent.son = new Map();
    }
    category.order = parent.son.size + 1;
    parent.son.set(label, category);
  } else if (midcv != "") {
    url += "/" + majcv + "/son/" + midcv + "/son";
    const parent = categoryMap.get(majcv).son.get(midcv);
    if (parent.son == "") {
      parent.son = new Map();
    }
    category.order = parent.son.size + 1;
    parent.son.set(label, category);
  } else {
    category.order = categoryMap.size + 1;
    categoryMap.set(label, category);
  }

  url += "/" + label;
  const categoryRef = ref(db, url);

  set(categoryRef, category)
    .then(() => {
      console.log("카테고리 데이터가 성공적으로 추가되었습니다.");
      renderAllCategory();
      renderMajorCategory();
    })
    .catch((error) => {
      console.error("카테고리 데이터 추가 중 오류 발생: ", error);
    });
}

function Category(backgroundColor, fontColor, order, son) {
  this.backGroundColor = backgroundColor;
  this.fontColor = fontColor;
  this.order = order;
  this.son = son;
}

// 사용자 아이템 로드 함수
function loadUserItems(user) {
  const dataRef = ref(db, "users/" + user.uid + "/itemList");

  get(dataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        itemList = Object.entries(snapshot.val()).map(([key, item], index) => {
          return {
            ...item,
            index: index,
            id: key,
          };
        });
        categoryFilter();
        filterAndDisplay();
        resizeCards();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

/*item 관리 functions*/

function createItem() {
  var formData = new FormData(modalForm);
  var item = Object.fromEntries(formData);
  const postListRef = ref(db, "users/" + auth.currentUser.uid + "/itemList");
  const newPostRef = push(postListRef);
  const newPostKey = newPostRef.key;

  set(newPostRef, item)
    .then(() => {
      console.log("데이터가 성공적으로 추가되었습니다.");
      item.id = newPostKey;
      item.index = itemList.length;
      itemList.push(item);
      categoryFilter();
      filterAndDisplay();
    })
    .catch((error) => {
      console.error("데이터 추가 중 오류 발생: ", error);
    });
  closeModal();
}

function updateItem() {
  var formData = new FormData(modalForm);
  var currentItem = itemList[currentIndex];
  var newItem = Object.fromEntries(formData);

  set(
    ref(db, "users/" + auth.currentUser.uid + "/itemList/" + currentItem.id),
    newItem
  )
    .then(() => {
      console.log("데이터가 성공적으로 수정되었습니다.");
      newItem.id = currentItem.id;
      newItem.index = currentItem.index;
      itemList[currentItem.index] = newItem;
      categoryFilter();
      filterAndDisplay();
    })
    .catch((error) => {
      console.error("데이터 수정 중 오류 발생: ", error);
    });
  closeModal();
}

function deleteItem() {
  if (confirm("정말 삭제하겠습니까?")) {
    const item = itemList[currentIndex];

    remove(ref(db, "users/" + auth.currentUser.uid + "/itemList/" + item.id))
      .then(() => {
        console.log("데이터 삭제 성공");
        item.id = null;
        itemList[item.index] = item;
        categoryFilter();
        filterAndDisplay();
      })
      .catch((error) => {
        console.error("데이터 삭제 실패:", error);
      });
  }
  closeModal();
}

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

function categoryFilter() {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  var level = (selectedOption.dataset.middle)?"minor":((selectedOption.dataset.major)?"middle":"major");

  filteredDataByCategory = itemList.filter((item) => {
    if(level == "major"){
      currentCategory = new CurrentCategory(selectedOption.value, "", "");
      return item.majorCategory == currentCategory.major;
    } else if(level == "middle"){
      currentCategory = new CurrentCategory(selectedOption.dataset.major, selectedOption.value, "");
      return item.majorCategory == currentCategory.major && item.middleCategory == currentCategory.middle;
    } else {
      currentCategory = new CurrentCategory(selectedOption.dataset.major, selectedOption.dataset.middle, selectedOption.value);
      return item.majorCategory == currentCategory.major && item.middleCategory == currentCategory.middle  && item.minorCategory == currentCategory.minor;
    }
  });
  changeRemarkOptions();
}

function filterAndDisplay() {
  const keyword = searchBox.value.trim();
  const selectedNation = nationSelectElement.value;
  const selectedRemark = remarkSelectElement.value;

  filteredData = filteredDataByCategory.filter((item) => {
    if (keyword && !item.name.includes(keyword)) return false;
    if (isCollectedCheckbox.checked && item.isCollected !== "Y") return false;
    if (isHadCheckbox.checked && item.status === "미보유") return false;
    if (statusCheckbox.checked && item.status !== "미개봉") return false;
    if (selectedNation !== "All" && item.nation !== selectedNation)
      return false;
    if (selectedRemark !== "All" && item.remarks !== selectedRemark)
      return false;
    return true;
  });

  filteredData = filteredDataSort(filteredData);
  displayResults(filteredData);
  //autoResizeCards();
}

function changeRemarkOptions() {
  const uniqueRemarks = [
    ...new Set(filteredDataByCategory.map((item) => item.remarks)),
  ];
  remarkSelectElement.options.length = 1;

  for (const remark of uniqueRemarks) {
    const option = document.createElement("option");
    option.innerText = remark;
    option.value = remark;
    remarkSelectElement.append(option);
  }

  remarkSelectElement.value = "All";
}

function filteredDataSort(filteredData) {
  switch (selectSortElement.value) {
    case "releaseDateAsc":
      return filteredData.toSorted((a, b) =>
        a.releaseDate.localeCompare(b.releaseDate)
      );
    case "releaseDateDesc":
      return filteredData.toSorted((a, b) =>
        b.releaseDate.localeCompare(a.releaseDate)
      );
    case "nameAsc":
      return filteredData.toSorted((a, b) => a.name.localeCompare(b.name));
    case "nameDesc":
      return filteredData.toSorted((a, b) => b.name.localeCompare(a.name));
    default:
      return filteredData;
  }
}

function displayResults(data) {
  resultsContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();

  data.forEach((item) => {
    if (item.id == null) return;

    const card = document.createElement("div");
    card.classList.add("card");

    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("id", "cardIndex");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("value", item.index);
    card.append(hiddenInput);

    //if (item.status === '미개봉') {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    card.appendChild(overlay);
    //}

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("img-container");

    const img = document.createElement("img");
    img.src = item.imageUrl;
    img.style.visibility = "hidden";
    img.style.opacity = "0";
    img.style.transition = "opacity 0.2s ease";
    img.onerror = function () {
      this.onerror = null;
      this.src = "/resource/image/noImage.png";
    };

    img.onload = function () {
      const isWide = img.naturalWidth > img.naturalHeight;
      img.classList.add(isWide ? "tail-img" : "long-img");
      if (item.status === "미보유") img.classList.add("monochrome");
      img.style.visibility = "visible";
      img.style.opacity = "1";
    };

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const nameContainer = document.createElement("div");
    nameContainer.classList.add("name-container");
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name");
    if (item.status === "미개봉") nameDiv.classList.add("unopened");
    nameDiv.innerHTML = item.name;
    nameContainer.appendChild(nameDiv);
    card.appendChild(nameContainer);

    fragment.appendChild(card);
  });

  resultsContainer.appendChild(fragment);
  renderingSum(filteredData);

  setupCardEffects();

  if ("requestIdleCallback" in window) {
    requestIdleCallback(resizeName);
  } else {
    requestAnimationFrame(resizeName);
  }
}

function setupCardEffects() {
  resultsContainer.removeEventListener("click", cardDetail);
  resultsContainer.addEventListener("click", cardDetail);
  resultsContainer.removeEventListener("mousemove", onMouseMove);
  resultsContainer.removeEventListener("mouseout", onMouseOut);
  resultsContainer.addEventListener("mousemove", onMouseMove);
  resultsContainer.addEventListener("mouseout", onMouseOut);
}

function cardDetail(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  openModal(card);
}

function onMouseMove(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotateY = (-40 / card.clientWidth) * x + 20;
  const rotateX = (40 / card.clientHeight) * y - 20;
  const overlay = card.querySelector(".overlay");

  overlay.style.backgroundPosition = `${x / 5 + y / 5}%`;
  overlay.style.filter = `opacity(${x / 200}) brightness(1.2)`;
  card.style.transform = `perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function onMouseOut(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  const overlay = card.querySelector(".overlay");
  overlay.style.filter = "opacity(0)";
  card.style.transform = "perspective(350px) rotateY(0deg) rotateX(0deg)";
}

function resizeName() {
  const cards = Array.from(document.querySelectorAll(".card"));
  const baseSize = 10; //Math.floor(200 / sizeRange.value);
  let index = 0;

  function processNextBatch() {
    const start = performance.now();
    while (index < cards.length && performance.now() - start < 16) {
      const container = cards[index++];
      const nameContainer = container.querySelector(".name-container");
      if (!nameContainer) continue;
      const name = nameContainer.querySelector(".name");
      if (!name) continue;
      name.style.fontSize = "";

      let min = 1,
        max = baseSize,
        bestFit = min;
      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        name.style.fontSize = mid + "cqw";
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
      name.style.fontSize = bestFit + "cqw";
      name.style.opacity = 1;
      name.style.visibility = "visible";
    }
    if (index < cards.length) requestAnimationFrame(processNextBatch);
  }
  requestAnimationFrame(processNextBatch);
}

function renderingSum(filteredData) {
  count.innerText = filteredData.length + "건";
  amount.innerText =
    filteredData
      .reduce((acc, cur) => {
        return (
          acc +
          (cur.price.slice(-1) === "￥" ? 10 : 1) *
          parseInt(cur.price.slice(0, -1))
        );
      }, 0)
      .toLocaleString() + "원";
}

function resizeCards() {
  const value = sizeRange.value;
  document.documentElement.style.setProperty("--card-size", value);
  resizeName();
}

function autoResizeCards() {
  sizeRange.value = Math.floor(filteredData.length ** 0.5) + 1;
  if (sizeRange.value > 10) sizeRange.value = 10;
  if (sizeRange.value < 10) sizeRange.value = 10;
}

function openModal(card) {
  currentIndex = card.querySelector("#cardIndex").value;
  const item = itemList[currentIndex];

  document.getElementById("formSet").disabled = true;
  modal.querySelector('input[name="name"]').value = item.name;
  modal.querySelector('select[name="majorCategory"]').value = item.majorCategory;
  modal.querySelector('select[name="middleCategory"]').value =
    item.middleCategory;
  modal.querySelector('select[name="minorCategory"]').value = item.minorCategory;
  modal.querySelector('input[name="releaseDate"]').value = item.releaseDate;
  modal.querySelector('input[name="price"]').value = item.price;
  modal.querySelector('select[name="nation"]').value = item.nation;
  modal.querySelector('select[name="status"]').value = item.status;
  modal.querySelector('select[name="isCollected"]').value = item.isCollected;
  modal.querySelector('input[name="remarks"]').value = item.remarks;
  modal.querySelector('input[name="imageUrl"]').value = item.imageUrl;

  createModalBtn.style.display = "none";
  updateModalBtn.style.display = "block";
  saveModalBtn.style.display = "none";
  deleteModalBtn.style.display = "block";

  beforeRenderModal(item);
}

function closeModal() {
  modal.style.display = "none";
  currentIndex = null;
}

function openCreateModal() {
  document.getElementById("formSet").disabled = false;
  document.getElementById("modalForm").reset();

  createModalBtn.style.display = "block";
  updateModalBtn.style.display = "none";
  saveModalBtn.style.display = "none";
  deleteModalBtn.style.display = "none";

  beforeRenderModal();
}

function beforeRenderModal(item){

  modalMajorSelect.value = currentCategory.major;
  modalMiddleSelect.value = currentCategory.middle;
  modalMinorSelect.value = currentCategory.minor;
  modal.style.display = "block";
}

function openUpdateModal() {
  document.getElementById("formSet").disabled = false;
  createModalBtn.style.display = "none";
  updateModalBtn.style.display = "none";
  saveModalBtn.style.display = "block";
  deleteModalBtn.style.display = "none";
}

// Event binding
selectElement.addEventListener("change", function () {
  categoryFilter();
  filterAndDisplay();
});
selectSortElement.addEventListener("change", filterAndDisplay);
isCollectedCheckbox.addEventListener("change", filterAndDisplay);
isHadCheckbox.addEventListener("change", filterAndDisplay);
statusCheckbox.addEventListener("change", filterAndDisplay);
searchBox.addEventListener("input", filterAndDisplay);
nationSelectElement.addEventListener("change", filterAndDisplay);
remarkSelectElement.addEventListener("change", filterAndDisplay);
sizeRange.addEventListener("change", resizeCards);
popCreateModalBtn.addEventListener("click", openCreateModal);
createModalBtn.addEventListener("click", createItem);
updateModalBtn.addEventListener("click", openUpdateModal);
saveModalBtn.addEventListener("click", updateItem);
deleteModalBtn.addEventListener("click", deleteItem);
closeModalBtn.addEventListener("click", closeModal);
categoryAddBtn.addEventListener("click", addCategory);
majorCategorySelect.addEventListener("change", renderMiddleCategory(middleCategorySelect));
modalMajorSelect.addEventListener("change", renderMiddleCategory(modalMinorSelect));
modalMiddleSelect.addEventListener("change", renderMinorCategory(modalMinorSelect));
