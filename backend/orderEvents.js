const subscribers = new Set();

function addSubscriber(res) {
  subscribers.add(res);
}

function removeSubscriber(res) {
  subscribers.delete(res);
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

  subscribers.forEach((res) => {
    try {
      res.write(message);
    } catch (error) {
      console.error('Failed to broadcast update:', error);
      subscribers.delete(res);
    }
  });
}

module.exports = {
  addSubscriber,
  removeSubscriber,
  broadcast,
};
