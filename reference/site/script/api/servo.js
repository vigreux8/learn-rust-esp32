export function createServoApi(transport) {
  return {
    move(target, speed) {
      transport.send(target, speed, false);
    },

    stop(target) {
      transport.send(target, 0, true);
    },
  };
}
