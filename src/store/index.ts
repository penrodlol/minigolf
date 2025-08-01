declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courses' | 'courseCompanies' | 'topPlayers' | 'games' | 'game', ...ReadonlyArray<unknown>];
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
        | 'saveGameHolePlayers'
      ),
      ...ReadonlyArray<unknown>,
    ];
  }
}

export * from './courses';
export * from './game';
export * from './games';
export * from './players';
