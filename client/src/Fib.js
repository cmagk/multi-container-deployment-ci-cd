import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  async function fetchValues() {
    const values = await axios.get('/api/values/current');
    setValues(values.data);
  }

  async function fetchIndexes() {
    const indexes = await axios.get('/api/values/all');
    setSeenIndexes(indexes.data);
  }

  function renderValues() {
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      );
    }

    return entries;
  }

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, [index]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post('/api/values', {
      index,
    });
    setIndex('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index: </label>
        <br />
        <input value={index} onChange={(event) => setIndex(event.target.value)} />
        <br />
        <button className='block'>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(', ')}

      <h3>Calculated Values:</h3>
      {renderValues()}
    </div>
  );
};

export default Fib;
