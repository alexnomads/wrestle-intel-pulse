
interface EmptyStateProps {
  filteredItemsLength: number;
}

export const EmptyState = ({ filteredItemsLength }: EmptyStateProps) => {
  if (filteredItemsLength === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No items found for the selected filter.
        Try selecting a different filter or check back later.
      </div>
    );
  }
  return null;
};
