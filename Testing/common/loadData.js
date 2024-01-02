const loadSamplePair = async () => {
  const currentDirectory = process.cwd();
  console.log('Current Directory:', currentDirectory);
  const samplePairPath = currentDirectory + '/outputData/apiComponents/backend/routes.test.js/samplePair.json';
  const samplePair = require(samplePairPath);
  return Object.values(samplePair)?.[0];
};

module.exports = {
  loadSamplePair,
};
