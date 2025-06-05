interface Federation {
  id: string;
  name: string;
  color: string;
}

interface FederationFilterProps {
  selectedFederation: string;
  onFederationChange: (federation: string) => void;
}

export const FederationFilter = ({ selectedFederation, onFederationChange }: FederationFilterProps) => {
  const federations: Federation[] = [
    { id: 'all', name: 'All', color: 'bg-gray-500' },
    { id: 'wwe', name: 'WWE', color: 'bg-yellow-500' },
    { id: 'aew', name: 'AEW', color: 'bg-black' },
    { id: 'tna', name: 'TNA', color: 'bg-blue-500' }
  ];

  return (
    <div className="flex space-x-2">
      {federations.map((fed) => (
        <button
          key={fed.id}
          onClick={() => onFederationChange(fed.id)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            selectedFederation === fed.id
              ? 'bg-wrestling-electric text-white'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          {fed.name}
        </button>
      ))}
    </div>
  );
};
