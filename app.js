import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2TI5fQkj_TrYMAYExMt8RC2H0EJGl1Xc",
  authDomain: "chat-app-6cd37.firebaseapp.com",
  projectId: "chat-app-6cd37",
  storageBucket: "chat-app-6cd37.appspot.com",
  messagingSenderId: "605161920580",
  appId: "1:605161920580:web:2f587d00afbe974e5c4411",
  measurementId: "G-6KDVM637VZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let uid;

// Form
const signInForm = document.querySelector(".sign-in");
const registerForm = document.querySelector(".register");
const goToRegister = document.getElementById("goRegister");
const goToSignIn = document.getElementById("goSignIn");
const formInput = document.getElementsByClassName("form-input");
const signInEmail = document.getElementById("sign-in-email");
const signInPass = document.getElementById("sign-in-pass");
const userName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regPass = document.getElementById("reg-pass");
const signInBtn = document.getElementById("sign_in-btn");
const regBtn = document.getElementById("reg-btn");
const formContainer = document.querySelector(".form-container");
const chatAppContainer = document.querySelector(".chat-app-container");
const usersContainer = document.getElementById("users");
const signOutBtn = document.getElementById("sign-out-btn");
const msgInput = document.getElementById('msg-input');
const sendMsgBtn = document.getElementById('send-msg-btn')
const chatContainer = document.getElementById('chat-container');
const secondPersonName = document.getElementById('second-person-name');
const userImage = document.getElementById('user-image')
let secondUserId, chatId;

goToRegister.addEventListener("click", () => {
  signInForm.style.display = "none";
  registerForm.style.display = "flex";
});

goToSignIn.addEventListener("click", () => {
  registerForm.style.display = "none";
  signInForm.style.display = "flex";
});

Object.values(formInput).forEach((e) => {
  e.addEventListener("focus", () => {
    Array.from(document.getElementsByClassName("box-circle")).forEach((e) => {
      e.classList.add("blur");
    });
  });
  e.addEventListener("blur", () => {
    Array.from(document.getElementsByClassName("box-circle")).forEach((e) => {
      e.classList.remove("blur");
    });
  });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    uid = user.uid;
    formContainer.style.display = "none";
    chatAppContainer.style.display = "flex";
    setTimeout(() => {
      getUsers();
    }, 500);
  } else {
    formContainer.style.display = "block";
    chatAppContainer.style.display = "none";
  }
});

function register() {
  createUserWithEmailAndPassword(auth, regEmail.value, regPass.value)
    .then((userCredential) => {
      const user = userCredential.user;
      uid = auth.currentUser.uid;
    })
    .catch((error) => {
      const errorCode = error.code;
      alert(errorCode);
    });

  const imgRef = ref(storage, 'users');
  uploadBytes(imgRef, userImage.files[0]).then((snapshot) => {
  });

  setTimeout(async () => {
    try {
      const userRef = collection(db, "users");
      await setDoc(doc(userRef, uid), {
        name: userName.value,
        email: regEmail.value,
        pass: regPass.value,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, 2000);
}
regBtn.addEventListener("click", register);

function signIn() {
  signInWithEmailAndPassword(auth, signInEmail.value, signInPass.value)
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      alert(errorCode);
    });
}
signInBtn.addEventListener("click", signIn);

function logOut() {
  signOut(auth)
    .then(() => {})
    .catch((error) => {
      alert(error.code);
    });
}
signOutBtn.addEventListener("click", logOut);

async function getUsers() {
  usersContainer.innerHTML = "";

  const q = query(collection(db, "users"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let userCard = `<span class="user-cards" id=${doc.id}>${
      doc.data().name
    }</span>`;
    usersContainer.innerHTML += userCard;
  });
  Array.from(document.getElementsByClassName('user-cards')).forEach((e) => {
    e.addEventListener('click', chats)
  });
};

function chats(card) {
  Array.from(document.getElementsByClassName('user-cards')).forEach((e) => {
    e.style.backgroundColor = 'black';
  });
  let userCard = card.target;
  userCard.style.backgroundColor = 'rgb(27, 27, 27)';
  secondPersonName.innerText = userCard.innerText
  secondUserId = userCard.id;
  chatId = uid > secondUserId ? uid + secondUserId : secondUserId + uid;
  getChats();
};

async function sendChats() {
  let msg = msgInput.value;
  let date = new Date
  let time = date.toLocaleTimeString()
  console.log(date);
  console.log(time);
  if (msg === '') {
    alert('write a msg first')
  } else {
    try {
      const chatRef = await addDoc(collection(db, `chats/msg/${chatId}`), {
        msg,
        from: uid,
        to: secondUserId,
        time,
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    };
    msgInput.value = '';
  }
};
sendMsgBtn.addEventListener('click', sendChats);
msgInput.addEventListener('keypress', (enter) => {
  if (enter.key === "Enter") {
    sendChats();
  }
})

function getChats() {
  let msgClass;
  const q = query(collection(db, `chats/msg/${chatId}`), orderBy("time"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    chatContainer.innerHTML = null;
  querySnapshot.forEach((doc) => {
    if (doc.data().from == uid) {
        msgClass = 'from';
    } else {
        msgClass = 'to';
    };
      let msgCard = `<div class="msg-box ${msgClass}"><span>${doc.data().msg}</span></div>`
      chatContainer.innerHTML += msgCard;
  });
});
};