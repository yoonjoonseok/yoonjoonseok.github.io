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

var categoryList = [];
var itemList = [];
var filteredDataByCategory = [];
var filteredData = [];
var currentIndex;
var categoryMap = new Map();

// DOM 로드 후 버튼 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  // 로그인 상태 변화 감지
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 로그인 상태이면 사용자 데이터 로드
      console.log("자동 로그인:", user);
      saveUserProfile(user);
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
          loadUserItems(user);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
});

// 사용자 아이템 로드 함수
function loadUserItems(user) {
  const categoryDataRef = ref(db, "users/" + user.uid + "/itemCategory");
  const newCategoryDataRef = ref(db, "users/" + user.uid + "/newItemCategory");
  const dataRef = ref(db, "users/" + user.uid + "/itemList");
  get(categoryDataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        categoryList = Object.entries(snapshot.val());
        sortCategory(categoryList);
        setCategory();
      }
    })
    .catch((error) => {
      console.error(error);
    });

  get(newCategoryDataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(Object.entries(snapshot.val()));
        categoryMap = convertToHierarchicalMap(snapshot.val());
        console.log(categoryMap);
        renderCategory();
        console.log(categoryMap);
      }
    })
    .catch((error) => {
      console.error(error);
    });

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

function renderCategory() {
  majorCategorySelect.options.length = 1;
  for (const key of categoryMap.keys()) {
    var option = new Option(key, key);
    majorCategorySelect.add(option);
  }
}

function renderMiddleCategory(){
  middleCategorySelect.options.length = 1;
  console.log(categoryMap);
  for (const key of categoryMap.get(majorCategorySelect.value).son.keys()){
    var option = new Option(key, key);
    middleCategorySelect.add(option);    
  }
}

function convertToHierarchicalMap(obj) {
  const map = new Map();

  for (const [key, value] of Object.entries(obj)) {
    // 값은 객체 그대로 유지해야 함 → 복사
    const newObj = { ...value };

    // son이 비어있지 않고 object이면 다시 Map 변환
    if (value.son && typeof value.son === "object") {
      // son은 객체들의 entry 배열이어야 Map으로 변환 가능
      newObj.son = convertToHierarchicalMap(value.son);
    }

    map.set(key, newObj);
  }

  return map;
}

function objectToMap(obj) {
  const map = new Map();
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      map.set(key, objectToMap(value)); // 객체면 재귀변환
    } else {
      map.set(key, value); // number/string 등 기본값
    }
  }
  return map;
}

function newSortCategory(data) {
  selectElement.innerHTML = "";
  data
    .sort((a, b) => a[1].order - b[1].order) // major 정렬
    .forEach(([majorKey, major]) => {
      // Major
      newSetCategory(major);

      // Middle
      if (major.son) {
        Object.entries(major.son)
          .sort((a, b) => a[1].order - b[1].order)
          .forEach(([midKey, middle]) => {
            newSetCategory(middle);

            // Minor
            if (middle.son) {
              Object.entries(middle.son)
                .sort((a, b) => a[1].order - b[1].order)
                .forEach(([minKey, minor]) => {
                  newSetCategory(minor);
                });
            }
          });
      }
    });
  console.log(major_middle);
  console.log(middle_minor);
}

function newSetCategory(data) {
  let option = new Option(
    (data.level == "middle" ? "      " : "") +
      (data.level == "minor" ? "            " : "") +
      data.label,
    data.label
  );
  option.dataset.name = data.level + "Category";
  option.style.color = data.fontColor;
  option.style.backgroundColor = data.backgroundColor;
  option.classList.add(data.level + "Category");

  selectElement.add(option);
}

