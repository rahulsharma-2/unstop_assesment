const { createHotelRooms } = require('./hotelData');

const MAX_ROOMS_PER_BOOKING = 5;
const HORIZONTAL_MINUTES_PER_ROOM = 1;
const VERTICAL_MINUTES_PER_FLOOR = 2;

let rooms = createHotelRooms();
let latestBooking = null;

function getState() {
  return {
    rooms: sortRooms(rooms).map((room) => ({ ...room })),
    latestBooking
  };
}

function resetBookings() {
  rooms = createHotelRooms();
  latestBooking = null;
  return getState();
}

function randomizeOccupancy() {
  latestBooking = null;
  rooms = createHotelRooms().map((room) => ({
    ...room,
    status: Math.random() < 0.35 ? 'occupied' : 'available'
  }));

  return getState();
}

function bookRooms(count) {
  const requestedCount = Number(count);

  if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > MAX_ROOMS_PER_BOOKING) {
    const error = new Error('Please enter a room count between 1 and 5.');
    error.statusCode = 400;
    throw error;
  }

  const availableRooms = sortRooms(rooms.filter((room) => room.status === 'available'));

  if (availableRooms.length < requestedCount) {
    const error = new Error(`Only ${availableRooms.length} rooms are available.`);
    error.statusCode = 409;
    throw error;
  }

  clearLatestBookingFlag();

  const selection = findBestSameFloorSelection(availableRooms, requestedCount)
    || findBestCrossFloorSelection(availableRooms, requestedCount);

  const selectedRoomNumbers = new Set(selection.rooms.map((room) => room.roomNumber));

  rooms = rooms.map((room) => {
    if (!selectedRoomNumbers.has(room.roomNumber)) {
      return room;
    }

    return {
      ...room,
      status: 'booked',
      latest: true
    };
  });

  latestBooking = {
    rooms: selection.rooms.map(toPublicRoom),
    totalTravelTime: selection.totalTravelTime
  };

  return getState();
}

function clearLatestBookingFlag() {
  rooms = rooms.map((room) => {
    const { latest, ...rest } = room;
    return rest;
  });
}

function findBestSameFloorSelection(availableRooms, count) {
  let best = null;
  const floors = groupByFloor(availableRooms);

  for (const floorRooms of floors.values()) {
    if (floorRooms.length < count) {
      continue;
    }

    const sortedFloorRooms = [...floorRooms].sort(compareByPosition);

    for (let start = 0; start <= sortedFloorRooms.length - count; start += 1) {
      const candidateRooms = sortedFloorRooms.slice(start, start + count);
      const candidate = createCandidate(candidateRooms);

      if (!best || compareCandidates(candidate, best) < 0) {
        best = candidate;
      }
    }
  }

  return best;
}

function findBestCrossFloorSelection(availableRooms, count) {
  let best = null;

  function visit(startIndex, selectedRooms) {
    if (selectedRooms.length === count) {
      const candidate = createCandidate(selectedRooms);

      if (!best || compareCandidates(candidate, best) < 0) {
        best = candidate;
      }

      return;
    }

    const remainingNeeded = count - selectedRooms.length;

    for (let index = startIndex; index <= availableRooms.length - remainingNeeded; index += 1) {
      visit(index + 1, [...selectedRooms, availableRooms[index]]);
    }
  }

  visit(0, []);
  return best;
}

function createCandidate(candidateRooms) {
  const sortedCandidateRooms = sortRooms(candidateRooms);
  const firstRoom = sortedCandidateRooms[0];
  const lastRoom = sortedCandidateRooms[sortedCandidateRooms.length - 1];

  return {
    rooms: sortedCandidateRooms,
    totalTravelTime: calculateTravelTime(firstRoom, lastRoom),
    floorsUsed: new Set(sortedCandidateRooms.map((room) => room.floor)).size,
    firstFloor: firstRoom.floor,
    roomKey: sortedCandidateRooms.map((room) => room.roomNumber).join(',')
  };
}

function calculateTravelTime(roomA, roomB) {
  return Math.abs(roomA.floor - roomB.floor) * VERTICAL_MINUTES_PER_FLOOR
    + Math.abs(roomA.position - roomB.position) * HORIZONTAL_MINUTES_PER_ROOM;
}

function compareCandidates(candidateA, candidateB) {
  if (candidateA.totalTravelTime !== candidateB.totalTravelTime) {
    return candidateA.totalTravelTime - candidateB.totalTravelTime;
  }

  if (candidateA.floorsUsed !== candidateB.floorsUsed) {
    return candidateA.floorsUsed - candidateB.floorsUsed;
  }

  if (candidateA.firstFloor !== candidateB.firstFloor) {
    return candidateA.firstFloor - candidateB.firstFloor;
  }

  return candidateA.roomKey.localeCompare(candidateB.roomKey, undefined, { numeric: true });
}

function groupByFloor(roomList) {
  return roomList.reduce((floorMap, room) => {
    if (!floorMap.has(room.floor)) {
      floorMap.set(room.floor, []);
    }

    floorMap.get(room.floor).push(room);
    return floorMap;
  }, new Map());
}

function compareByPosition(roomA, roomB) {
  return roomA.position - roomB.position;
}

function sortRooms(roomList) {
  return [...roomList].sort((roomA, roomB) => {
    if (roomA.floor !== roomB.floor) {
      return roomA.floor - roomB.floor;
    }

    return roomA.position - roomB.position;
  });
}

function toPublicRoom(room) {
  return {
    roomNumber: room.roomNumber,
    floor: room.floor,
    position: room.position,
    status: 'booked',
    latest: true
  };
}

module.exports = {
  MAX_ROOMS_PER_BOOKING,
  calculateTravelTime,
  bookRooms,
  getState,
  randomizeOccupancy,
  resetBookings
};
