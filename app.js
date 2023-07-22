import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyA2TI5fQkj_TrYMAYExMt8RC2H0EJGl1Xc",
  authDomain: "chat-app-6cd37.firebaseapp.com",
  projectId: "chat-app-6cd37",
  storageBucket: "chat-app-6cd37.appspot.com",
  messagingSenderId: "605161920580",
  appId: "1:605161920580:web:2f587d00afbe974e5c4411",
  measurementId: "G-6KDVM637VZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let uid;

// Form
const signInForm = document.querySelector('.sign-in')
const registerForm = document.querySelector('.register')
const goToRegister = document.getElementById('goRegister')
const goToSignIn = document.getElementById('goSignIn')
const formInput = document.getElementsByClassName('form-input')
const signInEmail = document.getElementById('sign-in-email')
const signInPass = document.getElementById('sign-in-pass')
const userName = document.getElementById('reg-name')
const regEmail = document.getElementById('reg-email')
const regPass = document.getElementById('reg-pass')
const signInBtn = document.getElementById('sign_in-btn')
const regBtn = document.getElementById('reg-btn')
const formContainer = document.querySelector('.form-container')
const chatAppContainer = document.querySelector('.chat-app-container')

goToRegister.addEventListener('click', () => {
    signInForm.style.display = 'none';
    registerForm.style.display = 'flex';
});

goToSignIn.addEventListener('click', () => {
    registerForm.style.display = 'none';
    signInForm.style.display = 'flex';
});

Object.values(formInput).forEach((e) => {
    e.addEventListener('focus', () => {
        Array.from(document.getElementsByClassName('box-circle')).forEach((e) => {
            e.classList.add('blur')
        })
    });
    e.addEventListener('blur', () => {
        Array.from(document.getElementsByClassName('box-circle')).forEach((e) => {
            e.classList.remove('blur')
        })
    })
});

onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      formContainer.style.display = 'none';
      chatAppContainer.style.display = 'block';
console.log(uid)

    } else {
        formContainer.style.display = 'block';
        chatAppContainer.style.display = 'none';
    };
});
  
function register() {
    createUserWithEmailAndPassword(auth, regEmail.value, regPass.value)
  .then((userCredential) => {
    const user = userCredential.user;
    uid = auth.currentUser.uid
  })
  .catch((error) => {
    const errorCode = error.code;
    alert(errorCode)
  });

  setTimeout(async () =>{ try {
    const userRef = collection(db, "users");
    await setDoc(doc(userRef, uid), {
        name: userName.value,
        email: regEmail.value,
        pass: regPass.value
    });
    // const userRef = await addDoc(collection(db, `user`), {
    //   name: userName.value,
    //   email: regEmail.value,
    //   password: regPass.value
    // });
    // console.log(userRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }},2000)
  
};
regBtn.addEventListener('click', register);

function signIn() {
    signInWithEmailAndPassword(auth, signInEmail.value, signInPass.value)
  .then((userCredential) => {
    const user = userCredential.user;
  })
  .catch((error) => {
    const errorCode = error.code;
    alert(errorCode)
  });
};
signInBtn.addEventListener('click', signIn);
