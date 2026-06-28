const { generateRomanEpochs } = require('../services/aiServices');

const getRomanHistory = async (req, res) => {
  try {
    // Call the AI service to generate fresh data
    const dynamicEpochs = await generateRomanEpochs();
    
    // Send the generated JSON array back to your React frontend
    res.status(200).json(dynamicEpochs);
  } catch (error) {
    console.error("AI Service Error: Falling back to local data.", error.message);
    const fallbackEpochs = [
      {
        id: "rome-01",
        year: "753 BC",
        title: "The Founding Myth",
        description: "Romulus founds the eternal city along the banks of the Tiber, setting the stage for an empire.",
        theme: "mythos"
      },
      {
        id: "rome-02",
        year: "44 BC",
        title: "The Ides of March",
        description: "Julius Caesar is assassinated, plunging the Republic into a chaotic civil war that ultimately births the Empire.",
        theme: "conflict"
      },
      {
        id: "rome-03",
        year: "117 AD",
        title: "Peak of the Empire",
        description: "Under Trajan, the Roman Empire reaches its greatest territorial extent, spanning across three continents.",
        theme: "golden-age"
      }
    ];
    res.status(200).json(fallbackEpochs);
  }
};
module.exports = { getRomanHistory };