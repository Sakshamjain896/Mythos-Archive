import GalleryTemplate from '../components/GalleryTemplate';
import RomanArtifact from '../components/canvas/RomanArtifact';
import romanHistoryData from '../data/romanHistory.json';

const RomanCollection = () => {
  const details = [
    { label: "EMPIRE", value: "ROMAN REPUBLIC" },
    { label: "MATERIAL", value: "PENTELIC MARBLE" },
    { label: "REGION", value: "APPIAN WAY, ROME" }
  ];

  return (
    <GalleryTemplate
      artifact={RomanArtifact}
      category="rome"
      title="THE LEGACY OF CAESAR"
      subtitle="STRENGTH THROUGH ARCHITECTURE & LAW"
      description="The Roman bust represents the 'Veristic' style of the Republic—uncensored realism that captured every wrinkle and scar to honor the wisdom and service of the Roman citizen."
      details={details}
      themeColor="#b58d63"
      noiseScale={0.8}
      speed={0.05}
      historyData={romanHistoryData}
    />
  );
};

export default RomanCollection;
