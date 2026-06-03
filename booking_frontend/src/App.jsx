import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

function App() {
  const [rooms, setRooms] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const floors = useMemo(() => {
    const grouped = rooms.reduce((floorMap, room) => {
      if (!floorMap[room.floor]) {
        floorMap[room.floor] = [];
      }

      floorMap[room.floor].push(room);
      return floorMap;
    }, {});

    return Object.entries(grouped)
      .map(([floor, floorRooms]) => ({
        floor: Number(floor),
        rooms: floorRooms.sort((roomA, roomB) => roomA.position - roomB.position)
      }))
      .sort((floorA, floorB) => floorB.floor - floorA.floor);
  }, [rooms]);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    await request('/api/rooms', { method: 'GET' });
  }

  async function bookRooms() {
    const requestedCount = Number(count);

    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 5) {
      setMessage('Please enter a number from 1 to 5.');
      return;
    }

    await request('/api/book', {
      method: 'POST',
      body: JSON.stringify({ count: requestedCount })
    });
  }

  async function randomizeRooms() {
    await request('/api/randomize', { method: 'POST' });
  }

  async function resetRooms() {
    await request('/api/reset', { method: 'POST' });
  }

  async function request(path, options) {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}${path}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
      }

      setRooms(data.rooms);
      setLatestBooking(data.latestBooking);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="Booking controls">
        <div>
          <h1>Hotel Room Reservation</h1>
        </div>

        <div className="booking-form">
          <label htmlFor="room-count">No. of rooms</label>
          <input
            id="room-count"
            min="1"
            max="5"
            type="number"
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
          <button type="button" onClick={bookRooms} disabled={loading}>Book</button>
          <button type="button" className="secondary" onClick={resetRooms} disabled={loading}>Reset</button>
          <button type="button" className="secondary" onClick={randomizeRooms} disabled={loading}>Random</button>
        </div>

        {message && <p className="message error">{message}</p>}

        <div className="summary" aria-live="polite">
          <div>
            <span>Available</span>
            <strong>{rooms.filter((room) => room.status === 'available').length}</strong>
          </div>
          <div>
            <span>Occupied</span>
            <strong>{rooms.filter((room) => room.status !== 'available').length}</strong>
          </div>
          <div>
            <span>Travel time</span>
            <strong>{latestBooking ? `${latestBooking.totalTravelTime} min` : '-'}</strong>
          </div>
        </div>

        <BookingSummary latestBooking={latestBooking} />
      </section>

      <section className="hotel-view" aria-label="Hotel room visualization">
        <div className="lift-column">
          <span>Lift</span>
          <span>Stairs</span>
        </div>

        <div className="floors">
          {floors.map((floor) => (
            <div className="floor-row" key={floor.floor}>
              <span className="floor-label">F{floor.floor}</span>
              <div className="rooms-grid">
                {floor.rooms.map((room) => (
                  <RoomTile room={room} key={room.roomNumber} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function BookingSummary({ latestBooking }) {
  if (!latestBooking) {
    return (
      <div className="booking-summary empty">
        Select rooms to see the latest booking path.
      </div>
    );
  }

  return (
    <div className="booking-summary">
      <span>Booked rooms</span>
      <strong>{latestBooking.rooms.map((room) => room.roomNumber).join(', ')}</strong>
    </div>
  );
}

function RoomTile({ room }) {
  const classNames = ['room-tile'];

  if (room.latest) {
    classNames.push('latest');
  } else if (room.status !== 'available') {
    classNames.push('occupied');
  }

  return (
    <div
      className={classNames.join(' ')}
      title={`Room ${room.roomNumber}: ${room.latest ? 'latest booking' : room.status}`}
    >
      {room.roomNumber}
    </div>
  );
}

export default App;
