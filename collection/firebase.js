    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
    import {
      getAuth,
      GoogleAuthProvider,
      signInWithRedirect,
      getRedirectResult,
      onAuthStateChanged, signInWithPopup
    } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
    import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDG5dM9sdYj1Gzk9otxoBwlE2c2YZjcGkY",
      authDomain: "collection-6de28.firebaseapp.com",
      databaseURL: "https://collection-6de28-default-rtdb.firebaseio.com",
      projectId: "collection-6de28",
      storageBucket: "collection-6de28.firebasestorage.app",
      messagingSenderId: "532985173114",
      appId: "1:532985173114:web:9c97c5f7cb796ad62bd7c3"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const db = getDatabase(app);
    
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
          console.log(user);
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
  const dataRef = ref(db, "users/" + user.uid + "/itemList");
  get(dataRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        itemList = Object.values(snapshot.val());
        filterAndDisplay(); // 기존 필터 & 출력 함수
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
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
          createdAt: Date.now()
        });
        console.log("프로필 저장 완료");
      } else {
        console.log("기존 프로필 존재");
      }
    }
