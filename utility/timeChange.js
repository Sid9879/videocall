const secondsToHM = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`
  };
};

module.exports = secondsToHM;