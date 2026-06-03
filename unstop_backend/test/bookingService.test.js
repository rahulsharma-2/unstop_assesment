const test = require('node:test');
const assert = require('node:assert/strict');
const {
  bookRooms,
  getState,
  randomizeOccupancy,
  resetBookings
} = require('../src/bookingService');

test('reset creates 97 available rooms', () => {
  const state = resetBookings();

  assert.equal(state.rooms.length, 97);
  assert.equal(state.rooms.filter((room) => room.status === 'available').length, 97);
  assert.equal(state.latestBooking, null);
});

test('rejects invalid booking counts', () => {
  resetBookings();

  assert.throws(() => bookRooms(0), /between 1 and 5/);
  assert.throws(() => bookRooms(6), /between 1 and 5/);
  assert.throws(() => bookRooms('abc'), /between 1 and 5/);
});

test('books closest rooms on the same floor first', () => {
  resetBookings();
  const state = bookRooms(5);

  assert.deepEqual(
    state.latestBooking.rooms.map((room) => room.roomNumber),
    [101, 102, 103, 104, 105]
  );
  assert.equal(state.latestBooking.totalTravelTime, 4);
});

test('supports top floor room count and sequential bookings', () => {
  resetBookings();

  for (let index = 0; index < 18; index += 1) {
    bookRooms(5);
  }

  const state = bookRooms(5);
  assert.equal(state.latestBooking.rooms.length, 5);
  assert.ok(state.latestBooking.rooms.every((room) => room.floor === 10));
});

test('randomize preserves all rooms and clears latest booking', () => {
  resetBookings();
  bookRooms(3);
  const state = randomizeOccupancy();

  assert.equal(state.rooms.length, 97);
  assert.equal(state.latestBooking, null);
  assert.ok(state.rooms.some((room) => room.status === 'available'));
});

test('reports insufficient availability', () => {
  resetBookings();

  for (let index = 0; index < 19; index += 1) {
    bookRooms(5);
  }

  assert.throws(() => bookRooms(5), /Only 2 rooms are available/);
  assert.equal(getState().rooms.filter((room) => room.status === 'available').length, 2);
});
