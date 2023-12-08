import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyAPkciKSogOZiVFHEKrLo5CEg-Gy7mjEEo",
  authDomain: "c4c-projec.firebaseapp.com",
  projectId: "c4c-projec",
  storageBucket: "c4c-projec.appspot.com",
  messagingSenderId: "817802438188",
  appId: "1:817802438188:web:8fd9d158c0a56212585389",
  measurementId: "G-T9SN0G7LG6"
});

const auth = firebase.auth();   
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>C4C Message Board</h1>
        <SignOut />
      </header>

      <section>
        {user ? <MessageBoard /> : <SignIn />}
      </section>

    </div>
  );
}


function MessageBoard() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const MAX_CHARACTERS = 128;

  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= MAX_CHARACTERS) {
      setFormValue(inputValue);
    }
  };


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
  }

  return (
    <>
      <main>
        {messages && messages.map((msg) => <MessageBoardInput key={msg.id} message={msg} />)}
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={handleChange}
          placeholder="type here"
          maxLength={MAX_CHARACTERS} // Set the maximum character limit
        />
        <p>{MAX_CHARACTERS - formValue.length} characters remaining</p>
        <button type="submit" disabled={!formValue}>
          🫵
        </button>
      </form>
    </>
  );
}

function MessageBoardInput(props) {
  const { text, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  const formattedTimestamp = createdAt && createdAt.toDate().toLocaleString();

  

  return (<> 
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
      <span className="timestamp">{formattedTimestamp}</span>
    </div>
  </>)
}


function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

export default App;
