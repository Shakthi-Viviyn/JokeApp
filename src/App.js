import React, { useState, useEffect} from 'react';
import './App.css';
import { languageData } from './languageData';


function App() {

  const [jokeData, setJokeData] = useState({
    setup: '',
    delivery: ''
  });

  const [languagesList, setLanguagesList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');


  useEffect(() => {
    fetchJoke();
  }, []);

  const fetchJoke = async () => {
    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode&type=twopart'); 

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const jsonData = await response.json();
      setJokeData({
        setup: jsonData.setup,
        delivery: jsonData.delivery
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function handleNewJoke() {
    fetchJoke();
  }

  useEffect(() => {
    const apiKey = 'AIzaSyBabYfcpMebqzQ9LsNP3OQAgr7wUs86IuE';
    const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`;

    const fetchLanguages = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.data && data.data.languages) {
          setLanguagesList(data.data.languages);
        } else {
          console.error('Error fetching supported languages: Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching supported languages:', error.message);
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    async function translateText(text, targetLanguage) {
      const apiKey = 'AIzaSyBabYfcpMebqzQ9LsNP3OQAgr7wUs86IuE';
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
          console.error('Error fetching translation: Invalid API response');
        }
      } catch (error) {
        console.error('Error fetching translation:', error.message);
      }
    }

    let translatedDelivery = '';
    let translatedSetup = '';
    (async () => {
      translatedSetup = await translateText(jokeData.setup, selectedLanguage);
      translatedDelivery = await translateText(jokeData.delivery, selectedLanguage);

      setJokeData({
        setup: translatedSetup,
        delivery: translatedDelivery
      })
    })();
    
  }, [selectedLanguage]); 

  function updateLanguage(e) {
    setSelectedLanguage(e.target.value);
  }

  return (
    <div className="App">
      <div className="main-container">
        <h1>{jokeData.setup}</h1>
        <h4>{jokeData.delivery}</h4>

        <button onClick={handleNewJoke}>New Joke</button>

        <select value={selectedLanguage} onChange={updateLanguage}>
          {languagesList.map((currentLanguage) => (
            languageData[currentLanguage.language] &&
            <option key={currentLanguage.language} value={currentLanguage.language}>
              {languageData[currentLanguage.language]}
            </option>
          ))}
        </select>
        
      </div>
    </div>
  );
}

export default App;
