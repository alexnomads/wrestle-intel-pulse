
interface FooterProps {
  filteredItemsLength: number;
}

export const Footer = ({ filteredItemsLength }: FooterProps) => {
  if (filteredItemsLength > 0) {
    return (
      <div className="mt-4 pt-4 border-t border-secondary/50">
        <div className="text-xs text-muted-foreground text-center">
          Showing latest {Math.min(15, filteredItemsLength)} of {filteredItemsLength} items • 
          Auto-refreshing every 10 minutes
        </div>
      </div>
    );
  }
  return null;
};
