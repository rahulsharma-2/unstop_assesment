const TOP_FLOOR = 10;
const TOP_FLOOR_ROOMS = 7;
const STANDARD_FLOOR_ROOMS = 10;

function createHotelRooms() {
  const rooms = [];

  for (let floor = 1; floor <= TOP_FLOOR; floor += 1) {
    const roomsOnFloor = floor === TOP_FLOOR ? TOP_FLOOR_ROOMS : STANDARD_FLOOR_ROOMS;

    for (let position = 1; position <= roomsOnFloor; position += 1) {
      rooms.push({
        roomNumber: floor === TOP_FLOOR ? 1000 + position : floor * 100 + position,
        floor,
        position,
        status: 'available'
      });
    }
  }

  return rooms;
}

module.exports = {
  TOP_FLOOR,
  TOP_FLOOR_ROOMS,
  STANDARD_FLOOR_ROOMS,
  createHotelRooms
};