function sortCategory(data) {
  const levelRank = { major: 1, middle: 2, minor: 3 };

  // ID 기준 객체 맵
  const map = Object.fromEntries(
    data.map(([id, item]) => [id, { id, ...item }])
  );

  // 부모 → 자식 목록 생성
  const childrenMap = {};
  for (const id in map) {
    const parent = map[id].parent || null;
    if (!childrenMap[parent]) childrenMap[parent] = [];
    childrenMap[parent].push(map[id]);
  }

  // parent 그룹 내 order 순으로 정렬
  for (const p in childrenMap) {
    childrenMap[p].sort((a, b) => Number(a.order) - Number(b.order));
  }

  // DFS로 부모 이후에 자식 출력
  const result = [];

  function traverse(id) {
    const item = map[id];
    result.push(item);

    const children = childrenMap[id];
    if (children) {
      for (const child of children) {
        traverse(child.id);
      }
    }
  }

  // major 루트부터 시작
  const roots = childrenMap[null].sort(
    (a, b) => Number(a.order) - Number(b.order)
  );

  for (const root of roots) {
    traverse(root.id);
  }

  categoryList = result;
}

function setCategory() {
  const selectElement = document.getElementById("for");

  categoryList.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.dataset.name = item.level + "Category";
    const style =
      (item.fontColor ? "color:" + item.fontColor + ";" : "") +
      (item.backGroundColor
        ? "background-color:" + item.backGroundColor + ";"
        : "") +
      (item.level == "minor" ? "" : "font-weight:") +
      (item.level == "major" ? "900;" : "") +
      (item.level == "middle" ? "bold;" : "");
    option.style = style;
    option.innerHTML =
      (item.level == "middle" ? "&nbsp;&nbsp;&nbsp;" : "") +
      (item.level == "minor" ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : "") +
      item.label;
    selectElement.append(option);
  });
}

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

function createItem() {
  var formData = new FormData(modalForm);
  var item = Object.fromEntries(formData);
  const postListRef = ref(db, "users/" + auth.currentUser.uid + "/itemList");
  const newPostRef = push(postListRef);
  const newPostKey = newPostRef.key;

  set(newPostRef, item)
    .then(() => {
      console.log(newPostKey);
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
  const selectedOptions = Array.from(selectElement.options).filter(
    (o) => o.selected
  );
  const majorCategory = selectedOptions
    .filter((o) => o.dataset.name === "majorCategory")
    .map((o) => o.value);
  const middleCategory = selectedOptions
    .filter((o) => o.dataset.name === "middleCategory")
    .map((o) => o.value);
  const minorCategory = selectedOptions
    .filter((o) => o.dataset.name === "minorCategory")
    .map((o) => o.value);
  const hasCategoryFilter =
    majorCategory.length || middleCategory.length || minorCategory.length;
  filteredDataByCategory = itemList.filter((item) => {
    if (
      hasCategoryFilter &&
      !(
        majorCategory.includes(item.majorCategory) ||
        middleCategory.includes(item.middleCategory) ||
        minorCategory.includes(item.minorCategory)
      )
    )
      return false;
    return true;
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
  modal.querySelector('input[name="majorCategory"]').value = item.majorCategory;
  modal.querySelector('input[name="middleCategory"]').value =
    item.middleCategory;
  modal.querySelector('input[name="minorCategory"]').value = item.minorCategory;
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

  modal.style.display = "block";
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

  modal.style.display = "block";
}

function openUpdateModal() {
  document.getElementById("formSet").disabled = false;
  createModalBtn.style.display = "none";
  updateModalBtn.style.display = "none";
  saveModalBtn.style.display = "block";
  deleteModalBtn.style.display = "none";
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

  if (majcv != "none") {
    url += "/" + majcv + "/son";
    const parent = categoryMap.get(majcv);
    console.log(parent.son.size);
    if (parent.son == "") {
      parent.son = new Map();
    }
    category.order = parent.son.size + 1;
    parent.son.set(label, category);
  } else {
    category.order = categoryMap.size + 1;
    categoryMap.set(label, category);
  }
  if (midcv != "none") {
    url += "/" + midcv + "/son";
    const parent = categoryMap.get(majcv).son.get(midcv);
    if (parent.son == "") {
      parent.son = new Map();
    }
    category.order = parent.son.size + 1;
    parent.son.set(label, category);
  }
  console.log(categoryMap);

  url += "/" + label;

  const categoryRef = ref(db, url);

  set(categoryRef, category)
    .then(() => {
      console.log("카테고리 데이터가 성공적으로 추가되었습니다.");
      renderCategory();
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
majorCategorySelect.addEventListener("change", renderMiddleCategory);
