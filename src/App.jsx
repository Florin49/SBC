import React, { useEffect, useState } from 'react';
import xmljs from 'xml-js';
import './App.css'

function App() {

  const [data, setData] = useState(null);
  const [numePacient, setNumePacient] = useState('')
  const [numeTerapeut, setNumeTerapeut] = useState('');
  const [nivelStres, setNivelStres] = useState('');
  const [numeServiciu, setNumeServiciu] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/psihologie.xml');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const xmlData = await response.text();

        // Parse XML to JS object using xml-js
        const jsonData = xmljs.xml2json(xmlData, { compact: true, spaces: 2 });
        const parsedData = JSON.parse(jsonData);

        console.log('Data parsed successfully:', parsedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching or parsing XML data:', error);
      }
    };

    fetchData();

  }, []);

  const getNivelStress = (pacient) => {
    if (!pacient)
      return "";

    return data['psihologie']['stari']['stare'].find((obj) => {
      return obj['pacient']['_attributes']['name'] === pacient;
    })['nivel_stres']['_attributes']['nivel'];

  };
  const mesajStres = (stres) => {
    if (!stres)
      return "";
    return "Nivel stres: " + stres;
  };
  const getNumeServiciu = (terapeut) => {
    if (!terapeut)
      return "";
    return data['psihologie']['servicii']['menire'].find((obj) => {
      return obj['terapeut']['_attributes']['name'] === terapeut;
    })['serviciu']['_attributes']['name'];
  };
  const mesajServiciu = (serviciu) => {
    if (!serviciu)
      return "";
    return "Serviciu: " + serviciu;
  };

  const getRecomandare = (pacient) => {
    if (!pacient)
      return "";
    //const terapeut=data['psihologie']['pacienti']['pacient'].find((obj)=>{
    //return obj['_attributes']['pacient']===pacient})['_attributes']['terapeut'];
    const rule = data['psihologie']['reguli']['regula'][0];
    console.log(rule['then']['recomandare']['_text']);

    const Recomandare_stres = rule['then']['recomandare']['_text'];
    const Recomandare = rule['else']['recomandare']['_text'];
    const [var1, var2, cond] = Object.keys(rule['if']);

    if (var1 === "pacient" && var2 === "nivel_stres" && cond === "peste"
      && getNivelStress(pacient) === 'ridicat')
      return Recomandare_stres;
    else if (var1 === "pacient" && var2 === "nivel_stres" && cond === "peste")
      return Recomandare;

  }
  const Colaborare = (pacient, terapeut) => {
    if (!pacient || !terapeut)
      return false;
    const ter = data['psihologie']['pacienti']['pacient'].find((obj) => {
      return obj['_attributes']['name'] === pacient
    })['_attributes']['terapeut'];
    const rule = data['psihologie']['reguli']['regula'][1];
    const [var1, rel, var2] = Object.keys(rule['if']);
    if (var1 === "pacient" && var2 === "terapeut" && rel === "relatie" && ter === terapeut)
      return true;
    return false;
  }


  
  return (
    data &&
    <>
      <h1>Cabinet terapeutic</h1>
      <div className="Pacienti">

        <div className="Radios">
          <h2>Pacienti</h2>
          <br></br>
          <br></br>
          {

            data['psihologie']['pacienti']['pacient'].map((pacient) => (

              <label key={pacient['_attributes']['name']}>
                <input
                  type='radio'
                  name='pacientName'
                  value={pacient['_attributes']['name']}

                  checked={numePacient === pacient['_attributes']['name']}
                  onChange={() => {
                    setNumePacient(pacient['_attributes']['name']);
                    setNivelStres('');
                  }
                  }
                />
                {pacient['_attributes']['name']}

              </label>
            ))}
        </div>
        {numePacient && (

          <div className="image">
            <img src={numePacient + '.jpg'} onClick={() => setNivelStres(getNivelStress(numePacient))}></img>
            <figcaption className="figcaption"> {mesajStres(nivelStres)}</figcaption>
            {nivelStres && <p>{'Pentru ' + numePacient + ' se recomanda  ' + getRecomandare(numePacient)}</p>}
          </div>


        )}
      </div>

      <div className="Terapeuti">
        <div className="Radios">


          <h2>Terapeuti</h2>
          <br></br>
          <br></br>

          {
            data['psihologie']['terapeuti']['terapeut'].map((terapeut) => (
              <label key={terapeut._attributes.name}>
                <input
                  type='radio'
                  name='terapeutName'
                  value={terapeut['_attributes']['name']}

                  checked={numeTerapeut === terapeut['_attributes']['name']}
                  onChange={() => {
                    setNumeTerapeut(terapeut['_attributes']['name']);
                    setNumeServiciu('');
                  }}
                />
                {terapeut['_attributes']['name']}

              </label>
            ))}


        </div>
        {numeTerapeut && (
          <div className="image1">
            <img src={numeTerapeut + '.jpg'} onClick={() => setNumeServiciu(getNumeServiciu(numeTerapeut))}></img>
            <figcaption className="caption">{mesajServiciu(numeServiciu)}</figcaption>
            {numePacient && numeTerapeut && Colaborare(numePacient, numeTerapeut) &&
              (<p>Hopa, colaborare</p>)}
          </div>
        )}
        <div></div>

      </div>

    </>
  )
}

export default App
