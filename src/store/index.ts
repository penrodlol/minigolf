declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses' | 'courseCompanies' | 'topPlayers' | 'games', ...ReadonlyArray<unknown>];
    mutationKey: [
      (
        | 'savePlayer'
        | 'deletePlayer'
        | 'saveCompany'
        | 'deleteCompany'
        | 'saveCourse'
        | 'deleteCourse'
        | 'addGame'
        | 'deleteGame'
      ),
      ...ReadonlyArray<unknown>,
    ];
  }
}

export * from './courses';
export * from './games';
export * from './players';
