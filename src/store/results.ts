import { useQueryClient } from '@tanstack/react-query';

export const useResultsStore = () => {
  const client = useQueryClient();

  return {
    client,
  };
};
