import React, { useState, useEffect, useRef} from 'react';
import './App.css';
import { languageData } from './languageData';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  const [rawJokeData, setRawJokeData] = useState({
    setup: '',
    delivery: ''
  });

  const [jokeData, setJokeData] = useState({
    setup: '',
    delivery: ''
  })

  const [languagesList, setLanguagesList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const emoji = useRef(null);

  //async function fetches joke from API
  const fetchJoke = async () => {
    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode&type=twopart'); 

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      setRawJokeData({
        setup: jsonData.setup,
        delivery: jsonData.delivery
      });

    } catch (error) {
      setRawJokeData({
        setup: '-',
        delivery: '-'
      })
      toast.error('Unable to fetch joke');
      console.error('Error fetching data:', error);
    }
  };

  //async function fetches supported languages from Google API
  const fetchLanguages = async () => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data && data.data.languages) {
        setLanguagesList(data.data.languages);
      } else {
        toast.error('Translation unavailable');
        console.error('Error fetching supported languages: Invalid API response');
      }
    } catch (error) {
      toast.error('Translation unavailable');
      console.error('Error fetching supported languages:', error.message);
    }
  };
  
  // async function translates text from english to selected language
  async function translateText(text, targetLanguage) {
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const requestBody = {
      q: text,
      target: targetLanguage,
    };
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };
  
    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data && data.data && data.data.translations) {
        const translation = data.data.translations[0].translatedText;
        return translation;
      } else {
        toast.error('Translation failed');
        console.error('Error fetching translation: Invalid API response');
      }
    } catch (error) {
      toast.error('Translation failed');
      console.error('Error fetching translation:', error.message);
    }
    return text;
  }

  //async function translates the two parts of the joke using translateText function
  const translateJoke = async () => {
    if (selectedLanguage !== 'en') {
      let translatedDelivery = '';
      let translatedSetup = '';
      translatedSetup = await translateText(rawJokeData.setup, selectedLanguage);
      translatedDelivery = await translateText(rawJokeData.delivery, selectedLanguage);

      setJokeData({
        setup: translatedSetup,
        delivery: translatedDelivery
      })
    }else{
      setJokeData({
        setup: rawJokeData.setup,
        delivery: rawJokeData.delivery
      })
    }
  }

  //hook fetches the first joke and list of languages
  useEffect(() => {
    fetchJoke();
    fetchLanguages();
  },[]);

  //hook translates the joke every time selected language changes or new joke is fetched
  useEffect(() => {
    translateJoke();
  }, [selectedLanguage, rawJokeData]);

  //button press event handlers
  function handleNewJoke(){
    fetchJoke();
    setTimeout(() => {
      emoji.current.classList.add('enlarge-emoji');
    },250);
    setTimeout(() => {
      emoji.current.classList.remove('enlarge-emoji');
    },1500);
  }

  function updateLanguage(e) {
    setSelectedLanguage(e.target.value);
  }

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/>

      <div className="main-container">
        <div className='language-selector-container'>
        <select value={selectedLanguage} onChange={updateLanguage} className='language-selector'>
          {languagesList.map((currentLanguage) => (
            languageData[currentLanguage.language] &&
            <option key={currentLanguage.language} value={currentLanguage.language}>
              {languageData[currentLanguage.language]}
            </option>
          ))}
        </select>
        </div>

        <div className='content-box'>
          <h1 ref={emoji} className='joke-emoji'>🤣</h1>
          <h1 className='joke-text'>{jokeData.setup}</h1>
          <h2 className='joke-text'>{jokeData.delivery}</h2>
          <button id="new-joke-btn" onClick={handleNewJoke}>New Joke</button>
        </div>
      </div>
    </div>
  );
}

export default App;
