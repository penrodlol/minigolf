declare module '@tanstack/react-query' {
  interface Register {
    queryKey: ['players' | 'courseCompanies', ...ReadonlyArray<unknown>];
    mutationKey: [
      'savePlayer' | 'deletePlayer' | 'saveCompany' | 'deleteCompany' | 'saveCourse' | 'deleteCourse',
      ...ReadonlyArray<unknown>,
    ];
  }
}

export * from './courses';
export * from './games';
export * from './players';
